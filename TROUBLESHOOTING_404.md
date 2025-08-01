# GitHub Pages 404 Troubleshooting Guide

If you're getting a 404 error when visiting your GitHub Pages site, follow this step-by-step guide.

## ✅ What We've Fixed

1. **Base Path Configuration** - Updated `vite.config.ts` to use correct `/graph-storyteller/` path
2. **Build Process** - Ensured production builds use the right base path
3. **GitHub Actions** - Added debugging and proper environment variables
4. **404 Page** - Added a custom 404.html with debugging info

## 🔍 Step-by-Step Debugging

### Step 1: Verify Repository Settings

1. **Go to your repository on GitHub**: `https://github.com/kuanlinhuang/graph-storyteller`
2. **Click "Settings" tab**
3. **Scroll to "Pages" section**
4. **Verify these settings**:
   - ✅ **Source**: "GitHub Actions" (NOT "Deploy from a branch")
   - ✅ **Custom domain**: Leave empty (unless you have one)

### Step 2: Check GitHub Actions

1. **Go to "Actions" tab** in your repository
2. **Look for the latest workflow run**
3. **Check if it completed successfully**:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed
   - 🟡 Yellow circle = Running

4. **If failed, click on it to see error details**

### Step 3: Verify Build Output

1. **In the Actions tab, click on the latest successful run**
2. **Click on the "build" job**
3. **Look for the "List build output" step**
4. **Verify**:
   - ✅ `index.html` exists
   - ✅ Assets folder contains JS/CSS files
   - ✅ Correct base paths in HTML

### Step 4: Test the URLs

Try these URLs in order:

1. **Main site**: `https://kuanlinhuang.github.io/graph-storyteller/`
2. **404 page**: `https://kuanlinhuang.github.io/graph-storyteller/404.html`
3. **Assets**: `https://kuanlinhuang.github.io/graph-storyteller/assets/`

### Step 5: Check Browser Developer Tools

1. **Open your site in browser**
2. **Press F12 to open Developer Tools**
3. **Go to "Network" tab**
4. **Refresh the page**
5. **Look for failed requests (red entries)**

## 🚨 Common Issues & Solutions

### Issue 1: "GitHub Pages source not set to GitHub Actions"
**Solution**: Go to Settings > Pages > Source > Select "GitHub Actions"

### Issue 2: "Workflow failed to run"
**Solution**: 
- Check if Actions are enabled: Settings > Actions > General
- Ensure workflow permissions: Settings > Actions > General > Workflow permissions > "Read and write permissions"

### Issue 3: "Build succeeds but site still shows 404"
**Solution**: 
- Wait 5-10 minutes after deployment
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Try incognito/private browsing mode

### Issue 4: "Assets not loading (blank page)"
**Solution**: 
- Check if base path in `vite.config.ts` matches repository name
- Verify build logs show correct asset paths

### Issue 5: "Repository name mismatch"
**Solution**: 
- Ensure repository is named exactly "graph-storyteller"
- Or update `vite.config.ts` base path to match actual repo name

## 🔧 Manual Fixes

### If the automated fix didn't work:

1. **Check your repository name**:
   ```bash
   node check-repo-name.cjs
   ```

2. **Manually update vite.config.ts** if needed:
   ```typescript
   const base = mode === 'production' ? '/YOUR-ACTUAL-REPO-NAME/' : '/';
   ```

3. **Force rebuild**:
   - Go to Actions tab
   - Click "Build and Deploy to GitHub Pages"
   - Click "Run workflow" button
   - Select your branch and click "Run workflow"

## 📞 Still Not Working?

### Quick Diagnostic Commands:

```bash
# Check repository configuration
node check-repo-name.cjs

# Test local build
NODE_ENV=production npm run build
npm run preview
```

### What to Check:

1. **Repository name**: Must match the path in your URL
2. **Branch**: Workflow should run on your default branch (main/master)
3. **Permissions**: Repository must be public OR you need GitHub Pro for private repos
4. **File paths**: All asset paths should start with `/graph-storyteller/`

### Expected Working URLs:

- ✅ `https://kuanlinhuang.github.io/graph-storyteller/` - Main app
- ✅ `https://kuanlinhuang.github.io/graph-storyteller/404.html` - Custom 404 page

### If All Else Fails:

1. **Create a new repository** named exactly "graph-storyteller"
2. **Push your code** to the new repository
3. **Enable GitHub Pages** with "GitHub Actions" source
4. **Wait for deployment** to complete

The issue should now be resolved! Your Graph Storyteller app should be accessible at the correct URL.
