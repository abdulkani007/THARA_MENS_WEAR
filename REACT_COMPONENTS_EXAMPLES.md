# React Components - Correct API Usage Examples

## ✅ Your Configuration (Already Correct)

### API Config File
**File: `src/config/api.js`**
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';

export const API_ENDPOINTS = {
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GET_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  DELETE_IMAGE: (id) => `${API_BASE_URL}/api/images/${id}`,
  GET_ALL_IMAGES: `${API_BASE_URL}/api/images`,
  API: `${API_BASE_URL}/api`
};

export default API_BASE_URL;
```

## 📝 Example Components

### 1. Product Card Component

```javascript
import React from 'react';
import API_BASE_URL from '../config/api';

const ProductCard = ({ product }) => {
  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return '/placeholder-product.png';
    if (url.startsWith('http')) return url; // Already full URL
    if (url.startsWith('/api')) return `${API_BASE_URL}${url}`; // Relative path
    return url; // Assume it's already correct
  };

  const imageUrl = product.imageURL || product.images?.[0] || '/placeholder-product.png';

  return (
    <div className="product-card">
      <img 
        src={getImageUrl(imageUrl)}
        alt={product.name}
        onError={(e) => { e.target.src = '/placeholder-product.png'; }}
      />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
    </div>
  );
};

export default ProductCard;
```

### 2. Banner Slider Component

```javascript
import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // Fetch banners from Firestore (your existing code)
    // Banners have imageURL field
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '/placeholder-banner.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `${API_BASE_URL}${url}`;
    return url;
  };

  return (
    <div className="banner-slider">
      {banners.map(banner => (
        <img 
          key={banner.id}
          src={getImageUrl(banner.imageURL)}
          alt={banner.title}
          style={{ width: '100%', height: '400px', objectFit: 'cover' }}
        />
      ))}
    </div>
  );
};

export default BannerSlider;
```

### 3. Image Upload Component

```javascript
import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/api';

const ImageUpload = ({ productId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('productId', productId);

      const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      // data.imageUrl will be: https://thara-mens-wear.onrender.com/api/images/...
      onUploadSuccess(data.imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};

export default ImageUpload;
```

### 4. Image Gallery Component

```javascript
import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

const ImageGallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GET_ALL_IMAGES);
      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  return (
    <div className="image-gallery">
      {images.map(image => (
        <div key={image._id} className="image-item">
          <img 
            src={`${API_BASE_URL}/api/images/${image._id}`}
            alt={image.filename}
            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
          />
          <p>{image.filename}</p>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
```

### 5. Product Details Component

```javascript
import React, { useState } from 'react';
import API_BASE_URL from '../config/api';

const ProductDetails = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageUrl = (url) => {
    if (!url) return '/placeholder-product.png';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api')) return `${API_BASE_URL}${url}`;
    return url;
  };

  const images = product.images?.length > 0 
    ? product.images.map(getImageUrl)
    : ['/placeholder-product.png'];

  return (
    <div className="product-details">
      <div className="image-section">
        <img 
          src={images[currentImageIndex]}
          alt={product.name}
          className="main-image"
          onError={(e) => { e.target.src = '/placeholder-product.png'; }}
        />
        
        <div className="thumbnails">
          {images.map((img, index) => (
            <img 
              key={index}
              src={img}
              alt={`${product.name} ${index + 1}`}
              onClick={() => setCurrentImageIndex(index)}
              className={index === currentImageIndex ? 'active' : ''}
            />
          ))}
        </div>
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">₹{product.price}</p>
        <p className="description">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetails;
```

## 🔧 Utility Functions

### Create a utility file for image URLs

**File: `src/utils/imageUtils.js`**
```javascript
import API_BASE_URL from '../config/api';

/**
 * Convert any image URL format to full URL
 * @param {string} url - Image URL (can be full URL, relative path, or image ID)
 * @returns {string} Full image URL
 */
export const getFullImageUrl = (url) => {
  if (!url) return '/placeholder-product.png';
  
  // Already a full URL (http:// or https://)
  if (url.startsWith('http')) return url;
  
  // Relative API path (/api/images/...)
  if (url.startsWith('/api')) return `${API_BASE_URL}${url}`;
  
  // Just an image ID
  if (url.match(/^[a-f0-9]{24}$/i)) {
    return `${API_BASE_URL}/api/images/${url}`;
  }
  
  // Assume it's already correct or a local path
  return url;
};

/**
 * Get multiple image URLs
 * @param {string[]} urls - Array of image URLs
 * @returns {string[]} Array of full image URLs
 */
export const getFullImageUrls = (urls) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return ['/placeholder-product.png'];
  }
  return urls.map(getFullImageUrl);
};
```

### Use the utility in components

```javascript
import React from 'react';
import { getFullImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img 
        src={getFullImageUrl(product.imageURL)}
        alt={product.name}
        onError={(e) => { e.target.src = '/placeholder-product.png'; }}
      />
    </div>
  );
};

export default ProductCard;
```

## ✅ Summary

**Your frontend is already configured correctly!**

All you need to do:

1. **Ensure Vercel has the environment variable:**
   ```
   REACT_APP_API_URL=https://thara-mens-wear.onrender.com
   ```

2. **Redeploy your frontend**

3. **All components should import from config:**
   ```javascript
   import API_BASE_URL from '../config/api';
   // or
   import { API_ENDPOINTS } from '../config/api';
   ```

4. **Use the helper function for images:**
   ```javascript
   const imageUrl = url.startsWith('http') 
     ? url 
     : `${API_BASE_URL}${url}`;
   ```

No localhost URLs will be used in production! ✅
