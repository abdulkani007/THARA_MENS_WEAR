import React, { useState } from 'react';
import { uploadImageToMongoDB } from '../services/imageService';
import toast from 'react-hot-toast';

const ImageInput = ({ images, setImages, maxImages = 5, productId, productName = 'Product' }) => {
  const [uploading, setUploading] = useState({});

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(prev => ({ ...prev, [index]: true }));

    try {
      const imageUrl = await uploadImageToMongoDB(
        file, 
        productId || Date.now().toString(),
        productName,
        file.name
      );
      
      const newImages = [...images];
      newImages[index] = imageUrl;
      setImages(newImages);
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleUrlChange = (value, index) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
  };

  return (
    <div>
      <label style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500', display: 'block', marginBottom: '12px' }}>
        Product Images (Max {maxImages})
      </label>

      {images.slice(0, maxImages).map((img, index) => (
        <div key={index} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, index)}
              style={{ display: 'none' }}
              id={`image-upload-${index}`}
              disabled={uploading[index]}
            />
            <label
              htmlFor={`image-upload-${index}`}
              style={{
                flex: 1,
                padding: '12px',
                background: uploading[index] ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: uploading[index] ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                color: uploading[index] ? '#ff2e2e' : 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.3s ease',
                fontWeight: uploading[index] ? '600' : '400'
              }}
            >
              {uploading[index] ? '⏳ Uploading...' : img ? `✓ Image ${index + 1}` : `📁 Choose Image ${index + 1} ${index === 0 ? '(Required)' : ''}`}
            </label>
            <input
              type="text"
              placeholder="Or paste URL"
              value={img && !uploading[index] ? img : ''}
              onChange={(e) => handleUrlChange(e.target.value, index)}
              disabled={uploading[index]}
              style={{
                flex: 2,
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            {img && !uploading[index] && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 46, 46, 0.2)',
                  border: '1px solid rgba(255, 46, 46, 0.3)',
                  borderRadius: '8px',
                  color: '#ff2e2e',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✕
              </button>
            )}
          </div>
          {img && !uploading[index] && (
            <img
              src={img}
              alt={`Preview ${index + 1}`}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                toast.error(`Failed to load image ${index + 1}`);
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageInput;
