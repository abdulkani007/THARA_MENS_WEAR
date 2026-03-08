import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/thara-logo.jpeg';
import './LandingNavbar.css';

const LandingNavbar = () => {
  const { currentUser } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <Link to="/" className="landing-logo">
          <img src={logo} alt="THARA Men's Wear" className="logo-img" />
        </Link>
        
        <div className="landing-nav-links">
          <Link to="/user" className="landing-nav-link">Shop</Link>
          <Link to="/user/collections" className="landing-nav-link">Collections</Link>
          <a href="#categories" className="landing-nav-link">Categories</a>
          <a href="#trending" className="landing-nav-link">Trending</a>
        </div>

        <div className="landing-nav-actions">
          {currentUser ? (
            <>
              <Link to="/user/cart" className="landing-cart-icon">
                <FiShoppingCart size={22} />
                {cart.length > 0 && <span className="landing-cart-badge">{cart.length}</span>}
              </Link>
              <Link to="/profile" className="landing-profile-icon">
                <FiUser size={22} />
              </Link>
            </>
          ) : (
            <Link to="/login" className="landing-login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
