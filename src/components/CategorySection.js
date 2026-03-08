import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySection.css';

const categories = [
  {
    id: 1,
    name: 'Shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
    category: 'Shirts'
  },
  {
    id: 2,
    name: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    category: 'T-Shirts'
  },
  {
    id: 3,
    name: 'Formal Wear',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    category: 'Formal'
  },
  {
    id: 4,
    name: 'Casual Wear',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80',
    category: 'Casual'
  }
];

const CategorySection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate('/user/collections', { state: { category } });
  };

  return (
    <section id="categories" className="category-section">
      <div className="category-container">
        <h2 className="category-title">Shop By Category</h2>
        <p className="category-subtitle">Discover Your Style</p>

        <div className="category-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => handleCategoryClick(cat.category)}
            >
              <div className="category-image-wrapper">
                <img src={cat.image} alt={cat.name} className="category-image" />
                <div className="category-overlay">
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-cta">Explore →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
