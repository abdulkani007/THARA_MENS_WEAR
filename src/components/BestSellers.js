import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import './BestSellers.css';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'products'), where('stock', '>', 0), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="bestsellers-section">
      <div className="bestsellers-container">
        <h2 className="bestsellers-title">Best Sellers</h2>
        <p className="bestsellers-subtitle">Most Popular This Month</p>

        <div className="bestsellers-grid">
          {products.map((product) => (
            <div key={product.id} className="bestseller-card" onClick={() => navigate('/login')}>
              <div className="bestseller-badge">BESTSELLER</div>
              <img
                src={product.images?.[0] || product.imageURL}
                alt={product.name}
                className="bestseller-image"
              />
              <div className="bestseller-info">
                <p className="bestseller-category">{product.category}</p>
                <h3 className="bestseller-name">{product.name}</h3>
                <div className="bestseller-footer">
                  <span className="bestseller-price">₹{product.price}</span>
                  <button className="bestseller-cart-btn">
                    <FiShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
