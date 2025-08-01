# GitHub Pages Setup Guide

This guide will help you deploy your Graph Storyteller application to GitHub Pages.

## Prerequisites

- GitHub account
- Repository with the Graph Storyteller code
- GitHub Actions enabled (default for public repositories)

## Step-by-Step Setup

### 1. Enable GitHub Pages

1. **Navigate to your repository** on GitHub
2. **Click on "Settings"** tab
3. **Scroll down to "Pages"** in the left sidebar
4. **Under "Source"**, select **"GitHub Actions"**
5. **Save the settings**

### 2. Configure Repository Permissions

1. **Go to Settings > Actions > General**
2. **Under "Workflow permissions"**, select:
   - ✅ **"Read and write permissions"**
   - ✅ **"Allow GitHub Actions to create and approve pull requests"**
3. **Click "Save"**

### 3. Trigger Deployment

The deployment will automatically trigger when you:
- Push to the `main` or `master` branch
- Manually trigger the workflow from the Actions tab

### 4. Monitor Deployment

1. **Go to the "Actions" tab** in your repository
2. **Click on the latest workflow run**
3. **Monitor the build and deploy process**
4. **Wait for both jobs to complete successfully**

### 5. Access Your Site

Once deployed, your site will be available at:
```
https://[your-username].github.io/graph-storyteller/
```

Replace `[your-username]` with your actual GitHub username.

## Troubleshooting

### Common Issues

**❌ "Not Found" Error During Deploy**
- **Solution**: Make sure GitHub Pages is enabled and set to "GitHub Actions"
- **Check**: Repository Settings > Pages > Source = "GitHub Actions"

**❌ Build Fails**
- **Solution**: Check the Actions tab for error details
- **Common Fix**: Ensure all dependencies are properly listed in package.json

**❌ Site Shows 404**
- **Solution**: Wait a few minutes after deployment
- **Check**: Verify the correct URL format with your username

**❌ Assets Not Loading**
- **Solution**: The base path is pre-configured for GitHub Pages
- **Verify**: Check that vite.config.ts has the correct base path

### Manual Deployment

If automatic deployment fails, you can deploy manually:

```bash
# Build the project
npm run build

# The dist/ folder contains your built site
# You can upload this to any static hosting service
```

## Configuration Details

The project includes:
- ✅ **GitHub Actions workflow** (`.github/workflows/deploy.yml`)
- ✅ **Correct base path** configuration in `vite.config.ts`
- ✅ **Proper permissions** setup in the workflow
- ✅ **Optimized build** settings for production

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify your repository settings match this guide
3. Ensure your repository is public or you have GitHub Pro for private repo Pages
4. Review the [GitHub Pages documentation](https://docs.github.com/en/pages)

## Success Indicators

✅ **Workflow completes without errors**
✅ **Both "build" and "deploy" jobs succeed**
✅ **Site loads at the GitHub Pages URL**
✅ **Network counter and all features work**
✅ **Sample data loads correctly**

Your Graph Storyteller application is now live and ready to use!
