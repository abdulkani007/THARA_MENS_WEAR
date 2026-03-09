import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    navigate('/user/checkout');
  };

  return (
    <div className="cart-page page-transition">
      <BackButton to="/user" />
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/user')} className="btn-primary">Continue Shopping</button>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.product.images?.[0] || item.product.imageURL}
                  alt={item.product.name}
                  className="cart-item-image"
                />
                
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="cart-item-details">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' • '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                  )}
                  <p className="cart-item-description">
                    {item.product.description?.substring(0, 60)}...
                  </p>
                  <p className="cart-item-price">₹{item.product.price}</p>
                </div>

                <div className="cart-item-actions">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart-remove-btn"
                  >
                    ✕
                  </button>

                  <div className="cart-quantity">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="cart-summary-row">
              <span className="cart-summary-label">Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span className="cart-summary-label">Shipping</span>
              <span style={{ color: '#4ade80' }}>Free</span>
            </div>

            <div className="cart-summary-divider"></div>

            <div className="cart-summary-total">
              <span>Total</span>
              <span className="cart-summary-total-price">₹{totalPrice.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary" style={{ width: '100%' }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
