import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './HeroSlider.css';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const q = query(collection(db, 'banners'), where('active', '==', true), where('displayLocation', '==', 'landing'));
    const snapshot = await getDocs(q);
    const bannerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSlides(bannerData.length > 0 ? bannerData : []);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide, slides]);

  const handleNext = () => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToSlide = (index) => {
    if (isAnimating || index === currentSlide || slides.length === 0) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleShopNow = (link) => {
    navigate(link || '/login');
  };

  if (slides.length === 0) return null;

  return (
    <div className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`hero-slide ${index === currentSlide ? 'active' : ''} ${
            index === currentSlide - 1 || (currentSlide === 0 && index === slides.length - 1) ? 'prev' : ''
          }`}
        >
          <div className="hero-image-wrapper">
            <img src={slide.imageURL} alt={slide.title} className="hero-image" />
            <div className="hero-overlay"></div>
          </div>

          <div className="hero-content">
            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>
            <button className="hero-button" onClick={() => handleShopNow(slide.link)}>
              {slide.buttonText}
            </button>
          </div>
        </div>
      ))}

      <button className="hero-nav hero-nav-prev" onClick={handlePrev}>
        <FiChevronLeft size={32} />
      </button>

      <button className="hero-nav hero-nav-next" onClick={handleNext}>
        <FiChevronRight size={32} />
      </button>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
