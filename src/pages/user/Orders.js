import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import toast from 'react-hot-toast';
import { FiRotateCcw, FiX } from 'react-icons/fi';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnForm, setReturnForm] = useState({
    reason: '',
    comment: ''
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    loadOrders();
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const activeOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const historyQ = query(collection(db, 'orderHistory'), where('userId', '==', currentUser.uid));
    const historySnapshot = await getDocs(historyQ);
    const historyOrders = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: 'delivered' }));
    
    setOrders([...activeOrders, ...historyOrders].sort((a, b) => b.createdAt - a.createdAt));
  };

  const loadReturns = async () => {
    const q = query(collection(db, 'returns'), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    setReturns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleReturnRequest = (order, product) => {
    setSelectedProduct({ ...product, orderId: order.id });
    setShowReturnModal(true);
  };

  const submitReturnRequest = async () => {
    if (!returnForm.reason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      await addDoc(collection(db, 'returns'), {
        orderId: selectedProduct.orderId,
        userId: currentUser.uid,
        productId: selectedProduct.product.id,
        productName: selectedProduct.product.name,
        productCollection: selectedProduct.product.collection || 'products',
        selectedSize: selectedProduct.selectedSize,
        quantity: selectedProduct.quantity,
        reason: returnForm.reason,
        comment: returnForm.comment,
        status: 'Pending',
        createdAt: new Date()
      });

      toast.success('Return request submitted');
      setShowReturnModal(false);
      setReturnForm({ reason: '', comment: '' });
      loadReturns();
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  const canCancelOrder = (status) => {
    const cancellableStatuses = ['pending', 'processing', 'packed'];
    return cancellableStatuses.includes(status?.toLowerCase());
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitCancelOrder = async () => {
    if (!cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'cancelled',
        cancelReason,
        cancelledBy: 'user',
        cancelledAt: new Date()
      });

      for (const item of selectedOrder.products) {
        const collectionName = item.product.collection || 'products';
        const productRef = doc(db, collectionName, item.product.id);
        
        if (item.selectedSize) {
          await updateDoc(productRef, {
            [`stockBySize.${item.selectedSize}`]: increment(item.quantity)
          });
        } else {
          await updateDoc(productRef, {
            stock: increment(item.quantity)
          });
        }
      }

      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      loadOrders();
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const getReturnStatus = (orderId, productId) => {
    const returnRequest = returns.find(r => r.orderId === orderId && r.productId === productId);
    return returnRequest ? returnRequest.status : null;
  };

  const canReturnProduct = (order, product) => {
    if (!product.returnAllowed) return { allowed: false, message: 'Return not allowed' };
    if (!product.returnDays) return { allowed: true, message: '' };
    
    const deliveredDate = order.deliveredAt?.toDate() || order.createdAt?.toDate();
    if (!deliveredDate) return { allowed: false, message: 'Delivery date not found' };
    
    const daysSinceDelivery = Math.floor((new Date() - deliveredDate) / (1000 * 60 * 60 * 24));
    const daysLeft = product.returnDays - daysSinceDelivery;
    
    if (daysLeft <= 0) return { allowed: false, message: 'Return window expired' };
    return { allowed: true, message: `${daysLeft} days left` };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      processing: '#60a5fa',
      shipped: '#a78bfa',
      delivered: '#4ade80',
      cancelled: '#f87171'
    };
    return colors[status] || '#fff';
  };

  return (
    <div className="orders-page page-transition">
      <BackButton to="/user" />
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.substring(0, 8)}</h3>
                  <p className="order-date">
                    {order.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <span className="order-status" style={{
                  background: `${getStatusColor(order.status)}20`,
                  color: getStatusColor(order.status)
                }}>
                  {order.status}
                </span>
              </div>

              <div className="order-products">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="order-product-item">
                    <img
                      src={item.product.imageURL}
                      alt={item.product.name}
                      className="order-product-image"
                    />
                    <div className="order-product-info">
                      <h4>{item.product.name}</h4>
                      <p className="order-product-details">
                        Quantity: {item.quantity} × ₹{item.product.price}
                      </p>
                      {(() => {
                        const returnStatus = getReturnStatus(order.id, item.product.id);
                        const returnCheck = canReturnProduct(order, item.product);
                        
                        if (returnStatus) {
                          return (
                            <span style={{
                              marginTop: '8px',
                              padding: '6px 12px',
                              background: returnStatus === 'Approved' ? 'rgba(34, 197, 94, 0.1)' : 
                                         returnStatus === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 
                                         'rgba(251, 191, 36, 0.1)',
                              border: returnStatus === 'Approved' ? '1px solid rgba(34, 197, 94, 0.3)' : 
                                      returnStatus === 'Rejected' ? '1px solid rgba(239, 68, 68, 0.3)' : 
                                      '1px solid rgba(251, 191, 36, 0.3)',
                              borderRadius: '6px',
                              color: returnStatus === 'Approved' ? '#22c55e' : 
                                     returnStatus === 'Rejected' ? '#ef4444' : 
                                     '#fbbf24',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              Return {returnStatus}
                            </span>
                          );
                        }
                        
                        if (order.status?.toLowerCase() === 'delivered') {
                          if (returnCheck.allowed) {
                            return (
                              <>
                                <button
                                  onClick={() => handleReturnRequest(order, item)}
                                  style={{
                                    marginTop: '8px',
                                    padding: '6px 12px',
                                    background: 'rgba(255, 42, 42, 0.1)',
                                    border: '1px solid rgba(255, 42, 42, 0.3)',
                                    borderRadius: '6px',
                                    color: '#ff2a2a',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <FiRotateCcw size={14} /> Return Product
                                </button>
                                {returnCheck.message && (
                                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                    {returnCheck.message}
                                  </p>
                                )}
                              </>
                            );
                          } else {
                            return (
                              <span style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'inline-block'
                              }}>
                                {returnCheck.message}
                              </span>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                    <div className="order-product-price">
                      ₹{(item.quantity * item.product.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="order-summary-row">
                  <span className="order-summary-label">Subtotal</span>
                  <span className="order-summary-value">
                    ₹{order.subtotal?.toFixed(2) || order.totalPrice?.toFixed(2)}
                  </span>
                </div>
                {order.couponCode && order.discount > 0 && (
                  <div className="order-summary-row">
                    <span className="order-coupon">
                      Coupon ({order.couponCode})
                    </span>
                    <span className="order-coupon">
                      -₹{order.discount?.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="order-total">
                  <span className="order-total-label">Total Amount</span>
                  <span className="order-total-price">
                    ₹{order.totalPrice?.toFixed(2)}
                  </span>
                </div>
              </div>

              {canCancelOrder(order.status) && (
                <button
                  onClick={() => handleCancelOrder(order)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FiX size={16} /> Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCancelModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #2a2a2a'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Cancel Order?</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              Are you sure you want to cancel this order?
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Reason for Cancellation *</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="">Select reason</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Wrong address">Wrong address</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={submitCancelOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #2a2a2a'
          }}>
            <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#fff' }}>Return Product</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', color: '#fff', marginBottom: '4px' }}>{selectedProduct?.product.name}</p>
              {selectedProduct?.selectedSize && (
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Size: {selectedProduct.selectedSize}</p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Reason for Return *</label>
              <select
                value={returnForm.reason}
                onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="">Select reason</option>
                <option value="Wrong Size">Wrong Size</option>
                <option value="Damaged Product">Damaged Product</option>
                <option value="Not as Expected">Not as Expected</option>
                <option value="Received Wrong Item">Received Wrong Item</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Additional Comments (Optional)</label>
              <textarea
                value={returnForm.comment}
                onChange={(e) => setReturnForm({ ...returnForm, comment: e.target.value })}
                placeholder="Provide more details..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f0f0f',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowReturnModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReturnRequest}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff2a2a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
