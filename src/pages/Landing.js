import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import HeroSlider from '../components/HeroSlider';
import CategorySection from '../components/CategorySection';
import TrendingSection from '../components/TrendingSection';
import BestSellers from '../components/BestSellers';
import PromoBanner from '../components/PromoBanner';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div>
      <LandingNavbar />
      <HeroSlider />
      <CategorySection />
      <TrendingSection />
      <BestSellers />
      <PromoBanner />
      <Footer />
    </div>
  );
};

export default Landing;
