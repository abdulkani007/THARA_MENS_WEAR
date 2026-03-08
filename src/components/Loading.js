import React, { useEffect, useState } from 'react';
import './Loading.css';
import logo from '../assets/thara-logo2.jpeg';

const Loading = ({ onLoadingComplete }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = logo;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        onLoadingComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, onLoadingComplete]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="logo-wrapper">
          <img 
            src={logo} 
            alt="THARA" 
            className="loading-logo-image"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          <div className="logo-glow"></div>
        </div>
        <p className="loading-subtitle">Men's Wear</p>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
