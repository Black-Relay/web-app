# Root Cause Analysis: Events Page Blank Screen in Production

## Problem Statement
When users click on the Events tab in the sidebar or widget on the production environment, they are redirected to a blank screen. The same functionality works perfectly in the development environment.

## Static Code Analysis Findings

### 1. Environment Variable Configuration Issue (PRIMARY ROOT CAUSE)

**Development Environment:**
- Uses `VITE_API_URL` environment variable
- Fallback to `config.json` which has `apiUrl: "http://localhost:3001"`
- EventProvider reads: `import.meta.env.VITE_API_URL || config.apiUrl`
- Works because localhost:3001 is accessible in dev

**Production Environment:**
- Docker build uses build-time argument: `ARG VITE_API_URL=http://localhost:3001`
- This gets baked into the production build
- **PROBLEM**: The production frontend is trying to access `http://localhost:3001`
- In production, "localhost" refers to the USER'S machine, not the server
- The API is actually at `api.blackrelay.l8s.dev` (via Caddy reverse proxy)

**Evidence in Code:**

```typescript
// app/src/providers/EventProvider.tsx (lines 5-10)
const { apiUrl, pollingIntervalMs, subscriptions } = {
  apiUrl: import.meta.env.VITE_API_URL || config.apiUrl,  // ← ISSUE HERE
  pollingIntervalMs: Number(import.meta.env.VITE_POLLING_INTERVAL_MS) || config.pollingIntervalMs,
  subscriptions: config.subscriptions
};
```

```dockerfile
# app/Dockerfile (lines 15-17)
FROM node:24-alpine AS build
ARG VITE_API_URL=http://localhost:3001  # ← WRONG FOR PRODUCTION
ARG VITE_OSM_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}
```

### 2. CORS and Network Request Failures

**What Happens in Production:**

1. User navigates to `/app/events`
2. Events page component renders
3. EventProvider attempts to fetch data from `http://localhost:3001/event`
4. Browser makes request to user's local machine (localhost)
5. **Request fails** - no API server on user's machine
6. EventProvider creates error events but has empty events array
7. Page renders with no data - appears as blank screen

**Actual Production URLs:**
- Frontend: `https://app.blackrelay.l8s.dev`
- API: `https://api.blackrelay.l8s.dev` (should be used)
- Current config: `http://localhost:3001` (WRONG)

### 3. Events Page Dependency Chain

**Events.tsx Dependencies:**
```
Events Page
  ↓ requires
EventProvider (events array)
  ↓ fetches from
apiUrl (http://localhost:3001) ← FAILS IN PRODUCTION
  ↓ results in
Empty events array
  ↓ renders
Blank screen (no error message shown to user)
```

### 4. Why Development Works

**Development Environment:**
- Frontend runs on `http://localhost:5173`
- API runs on `http://localhost:3001`
- Both on same machine, "localhost" resolves correctly
- CORS configured to allow `http://localhost:5173`
- All requests succeed

**Production Environment:**
- Frontend served from `https://app.blackrelay.l8s.dev`
- API served from `https://api.blackrelay.l8s.dev`
- Built with `VITE_API_URL=http://localhost:3001`
- Browser tries to fetch from user's localhost
- **No server listening on user's localhost:3001**
- All requests fail silently

### 5. Error Handling Masks the Problem

**EventProvider Error Handling:**
```typescript
// Lines 127-141
catch(error){
  return [{
    _id: `event-consumer-error-${Date.now()}`,
    category: "ALARM",
    topic: "Network Error",
    data: {
      "service": "Event Consumer",
      "message": "Network error or invalid credentials while fetching events",
      "error": error instanceof Error ? error.message : "Unknown error"
    },
    createdAt: new Date().toISOString(),
    acknowledged: false,
    active: true,
    __v: 0
  }]
}
```

- Errors are converted to ALARM events
- These alarms are displayed as events, not error messages
- User sees "Network Error" event instead of helpful error message
- Page doesn't show a clear "Cannot connect to API" message

### 6. Docker Compose Production Configuration

**br-app service (lines 51-63):**
```yaml
br-app:
  image: ghcr.io/black-relay/app:latest
  container_name: br-app
  restart: unless-stopped
  ports:
    - "8080:8080"
  networks:
    - br-net
  volumes:
    - ./nginx-templates:/etc/nginx/templates
  environment:
    - NGINX_PORT=8080  # ← NO VITE_API_URL set at runtime
  depends_on:
    - br-api
```

**Missing:** No environment variable to override the baked-in localhost URL

### 7. Caddy Routing Configuration

```
app.blackrelay.l8s.dev {
  reverse_proxy br-app:8080
}

api.blackrelay.l8s.dev {
  reverse_proxy br-api:3001
}
```

- Frontend and API are on separate subdomains
- Both use HTTPS in production
- Built JavaScript has hardcoded `http://localhost:3001`
- Requests never reach the actual API

## Root Cause Summary

**Primary Issue:**
The production Docker image is built with `VITE_API_URL=http://localhost:3001`, which gets compiled into the JavaScript bundle. At runtime, the frontend tries to make API requests to the user's localhost instead of the production API server at `https://api.blackrelay.l8s.dev`.

**Secondary Issues:**
1. Build-time environment variables cannot be changed at runtime
2. No runtime environment variable override mechanism
3. Error handling converts connection failures to events, masking the real problem
4. No clear error message shown to users when API is unreachable

## Why This Affects Only Events Page

**Other pages work because:**
- Landing page: No API calls
- Login page: Uses `/auth/login` endpoint, session likely cached or fails gracefully
- Dashboard: May have cached data or shows without events

**Events page fails because:**
- Requires immediate data fetch from EventProvider
- Depends on active polling of `/event` endpoint
- No cached data to fall back on
- Large data dependency (all events)
- React component waits for events array which never populates

## Expected Behavior vs Actual Behavior

**Expected (Production):**
```
User clicks Events
  ↓
Fetch from https://api.blackrelay.l8s.dev/event
  ↓
Return events data
  ↓
Render events table
```

**Actual (Production):**
```
User clicks Events
  ↓
Fetch from http://localhost:3001/event (user's machine)
  ↓
Connection refused / timeout
  ↓
Return empty array / error events
  ↓
Blank screen or minimal content
```

## Verification Steps

To confirm this diagnosis:

1. **Check browser console in production:**
   - Open DevTools → Network tab
   - Navigate to Events page
   - Look for failed requests to `localhost:3001`
   - Check for CORS errors or connection refused errors

2. **Check browser console logs:**
   - Look for "Failed to fetch" errors
   - Check for "Network Error" messages from EventProvider

3. **Inspect built JavaScript:**
   ```bash
   # In production container
   docker exec -it br-app grep -r "localhost:3001" /usr/share/nginx/html/assets/
   ```
   - Should find hardcoded localhost URL in bundled JS

4. **Check API accessibility:**
   ```bash
   curl https://api.blackrelay.l8s.dev/event
   ```
   - Should return 401 (needs auth) or 200 with data
   - Confirms API is reachable

## Recommended Fixes

### Option 1: Use Relative URLs (RECOMMENDED)
Configure API requests to use relative paths or same-domain proxy

### Option 2: Fix Build Arguments
Set correct production API URL during Docker build

### Option 3: Runtime Configuration
Inject API URL at container startup instead of build time

### Option 4: Environment Detection
Detect production environment and use appropriate URL dynamically

## Impact Assessment

**Severity:** HIGH
- Core functionality (Events page) completely broken in production
- Users cannot view or manage events
- Silent failure with no clear error message

**Scope:** 
- Affects all production users
- Events page only (other pages may have similar issues latent)
- Also likely affects: EventProvider polling, subscriptions, event widgets

**Workarounds:**
- None available for end users
- Must be fixed via deployment update

## Related Components Affected

1. **EventProvider.tsx** - Cannot fetch events
2. **Events.tsx** - No data to display
3. **Event widgets on Dashboard** - May show "Network Error" events
4. **Event subscriptions** - Subscription attempts fail
5. **Any component using useEventContext** - Gets empty events array
