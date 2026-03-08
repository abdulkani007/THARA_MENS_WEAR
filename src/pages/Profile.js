import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiPackage, FiEdit2, FiMapPin, FiSave, FiX, FiChevronLeft, FiLogOut, FiPhone, FiInstagram, FiInfo, FiFacebook, FiTwitter, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import logo from '../assets/thara-logo.jpeg';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ orders: 0, favorites: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingBusinessInfo, setEditingBusinessInfo] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    address: 'Veppur Near Bus Stand',
    phone1: '8838810060',
    phone2: '9789185062',
    instagram: 'https://www.instagram.com/thara_mens_new?igsh=MXBncGRuYm9odDM1dg==',
    facebook: '',
    twitter: '',
    whatsapp: ''
  });
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    loadUserData();
    if (userData?.role === 'admin') {
      loadBusinessInfo();
    }
  }, [currentUser, userData?.role]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        if (data.address) {
          setAddressForm(data.address);
        }
      }

      const ordersQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
      const ordersSnap = await getDocs(ordersQuery);
      const ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, orders: ordersData.length }));
      setRecentOrders(ordersData.slice(0, 3));

      const favQuery = query(collection(db, 'favorites'), where('userId', '==', currentUser.uid));
      const favSnap = await getDocs(favQuery);
      setStats(prev => ({ ...prev, favorites: favSnap.size }));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveBusinessInfo = async () => {
    if (!businessInfo.address || !businessInfo.phone1 || !businessInfo.phone2 || !businessInfo.instagram) {
      toast.error('Please fill all required fields (address, phones, Instagram)');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'businessInfo'), businessInfo);
      setEditingBusinessInfo(false);
      toast.success('Business information updated successfully');
    } catch (error) {
      toast.error('Failed to update business information');
    }
  };

  const handleSaveAddress = async () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    if (addressForm.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    if (addressForm.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        address: addressForm
      });
      setUserData(prev => ({ ...prev, address: addressForm }));
      setEditingAddress(false);
      toast.success('Address saved successfully');
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleCancelEdit = () => {
    if (userData?.address) {
      setAddressForm(userData.address);
    }
    setEditingAddress(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="profile-page page-transition">
      <button onClick={() => navigate(-1)} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        marginBottom: '24px',
        transition: 'all 0.3s ease',
        fontSize: '14px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#FF2E2E';
        e.currentTarget.style.background = 'rgba(255, 46, 46, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.background = 'transparent';
      }}>
        <FiChevronLeft /> Back
      </button>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src={logo} alt="THARA" style={{ height: '60px', width: 'auto' }} />
      </div>

      <h1 className="profile-title">My Profile</h1>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userData?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{userData?.email?.split('@')[0]}</h2>
              <p>{userData?.email}</p>
              <span className={`role-badge ${userData?.role}`}>
                {userData?.role}
              </span>
            </div>
          </div>

          {userData?.role !== 'admin' && (
            <div className="profile-stats">
              <div className="stat-card" onClick={() => navigate('/user/orders')}>
                <FiShoppingBag size={24} />
                <div>
                  <p className="stat-value">{stats.orders}</p>
                  <p className="stat-label">Total Orders</p>
                </div>
              </div>

              <div className="stat-card" onClick={() => navigate('/user/favorites')}>
                <FiHeart size={24} />
                <div>
                  <p className="stat-value">{stats.favorites}</p>
                  <p className="stat-label">Saved Items</p>
                </div>
              </div>
            </div>
          )}

          <div className="profile-details">
            <h3>Account Details</h3>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{userData?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {userData?.createdAt?.toDate().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>

          {userData?.role === 'admin' && (
            <div className="address-section">
              <div className="address-header">
                <h3><FiInfo /> Business Information (Footer)</h3>
                {!editingBusinessInfo && (
                  <button onClick={() => setEditingBusinessInfo(true)} className="edit-address-btn">
                    <FiEdit2 /> Edit
                  </button>
                )}
              </div>

              {editingBusinessInfo ? (
                <div className="address-form">
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Store Address</label>
                    <input
                      type="text"
                      placeholder="Store Address"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <div>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Phone 1</label>
                      <input
                        type="tel"
                        placeholder="Phone Number 1"
                        value={businessInfo.phone1}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone1: e.target.value })}
                        maxLength="10"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Phone 2</label>
                      <input
                        type="tel"
                        placeholder="Phone Number 2"
                        value={businessInfo.phone2}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone2: e.target.value })}
                        maxLength="10"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Instagram URL *</label>
                    <input
                      type="url"
                      placeholder="Instagram Profile URL"
                      value={businessInfo.instagram}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, instagram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Facebook URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="Facebook Page URL"
                      value={businessInfo.facebook || ''}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, facebook: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>Twitter URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="Twitter Profile URL"
                      value={businessInfo.twitter || ''}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, twitter: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', display: 'block' }}>WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="WhatsApp Number with country code (e.g., 918838810060)"
                      value={businessInfo.whatsapp || ''}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="address-actions">
                    <button onClick={() => setEditingBusinessInfo(false)} className="cancel-btn">
                      <FiX /> Cancel
                    </button>
                    <button onClick={handleSaveBusinessInfo} className="save-btn">
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="address-display">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiMapPin style={{ color: '#FF2E2E' }} />
                    <p className="address-text" style={{ margin: 0 }}>{businessInfo.address}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FiPhone style={{ color: '#FF2E2E' }} />
                    <p className="address-text" style={{ margin: 0 }}>{businessInfo.phone1}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiPhone style={{ color: '#FF2E2E' }} />
                    <p className="address-text" style={{ margin: 0 }}>{businessInfo.phone2}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiInstagram style={{ color: '#FF2E2E' }} />
                    <a href={businessInfo.instagram} target="_blank" rel="noopener noreferrer" className="address-text" style={{ margin: 0, color: '#3b82f6', textDecoration: 'none' }}>Instagram</a>
                  </div>
                  {businessInfo.facebook && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <FiFacebook style={{ color: '#FF2E2E' }} />
                      <a href={businessInfo.facebook} target="_blank" rel="noopener noreferrer" className="address-text" style={{ margin: 0, color: '#3b82f6', textDecoration: 'none' }}>Facebook</a>
                    </div>
                  )}
                  {businessInfo.twitter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <FiTwitter style={{ color: '#FF2E2E' }} />
                      <a href={businessInfo.twitter} target="_blank" rel="noopener noreferrer" className="address-text" style={{ margin: 0, color: '#3b82f6', textDecoration: 'none' }}>Twitter</a>
                    </div>
                  )}
                  {businessInfo.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <FiMessageCircle style={{ color: '#FF2E2E' }} />
                      <a href={`https://wa.me/${businessInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="address-text" style={{ margin: 0, color: '#3b82f6', textDecoration: 'none' }}>WhatsApp</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {userData?.role !== 'admin' && (
            <div className="address-section">
            <div className="address-header">
              <h3><FiMapPin /> Shipping Address</h3>
              {!editingAddress && (
                <button onClick={() => setEditingAddress(true)} className="edit-address-btn">
                  <FiEdit2 /> {userData?.address ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {editingAddress ? (
              <div className="address-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (10 digits)"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    maxLength="10"
                  />
                </div>
                <textarea
                  placeholder="Street Address"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  rows="2"
                />
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Pincode (6 digits)"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    maxLength="6"
                  />
                </div>
                <div className="address-actions">
                  <button onClick={handleCancelEdit} className="cancel-btn">
                    <FiX /> Cancel
                  </button>
                  <button onClick={handleSaveAddress} className="save-btn">
                    <FiSave /> Save Address
                  </button>
                </div>
              </div>
            ) : userData?.address ? (
              <div className="address-display">
                <p className="address-name">{userData.address.name}</p>
                <p className="address-phone">{userData.address.phone}</p>
                <p className="address-text">{userData.address.address}</p>
                <p className="address-text">
                  {userData.address.city}, {userData.address.state} - {userData.address.pincode}
                </p>
              </div>
            ) : (
              <p className="no-address">No address added yet. Click "Add" to add your shipping address.</p>
            )}
          </div>
          )}
        </div>

        {recentOrders.length > 0 && (
          <div className="recent-orders-card">
            <div className="card-header">
              <h3><FiPackage /> Recent Orders</h3>
              <button onClick={() => navigate('/user/orders')} className="view-all-link">
                View All
              </button>
            </div>
            
            <div className="orders-list">
              {recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <p className="order-id">Order #{order.id.slice(0, 8)}</p>
                    <p className="order-date">
                      {order.createdAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                    <p className="order-price">₹{order.totalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
