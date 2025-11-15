# Quick Test Guide - Session Persistence Fix

## Test Scenario 1: Normal Session Persistence ✓
1. Start containers: `cd docker-compose/dev && docker compose up -d`
2. Navigate to http://localhost:5173/login
3. Log in with `admin` / `admin`
4. Go to dashboard at http://localhost:5173/app/dashboard
5. **Refresh the page (F5)**
6. ✅ **Expected:** Brief "Loading..." → Stay on dashboard (no redirect to login)
7. ❌ **Before fix:** Immediately redirected to login page

## Test Scenario 2: No Session (First Visit) ✓
1. Open browser in incognito/private mode
2. Navigate to http://localhost:5173/app/dashboard
3. ✅ **Expected:** Brief "Loading..." → Redirected to NoAccess page
4. Navigate to http://localhost:5173/login
5. ✅ **Expected:** Login page loads

## Test Scenario 3: Session Expiration ✓
1. Log in successfully
2. Open browser DevTools → Application → Cookies
3. Delete the `authToken` cookie
4. Refresh the page
5. ✅ **Expected:** Brief "Loading..." → Redirected to login/NoAccess

## Test Scenario 4: API Response Check 🔍
**Using curl or browser DevTools Network tab:**

```bash
# Should return 401 (no session)
curl -X GET http://localhost:3001/auth/session -i

# Log in first
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -c cookies.txt -b cookies.txt

# Should return 200 with user data
curl -X GET http://localhost:3001/auth/session \
  -b cookies.txt -c cookies.txt
```

**Expected response from valid session:**
```json
{
  "username": "admin",
  "firstName": null,
  "lastName": null,
  "groups": [...],
  "user_id": "..."
}
```

## Visual Indicators

### Loading State (shown briefly):
```
┌─────────────────────┐
│                     │
│     Loading...      │
│                     │
└─────────────────────┘
```

### After Successful Session Restore:
- Dashboard or Events page renders
- User remains authenticated
- No redirect to login

### After Failed Session Validation:
- Redirect to NoAccess page (for protected routes)
- Login page accessible at /login

## Browser DevTools Checks

### Network Tab:
1. Refresh dashboard page
2. Look for `GET /auth/session` request
3. Check response:
   - **200 OK** → Session valid, user data returned
   - **401 Unauthorized** → No session or expired

### Application Tab → Cookies:
- Should see `authToken` cookie
- httpOnly: ✓
- Secure: depends on environment
- Domain: localhost (dev) or l8s.dev (prod)

### Console Tab:
- Should see no errors during session validation
- If session fails, may see "Session validation error" log

## Common Issues & Fixes

### Issue: Still redirected after refresh
**Check:**
- Is API running? (`docker ps | grep br-api`)
- Is `/auth/session` endpoint responding? (curl test above)
- Check browser console for fetch errors
- Verify cookie domain matches (localhost vs 127.0.0.1)

### Issue: "Loading..." stays forever
**Check:**
- API is reachable
- No CORS errors in console
- `validateSession()` function is not throwing unhandled errors

### Issue: Cookie not being sent
**Check:**
- `credentials: "include"` in fetch call
- Cookie domain matches request origin
- Cookie not expired

## Success Criteria

✅ User stays logged in after page refresh
✅ Session expires after 1 hour (JWT expiration)
✅ No flickering or premature redirects
✅ Loading state shows briefly during validation
✅ Invalid/expired sessions properly redirect to login
✅ Network tab shows successful /auth/session call
✅ No console errors during session check
