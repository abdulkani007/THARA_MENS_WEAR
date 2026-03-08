# THARA Favicon Setup Instructions

## Current Status
✅ favicon.svg created (scalable, works in modern browsers)
✅ index.html updated with proper favicon links

## Required Favicon Files

You need to create these PNG files in the `public` folder:

### 1. favicon-16x16.png (16x16 pixels)
- Black background (#000000)
- Red letter "T" (#FF2E2E)
- Bold, centered

### 2. favicon-32x32.png (32x32 pixels)
- Black background (#000000)
- Red letter "T" (#FF2E2E)
- Bold, centered

### 3. apple-touch-icon.png (180x180 pixels)
- Black background (#000000)
- Red letter "T" (#FF2E2E)
- Bold, centered

## How to Create These Files

### Option 1: Use Online Favicon Generator (RECOMMENDED)
1. Go to https://favicon.io/favicon-generator/
2. Settings:
   - Text: T
   - Background: #000000 (black)
   - Font Color: #FF2E2E (red)
   - Font Family: Arial Bold or similar
   - Font Size: Large
   - Shape: Square
3. Click "Download" and extract the files
4. Copy these files to your `public` folder:
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png

### Option 2: Use Photoshop/GIMP/Figma
1. Create a new file with black background
2. Add bold red "T" centered
3. Export as PNG at these sizes: 16x16, 32x32, 180x180

### Option 3: Use RealFaviconGenerator
1. Go to https://realfavicongenerator.net/
2. Upload your THARA logo
3. Customize colors (black bg, red icon)
4. Download and place in public folder

## After Creating Files

1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart React server
3. Hard refresh (Ctrl+Shift+R)

## File Structure
```
public/
├── favicon.svg (✅ Already created)
├── favicon-16x16.png (❌ Need to create)
├── favicon-32x32.png (❌ Need to create)
├── apple-touch-icon.png (❌ Need to create)
└── index.html (✅ Already updated)
```

## Why SVG + PNG?
- SVG: Sharp at all sizes, works in modern browsers
- PNG: Fallback for older browsers, required for iOS
