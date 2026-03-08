import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onAddToFavorites, isFavorite }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.imageURL 
    ? [product.imageURL] 
    : ['/placeholder-product.png'];

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  const getTotalStock = () => {
    if (product.stockBySize && Object.keys(product.stockBySize).length > 0) {
      return Object.values(product.stockBySize).reduce((sum, stock) => sum + stock, 0);
    }
    return product.stock || 0;
  };

  const totalStock = getTotalStock();
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isSoldOut = totalStock === 0;

  return (
    <div className="product-card" onClick={() => navigate(`/user/product/${product.id}`)}>
      <div className="product-image-wrapper">
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className="product-image"
          onError={(e) => { e.target.src = '/placeholder-product.png'; }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToFavorites(product);
          }}
          className="favorite-btn"
          aria-label="Add to favorites"
        >
          <FiHeart
            style={{
              fill: isFavorite ? '#ff2e2e' : 'none',
              stroke: isFavorite ? '#ff2e2e' : '#fff',
              transition: 'all 0.3s ease'
            }}
          />
        </button>
        {isSoldOut && (
          <div className="out-of-stock-badge">SOLD OUT</div>
        )}
        {isLowStock && (
          <div className="low-stock-badge">Only {totalStock} left</div>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-footer">
          <span className="product-price">₹{product.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="add-to-cart-btn"
            disabled={isSoldOut}
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
