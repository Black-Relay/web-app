# GitHub Actions - Container Registry Setup

## Workflow Overview

The `build-and-push-images.yml` workflow automatically builds and pushes Docker container images to GitHub Container Registry (ghcr.io) when a pull request is merged into the `main` branch.

## Images Built

The workflow builds and pushes three container images:

1. **ghcr.io/black-relay/api** - Express API backend (production runtime)
2. **ghcr.io/black-relay/app** - React frontend (Nginx runtime)
3. **ghcr.io/black-relay/dummy-data** - Dummy sensor data generator

## Image Tagging Strategy

Each image is automatically tagged with:
- `latest` - Latest version from main branch
- `main-<sha>` - Git commit SHA for traceability
- Semantic version tags (if using git tags like `v1.0.0`)
- PR number (for PR-triggered builds)

## GitHub Configuration Required

### Secrets

**No secrets need to be manually added!** The workflow uses `secrets.GITHUB_TOKEN` which is automatically provided by GitHub Actions with the necessary permissions to push to ghcr.io.

### Variables (Optional but Recommended)

Add these repository variables in **Settings → Secrets and variables → Actions → Variables**:

| Variable Name | Description | Default Value | Required |
|--------------|-------------|---------------|----------|
| `VITE_API_URL` | Frontend API endpoint URL for production builds | `http://localhost:3001` | No |

**To add variables:**
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click the **Variables** tab
4. Click **New repository variable**
5. Add the variable name and value

### Recommended Production Values

```
VITE_API_URL=https://api.your-domain.com
```

## Repository Permissions

The workflow requires the following permissions (already configured in the workflow):
- ✅ `contents: read` - To checkout code
- ✅ `packages: write` - To push to ghcr.io

These permissions are automatically granted to the `GITHUB_TOKEN` when the workflow runs.

## Package Visibility

After the first successful workflow run, you'll need to make the container images public or configure access:

1. Go to your repository's main page
2. Click on **Packages** (right sidebar)
3. Click on each image (api, app, dummy-data)
4. Go to **Package settings**
5. Under **Danger Zone**, choose:
   - **Change visibility** → **Public** (to allow public pulls)
   - Or configure **Manage Actions access** for private packages

## Usage

### Triggering the Workflow

The workflow automatically runs when:
- A pull request is **merged** (not just closed) into the `main` branch

### Manual Trigger (Optional Enhancement)

To enable manual triggering, add this to the workflow's `on:` section:
```yaml
on:
  workflow_dispatch:  # Add this line
  pull_request:
    types: [closed]
    branches:
      - main
```

### Pulling Images

After images are pushed, you can pull them:

```bash
# Pull the latest API image
docker pull ghcr.io/black-relay/api:latest

# Pull the latest frontend image
docker pull ghcr.io/black-relay/app:latest

# Pull the dummy data generator
docker pull ghcr.io/black-relay/dummy-data:latest

# Pull a specific commit SHA
docker pull ghcr.io/black-relay/api:main-abc1234
```

### Using in Docker Compose

Update your docker-compose files to use the registry images:

```yaml
services:
  br-api:
    image: ghcr.io/black-relay/api:latest
    # Remove the 'build' section

  br-app:
    image: ghcr.io/black-relay/app:latest
    # Remove the 'build' section

  br-dummy-data:
    image: ghcr.io/black-relay/dummy-data:latest
    # Remove the 'build' section
```

## Workflow Features

- ✅ **Multi-stage builds** - Uses Docker Buildx for efficient builds
- ✅ **Build caching** - Leverages GitHub Actions cache for faster builds
- ✅ **Matrix strategy** - Builds all images in parallel
- ✅ **Automatic tagging** - Smart tagging based on git refs and SHAs
- ✅ **Build summaries** - Generates helpful summaries in the Actions UI
- ✅ **Security** - Uses GITHUB_TOKEN with minimal required permissions

## Troubleshooting

### "permission denied" when pushing images

**Solution:** Ensure the workflow has `packages: write` permission (already configured).

### Images not appearing in Packages

**Solution:** Check the workflow run logs. The first run should create the packages automatically.

### Build failing for frontend (app)

**Solution:** Ensure `VITE_API_URL` variable is set if you need a custom API URL for the build.

### Want to build images for other branches?

Modify the `branches:` section in the workflow:
```yaml
on:
  pull_request:
    types: [closed]
    branches:
      - main
      - staging  # Add other branches here
```

## Next Steps

1. ✅ Merge a PR into `main` to trigger the first build
2. ✅ Check the Actions tab to monitor the build progress
3. ✅ Visit Packages to configure visibility
4. ✅ Update production docker-compose files to use registry images
5. ✅ Set the `VITE_API_URL` variable for production builds
