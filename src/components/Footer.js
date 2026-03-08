import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FiMapPin, FiPhone, FiInstagram, FiFacebook, FiTwitter, FiMessageCircle } from 'react-icons/fi';
import logo from '../assets/thara-logo.jpeg';
import './Footer.css';

const Footer = () => {
  const [businessInfo, setBusinessInfo] = useState({
    address: 'Veppur Near Bus Stand',
    phone1: '8838810060',
    phone2: '9789185062',
    instagram: 'https://www.instagram.com/thara_mens_new?igsh=MXBncGRuYm9odDM1dg==',
    facebook: '',
    twitter: '',
    whatsapp: ''
  });

  useEffect(() => {
    loadBusinessInfo();
  }, []);

  const loadBusinessInfo = async () => {
    try {
      const businessDoc = await getDoc(doc(db, 'settings', 'businessInfo'));
      if (businessDoc.exists()) {
        setBusinessInfo(businessDoc.data());
      }
    } catch (error) {
      console.error('Error loading business info:', error);
    }
  };
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logo} alt="THARA Men's Wear" className="footer-logo" />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <a 
              href={businessInfo.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-social"
            >
              <FiInstagram />
            </a>
            {businessInfo.facebook && (
              <a 
                href={businessInfo.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social"
              >
                <FiFacebook />
              </a>
            )}
            {businessInfo.twitter && (
              <a 
                href={businessInfo.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social"
              >
                <FiTwitter />
              </a>
            )}
            {businessInfo.whatsapp && (
              <a 
                href={`https://wa.me/${businessInfo.whatsapp}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social"
              >
                <FiMessageCircle />
              </a>
            )}
          </div>
        </div>

        <div className="footer-info">
          <div className="footer-section">
            <div className="footer-icon">
              <FiMapPin />
            </div>
            <div>
              <h3>Address</h3>
              <p>{businessInfo.address}</p>
            </div>
          </div>

          <div className="footer-section">
            <div className="footer-icon">
              <FiPhone />
            </div>
            <div>
              <h3>Contact</h3>
              <p>{businessInfo.phone1}</p>
              <p>{businessInfo.phone2}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} THARA Men's Wear. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
