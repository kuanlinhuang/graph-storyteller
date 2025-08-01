# Deployment Guide

This document provides comprehensive deployment instructions for the Graph Storyteller application.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo at vercel.com
```

### 2. Netlify
```bash
# Build the project
npm run build

# Drag and drop the 'dist' folder to netlify.com
# Or connect your GitHub repo at netlify.com
```

### 3. GitHub Pages (Configured)
1. **Push your code to GitHub**
2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
3. **The workflow will automatically deploy** when you push to main/master branch
4. **Your site will be available at**: `https://yourusername.github.io/graph-storyteller/`

**Note**: The project is pre-configured with the correct base path for GitHub Pages.

### 4. Docker
```bash
# Build the Docker image
docker build -t graph-storyteller .

# Run the container
docker run -p 80:80 graph-storyteller
```

## 📋 Pre-Deployment Checklist

- [x] ✅ Build process works (`npm run build`)
- [x] ✅ No critical linting errors
- [x] ✅ All dependencies installed
- [x] ✅ Counter functionality implemented
- [x] ✅ Export functionality working
- [x] ✅ Sample data loading correctly
- [x] ✅ Responsive design tested
- [x] ✅ Browser compatibility verified

## 🔧 Build Configuration

The project uses Vite for building with the following optimizations:
- Code splitting for optimal loading
- Tree shaking to remove unused code
- Asset optimization and compression
- Modern ES modules with fallbacks

## 🌐 Environment Requirements

- **Node.js**: Version 18 or higher
- **Browser Support**: Modern browsers with ES2020+ support
- **Memory**: Minimum 512MB RAM for build process
- **Storage**: ~50MB for built assets

## 📊 Performance Metrics

After deployment, expect:
- **Initial Load**: ~355KB gzipped JavaScript
- **CSS**: ~14KB gzipped
- **First Contentful Paint**: < 2s on 3G
- **Time to Interactive**: < 3s on 3G

## 🔒 Security Considerations

The application includes:
- Content Security Policy headers
- XSS protection
- Frame options security
- No sensitive data exposure
- Client-side only data processing

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Update browsers list: `npm update caniuse-lite`

### Runtime Issues
- Check browser console for errors
- Verify sample data files are accessible
- Ensure proper MIME types for JSON files

### Performance Issues
- Enable gzip compression on your server
- Use CDN for static assets
- Consider implementing service worker for caching

## 📈 Monitoring

After deployment, monitor:
- Network visualization counter (stored in localStorage)
- Error rates in browser console
- Performance metrics via browser dev tools
- User feedback and usage patterns

## 🔄 Updates

To update the deployment:
1. Make changes to the codebase
2. Test locally with `npm run dev`
3. Build with `npm run build`
4. Deploy using your chosen method
5. Verify functionality in production

## 📞 Support

For deployment issues:
- Check the GitHub Issues page
- Review the README.md for detailed setup instructions
- Verify all configuration files are properly set up
