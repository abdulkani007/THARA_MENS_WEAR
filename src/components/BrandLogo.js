import React from 'react';
import logo from '../assets/thara-logo.jpeg';

const BrandLogo = ({ size = 40, className = '' }) => {
  return (
    <img
      src={logo}
      alt="THARA Men's Wear"
      className={className}
      style={{ height: `${size}px`, width: 'auto', objectFit: 'contain' }}
    />
  );
};

export default BrandLogo;
