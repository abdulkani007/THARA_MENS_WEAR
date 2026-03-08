import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PromoBanner.css';

const PromoBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="promo-banner">
      <div className="promo-content">
        <div className="promo-text">
          <h2 className="promo-title">WINTER SALE</h2>
          <p className="promo-subtitle">Up to 50% OFF on Selected Items</p>
          <p className="promo-code">Use Code: <span>WINTER50</span></p>
        </div>
        <button className="promo-btn" onClick={() => navigate('/login')}>
          Shop Sale
        </button>
      </div>
    </section>
  );
};

export default PromoBanner;
