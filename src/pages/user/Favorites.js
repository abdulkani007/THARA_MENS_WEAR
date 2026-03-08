import React from 'react';
import { useCart } from '../../context/CartContext';
import BackButton from '../../components/BackButton';
import './Favorites.css';

const Favorites = () => {
  const { favorites, addToCart, addToFavorites } = useCart();

  return (
    <div className="favorites-page page-transition">
      <BackButton to="/user" />
      <div className="favorites-header">
        <h1 className="favorites-title">My Favorites</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <p>No favorites yet</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(item => (
            <div key={item.id} className="favorite-card">
              <div className="favorite-image-wrapper">
                <img
                  src={item.product.imageURL}
                  alt={item.product.name}
                  className="favorite-image"
                />
                <button
                  onClick={() => addToFavorites(item.product)}
                  className="favorite-remove-btn"
                >
                  ❤️
                </button>
              </div>
              
              <div className="favorite-info">
                <h3>{item.product.name}</h3>
                <p className="favorite-description">
                  {item.product.description?.substring(0, 80)}...
                </p>
                <div className="favorite-footer">
                  <p className="favorite-price">₹{item.product.price}</p>
                  <button onClick={() => addToCart(item.product)} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
