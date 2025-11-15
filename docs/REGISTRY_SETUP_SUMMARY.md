# GitHub Container Registry Setup - Quick Reference

## ✅ Changes Made

1. **Created new branch:** `main-github-actions`
2. **Added workflow file:** `.github/workflows/build-and-push-images.yml`
3. **Added documentation:** `docs/GITHUB_ACTIONS_REGISTRY.md`

## 🎯 What the Workflow Does

When a pull request is **merged** into `main`, the workflow automatically:
- Builds 3 Docker images in parallel:
  - `ghcr.io/black-relay/api` (Express backend)
  - `ghcr.io/black-relay/app` (React frontend with Nginx)
  - `ghcr.io/black-relay/dummy-data` (Sensor data generator)
- Tags images with `latest`, commit SHA, and semantic versions
- Pushes images to GitHub Container Registry (ghcr.io)
- Uses build caching for faster subsequent builds

## 🔐 GitHub Secrets & Variables Required

### Secrets: **NONE! ✨**

The workflow uses GitHub's automatic `GITHUB_TOKEN` - no manual secrets needed!

### Variables (Repository Variables): **OPTIONAL**

Add in **Settings → Secrets and variables → Actions → Variables**:

| Variable Name | Purpose | Default | Recommended Production Value |
|--------------|---------|---------|------------------------------|
| `VITE_API_URL` | Frontend API endpoint | `http://localhost:3001` | `https://api.your-domain.com` |

**Adding variables is optional** - the workflow will work without them using defaults.

## 📋 Post-Merge Setup (One-Time)

After the first successful workflow run:

1. **Make packages public** (if desired):
   - Go to repository → **Packages** → Select each image
   - **Package settings** → **Change visibility** → **Public**

2. **Or configure private access**:
   - **Package settings** → **Manage Actions access**
   - Add teams/users who need access

## 🚀 How to Use

### Trigger the workflow:
```bash
# Merge a PR into main - workflow runs automatically
```

### Pull images after they're published:
```bash
docker pull ghcr.io/black-relay/api:latest
docker pull ghcr.io/black-relay/app:latest
docker pull ghcr.io/black-relay/dummy-data:latest
```

### Use in docker-compose:
```yaml
services:
  br-api:
    image: ghcr.io/black-relay/api:latest
  br-app:
    image: ghcr.io/black-relay/app:latest
  br-dummy-data:
    image: ghcr.io/black-relay/dummy-data:latest
```

## 📝 Current Git Status

Branch: `main-github-actions`

Staged files (ready to commit):
- `.github/workflows/build-and-push-images.yml`
- `docs/GITHUB_ACTIONS_REGISTRY.md`

Unstaged changes (left as-is per your request):
- Various existing modified files

## 🎬 Next Steps

1. Review the files locally
2. Commit when ready: `git commit -m "Add GitHub Actions workflow for container registry"`
3. Push the branch: `git push -u origin main-github-actions`
4. Create a PR to main
5. Merge the PR to test the workflow
6. Configure package visibility in GitHub
7. (Optional) Add `VITE_API_URL` variable for production builds

## 📖 Full Documentation

See `docs/GITHUB_ACTIONS_REGISTRY.md` for complete details including:
- Troubleshooting guide
- Manual trigger setup
- Advanced tagging options
- Using images in production
