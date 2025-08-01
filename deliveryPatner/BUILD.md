# Delivery Partner App - Build Guide

## 🚀 Build Commands

### Development Build
```bash
npm run build:dev
```
- Uses `.env` file (localhost:5000)
- Includes source maps for debugging
- Larger bundle size for development

### Production Build
```bash
npm run build:prod
```
- Uses `.env.production` file (https://api.shopatb2b.com)
- Minified and optimized for production
- Smaller bundle size

## 📁 Environment Files

### Development (`.env`)
```
VITE_API_URL=http://localhost:5000
```

### Production (`.env.production`)
```
VITE_API_URL=https://api.shopatb2b.com
```

## 📦 Build Output

Both builds create a `dist/` folder with:
- `index.html` - Main HTML file
- `assets/` - JavaScript, CSS, and image files
- Optimized and chunked bundles for better performance

## 🔧 Usage

1. **Development**: Use `npm run build:dev` for local testing
2. **Production**: Use `npm run build:prod` for deployment
3. **Preview**: Use `npm run preview` to test the built app locally

## 📊 Build Comparison

| Feature | Development | Production |
|---------|-------------|------------|
| API URL | localhost:5000 | api.shopatb2b.com |
| Source Maps | ✅ | ❌ |
| Minification | ❌ | ✅ |
| Bundle Size | Larger | Smaller |
| Debug Info | ✅ | ❌ | 