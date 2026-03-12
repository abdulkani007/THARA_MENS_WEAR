import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './OrderSuccess.css';

const OrderSuccess = () => {
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
    <div className="order-success-page">
      <div className="success-container">
        {/* Animated Success Icon */}
        <div className="success-icon-container">
          <motion.div
            className="success-circle"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.svg
              className="success-checkmark"
              viewBox="0 0 100 100"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#66FCF1"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              <motion.path
                d="M25 50 L40 65 L75 30"
                fill="none"
                stroke="#FF2E2E"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Success Content */}
        <motion.div
          className="success-content"
          initial={{ opacity: 0, y: 30 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="success-title">
            Order Successful 🎉
          </h1>
          
          <p className="success-message">
            Your order has been placed successfully.
          </p>

          <div className="order-details">
            <div className="order-id">
              <span className="order-id-label">Order ID:</span>
              <span className="order-id-value">#{orderId.substring(0, 8)}</span>
            </div>
            
            {orderTotal > 0 && (
              <div className="order-total">
                <span className="order-total-label">Total Amount:</span>
                <span className="order-total-value">₹{orderTotal}</span>
              </div>
            )}
          </div>

          <p className="confirmation-note">
            You will receive a confirmation email shortly.
          </p>

          {/* Action Buttons */}
          <div className="success-actions">
            <motion.button
              className="track-order-btn"
              onClick={handleTrackOrder}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Track Order
            </motion.button>
            
            <motion.button
              className="continue-shopping-btn"
              onClick={handleContinueShopping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Continue Shopping
            </motion.button>
          </div>
        </motion.div>

        {/* Floating Particles Animation */}
        <div className="floating-particles">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                y: [0, -100, -200]
              }}
              transition={{ 
                duration: 3, 
                delay: 1.5 + i * 0.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;