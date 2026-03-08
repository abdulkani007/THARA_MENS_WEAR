import React, { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './TrendingSection.css';

const TrendingSection = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleProductClick = () => {
    navigate('/login');
  };

  return (
    <section id="trending" className="trending-section">
      <div className="trending-container">
        <h2 className="trending-title">New Arrivals</h2>
        <p className="trending-subtitle">Fresh Styles Just Dropped</p>

        <div className="trending-grid">
          {products.map((product) => (
            <div key={product.id} className="trending-card" onClick={handleProductClick}>
              <div className="trending-image-wrapper">
                <img
                  src={product.images?.[0] || product.imageURL}
                  alt={product.name}
                  className="trending-image"
                />
                <button className="trending-wishlist">
                  <FiHeart size={20} />
                </button>
                <div className="trending-quick-view">Quick View</div>
              </div>

              <div className="trending-info">
                <h3 className="trending-product-name">{product.name}</h3>
                <p className="trending-product-category">{product.category}</p>
                <div className="trending-price-row">
                  <span className="trending-price">₹{product.price}</span>
                  {product.stock < 10 && product.stock > 0 && (
                    <span className="trending-stock">Only {product.stock} left</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="trending-cta">
          <button className="trending-view-all" onClick={() => navigate('/user/collections')}>
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
