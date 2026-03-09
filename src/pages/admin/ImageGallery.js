import React, { useState, useEffect } from 'react';
import { getAllImages } from '../../services/imageService';
import { API_BASE_URL } from '../../config/api';
import toast from 'react-hot-toast';
import { FiImage, FiCalendar, FiFile } from 'react-icons/fi';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await getAllImages();
      setImages(data);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(img => 
    img.productName?.toLowerCase().includes(filter.toLowerCase()) ||
    img.fileName?.toLowerCase().includes(filter.toLowerCase()) ||
    img.productId?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Image Gallery</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Total Images: {images.length}
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by product name, file name, or ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {filteredImages.map((image) => (
          <div
            key={image._id}
            className="card"
            style={{
              padding: '16px',
              transition: 'transform 0.3s ease'
            }}
          >
            <img
              src={`${API_BASE_URL}/api/images/${image._id}`}
              alt={image.productName}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiImage size={16} style={{ color: '#ff2e2e' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>
                {image.productName || 'Untitled'}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FiFile size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {image.fileName || 'image.jpg'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FiCalendar size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>

            <p style={{ 
              fontSize: '11px', 
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '8px',
              wordBreak: 'break-all'
            }}>
              ID: {image.productId}
            </p>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {filter ? 'No images found matching your search' : 'No images uploaded yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
