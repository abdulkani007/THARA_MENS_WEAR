import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiEdit2 } from 'react-icons/fi';
import BackButton from '../../components/BackButton';
import './Checkout.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [savedAddress, setSavedAddress] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [loading, setLoading] = useState(false);

  const calculateDiscount = (amount, coupon) => {
    if (coupon.discountType === 'percentage') {
      const discountAmount = (amount * coupon.discountValue) / 100;
      return coupon.maxDiscount ? Math.min(discountAmount, coupon.maxDiscount) : discountAmount;
    }
    return coupon.discountValue;
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;
  const totalPrice = subtotal - discount;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/user/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    loadSavedAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadSavedAddress = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists() && userDoc.data().address) {
        const addr = userDoc.data().address;
        setSavedAddress(addr);
        setFormData(prev => ({ ...prev, ...addr }));
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Error loading address:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setCouponError('Invalid coupon code');
        toast.error('Invalid coupon code');
        return;
      }

      const couponDoc = snapshot.docs[0];
      const coupon = { id: couponDoc.id, ...couponDoc.data() };

      // Check if coupon is active
      if (!coupon.active) {
        setCouponError('This coupon is no longer active');
        toast.error('This coupon is no longer active');
        return;
      }

      // Check expiry date
      if (coupon.expiryDate) {
        const expiryDate = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate);
        if (expiryDate < new Date()) {
          setCouponError('This coupon has expired');
          toast.error('This coupon has expired');
          return;
        }
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        setCouponError('This coupon has reached its usage limit');
        toast.error('This coupon has reached its usage limit');
        return;
      }

      // Check minimum order value
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        setCouponError(`Minimum order value of ₹${coupon.minOrderValue} required`);
        toast.error(`Minimum order value of ₹${coupon.minOrderValue} required`);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponError('');
      const discountAmount = calculateDiscount(subtotal, coupon);
      toast.success(`Coupon applied! You saved ₹${discountAmount.toFixed(2)}`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error applying coupon. Please try again.');
      toast.error('Error applying coupon. Please try again.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast.success('Coupon removed');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    if (formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      // Update coupon usage count
      if (appliedCoupon) {
        await updateDoc(doc(db, 'coupons', appliedCoupon.id), {
          usedCount: increment(1)
        });
      }

      // Reduce product stock
      for (const item of cart) {
        // Determine which collection the product belongs to
        let productRef = doc(db, 'products', item.productId);
        let productDoc = await getDoc(productRef);
        
        // If not in products, check kidsProducts
        if (!productDoc.exists()) {
          productRef = doc(db, 'kidsProducts', item.productId);
          productDoc = await getDoc(productRef);
        }
        
        // If not in kidsProducts, check accessories
        if (!productDoc.exists()) {
          productRef = doc(db, 'accessories', item.productId);
          productDoc = await getDoc(productRef);
        }
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          
          if (item.selectedSize && productData.stockBySize) {
            // Update size-specific stock
            const currentSizeStock = productData.stockBySize[item.selectedSize] || 0;
            await updateDoc(productRef, {
              [`stockBySize.${item.selectedSize}`]: Math.max(0, currentSizeStock - item.quantity)
            });
          } else {
            // Update general stock
            await updateDoc(productRef, {
              stock: increment(-item.quantity)
            });
          }
        }
      }

      const orderData = {
        userId: currentUser.uid,
        userName: formData.name,
        userEmail: currentUser.email,
        userAddress: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        products: cart.map(item => ({
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        couponDiscount: appliedCoupon ? parseFloat(discount.toFixed(2)) : 0,
        paymentMethod: formData.paymentMethod,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Send order confirmation email
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'https://thara-mens-wear.onrender.com';
        await fetch(`${API_URL}/api/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            orderId: 'ORD' + Date.now(),
            orderTotal: totalPrice,
            items: cart.map(item => ({
              name: item.product.name,
              quantity: item.quantity
            }))
          })
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }

      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/user/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page page-transition">
      <BackButton to="/user/cart" />
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-section">
            <h2 className="section-title">Shipping Address</h2>
            
            {savedAddress && !useNewAddress ? (
              <div className="saved-address-container">
                <div className="saved-address-display">
                  <p className="address-name">{savedAddress.name}</p>
                  <p className="address-phone">{savedAddress.phone}</p>
                  <p className="address-text">{savedAddress.address}</p>
                  <p className="address-text">
                    {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseNewAddress(true)}
                  className="change-address-btn"
                >
                  <FiEdit2 /> Change Address
                </button>
              </div>
            ) : (
              <>
                {savedAddress && (
                  <div className="address-toggle">
                    <button
                      type="button"
                      onClick={() => {
                        setUseNewAddress(false);
                        setFormData(prev => ({ ...prev, ...savedAddress }));
                      }}
                      className="use-saved-btn"
                    >
                      Use Saved Address
                    </button>
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House No., Building Name, Street"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="checkout-section">
            <h2 className="section-title">Apply Coupon</h2>
            
            {appliedCoupon ? (
              <div style={{
                padding: '16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ color: '#22c55e', fontWeight: '600', marginBottom: '4px' }}>
                    {appliedCoupon.code} Applied!
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                    You saved ₹{discount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(255, 46, 46, 0.1)',
                      border: '1px solid rgba(255, 46, 46, 0.3)',
                      borderRadius: '8px',
                      color: '#ff2e2e',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>
                    {couponError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="checkout-section">
            <h2 className="section-title">Payment Method</h2>
            
            <div className="payment-methods">
              <label className={`payment-option ${formData.paymentMethod === 'upi' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={handleChange}
                />
                <FiSmartphone size={24} />
                <span>UPI</span>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                />
                <FiCreditCard size={24} />
                <span>Card</span>
              </label>

              <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                />
                <FiDollarSign size={24} />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order - ₹${totalPrice}`}
          </button>
        </form>

        <div className="order-summary-sidebar">
          <h2 className="section-title">Order Summary</h2>
          
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.product.images?.[0] || item.product.imageURL} alt={item.product.name} />
                <div className="summary-item-info">
                  <p className="summary-item-name">{item.product.name}</p>
                  <p className="summary-item-details">
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                    {item.selectedColor && ` • ${item.selectedColor}`}
                  </p>
                  <p className="summary-item-qty">Qty: {item.quantity}</p>
                </div>
                <p className="summary-item-price">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="summary-row" style={{ color: '#22c55e' }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
