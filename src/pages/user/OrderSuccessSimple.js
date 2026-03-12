import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderSuccessSimple.css';

const OrderSuccessSimple = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  
  // Get order data from navigation state
  const orderData = location.state?.orderData || {};
  const orderId = orderData.orderId || 'N/A';
  const orderTotal = orderData.totalPrice || 0;

  useEffect(() => {
    // Show content after initial animation
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleTrackOrder = () => {
    navigate('/user/orders');
  };

  const handleContinueShopping = () => {
    navigate('/user');
  };

  return (
    <div className="order-success-page-simple">
      <div className="success-container-simple">
        {/* Animated Success Icon */}
        <div className="success-icon-container-simple">
          <div className="success-circle-simple">
            <svg className="success-checkmark-simple" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#66FCF1"
                strokeWidth="4"
                className="circle-animation"
              />
              <path
                d="M25 50 L40 65 L75 30"
                fill="none"
                stroke="#FF2E2E"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="checkmark-animation"
              />
            </svg>
          </div>
        </div>

        {/* Success Content */}
        <div className={`success-content-simple ${showContent ? 'show' : ''}`}>
          <h1 className="success-title-simple">
            Order Successful 🎉
          </h1>
          
          <p className="success-message-simple">
            Your order has been placed successfully.
          </p>

          <div className="order-details-simple">
            <div className="order-id-simple">
              <span className="order-id-label-simple">Order ID:</span>
              <span className="order-id-value-simple">#{orderId.substring(0, 8)}</span>
            </div>
            
            {orderTotal > 0 && (
              <div className="order-total-simple">
                <span className="order-total-label-simple">Total Amount:</span>
                <span className="order-total-value-simple">₹{orderTotal}</span>
              </div>
            )}
          </div>

          <p className="confirmation-note-simple">
            You will receive a confirmation email shortly.
          </p>

          {/* Action Buttons */}
          <div className="success-actions-simple">
            <button
              className="track-order-btn-simple"
              onClick={handleTrackOrder}
            >
              Track Order
            </button>
            
            <button
              className="continue-shopping-btn-simple"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="floating-particles-simple">
          <div className="particle-simple particle-1"></div>
          <div className="particle-simple particle-2"></div>
          <div className="particle-simple particle-3"></div>
          <div className="particle-simple particle-4"></div>
          <div className="particle-simple particle-5"></div>
          <div className="particle-simple particle-6"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessSimple;