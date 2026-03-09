import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';
import logo from '../assets/thara-logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
      setMobileMenuOpen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="THARA Men's Wear" />
        </Link>
        
        <button 
          className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {currentUser ? (
            <>
              {userRole === 'admin' ? (
                <>
                  <Link to="/admin" className={`navbar-link ${isActive('/admin') ? 'active' : ''}`} onClick={closeMenu}>Dashboard</Link>
                  <Link to="/profile" className={`navbar-link ${isActive('/profile') ? 'active' : ''}`} onClick={closeMenu}>Profile</Link>
                  <button onClick={handleLogout} className="btn-primary">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/user" className={`navbar-link ${isActive('/user') ? 'active' : ''}`} onClick={closeMenu}>Home</Link>
                  <Link to="/user/collections" className={`navbar-link ${isActive('/user/collections') ? 'active' : ''}`} onClick={closeMenu}>Collections</Link>
                  <Link to="/user/accessories" className={`navbar-link ${isActive('/user/accessories') ? 'active' : ''}`} onClick={closeMenu}>Accessories</Link>
                  <Link to="/user/kids" className={`navbar-link ${isActive('/user/kids') ? 'active' : ''}`} onClick={closeMenu}>Kids</Link>
                  <Link to="/user/favorites" className={`navbar-link ${isActive('/user/favorites') ? 'active' : ''}`} onClick={closeMenu}>Favorites</Link>
                  <Link to="/user/cart" className={`navbar-link ${isActive('/user/cart') ? 'active' : ''}`} onClick={closeMenu}>
                    Cart
                    {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                  </Link>
                  <Link to="/user/orders" className={`navbar-link ${isActive('/user/orders') ? 'active' : ''}`} onClick={closeMenu}>Orders</Link>
                  <Link to="/profile" className={`navbar-link ${isActive('/profile') ? 'active' : ''}`} onClick={closeMenu}>Profile</Link>
                  <button onClick={handleLogout} className="btn-primary">Logout</button>
                </>
              )}
            </>
          ) : (
            <Link to="/login" onClick={closeMenu}>
              <button className="btn-primary">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
