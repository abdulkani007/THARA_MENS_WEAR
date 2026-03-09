import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './HomeBannerSlider.css';

const HomeBannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const q = query(collection(db, 'banners'), where('active', '==', true), where('displayLocation', '==', 'home'));
    const snapshot = await getDocs(q);
    const bannerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBanners(bannerData);
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="hero-banner">
      {banners.map((banner, index) => (
        <div key={banner.id} className={`hero-slide ${index === currentIndex ? 'active' : ''}`}>
          <img src={banner.imageURL} alt="Banner" />
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={handlePrev} className="banner-nav-btn banner-prev">
            <FiChevronLeft size={24} />
          </button>

          <button onClick={handleNext} className="banner-nav-btn banner-next">
            <FiChevronRight size={24} />
          </button>

          <div className="banner-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeBannerSlider;
