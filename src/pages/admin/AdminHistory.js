import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'orderHistory'), orderBy('deliveredAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistory(historyData);
      setLoading(false);
    }, (error) => {
      toast.error('Failed to load history');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Order History</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {history.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>No delivered orders yet</p>
          </div>
        ) : (
          history.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Order #{order.id.substring(0, 8)}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                    Ordered: {formatDate(order.createdAt)}
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                    Delivered: {formatDate(order.deliveredAt)}
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    <FiUser size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {order.userName || 'N/A'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: '#22c55e20',
                    color: '#22c55e',
                    border: '1px solid #22c55e40'
                  }}>
                    DELIVERED
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 46, 46, 0.1)',
                      border: '1px solid rgba(255, 46, 46, 0.3)',
                      borderRadius: '8px',
                      color: '#ff2e2e',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                {order.products?.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                    <img
                      src={item.product?.images?.[0] || item.product?.imageURL || item.imageURL?.[0] || item.imageURL}
                      alt={item.product?.name || item.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product?.name || item.name}</p>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                        Qty: {item.quantity} × ₹{item.product?.price || item.price}
                        {item.selectedSize && ` • Size: ${item.selectedSize}`}
                        {item.selectedColor && ` • ${item.selectedColor}`}
                      </p>
                    </div>
                  </div>
                ))}
                {order.products?.length > 2 && (
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', textAlign: 'center' }}>
                    +{order.products.length - 2} more items
                  </p>
                )}
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff2e2e' }}>
                  Total: ₹{order.totalPrice}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: '#161616',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#161616', zIndex: 1 }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
                <FiX />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiPackage /> Order Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Order ID</p>
                    <p style={{ fontWeight: '600' }}>#{selectedOrder.id.substring(0, 12)}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Order Date</p>
                    <p style={{ fontWeight: '600' }}>{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Delivered Date</p>
                    <p style={{ fontWeight: '600' }}>{formatDate(selectedOrder.deliveredAt)}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Status</p>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: '#22c55e20',
                      color: '#22c55e',
                      border: '1px solid #22c55e40',
                      display: 'inline-block'
                    }}>
                      DELIVERED
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiUser /> Customer Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiUser size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Name</p>
                      <p style={{ fontWeight: '600' }}>{selectedOrder.userName || selectedOrder.userAddress?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiMail size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Email</p>
                      <p style={{ fontWeight: '600' }}>{selectedOrder.userEmail || 'N/A'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiPhone size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    <div>
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Phone</p>
                      <p style={{ fontWeight: '600' }}>{selectedOrder.userAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin /> Shipping Address
                </h3>
                {selectedOrder.userAddress ? (
                  <div style={{ lineHeight: '1.8' }}>
                    <p style={{ fontWeight: '600', marginBottom: '4px' }}>{selectedOrder.userAddress.name}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{selectedOrder.userAddress.address}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {selectedOrder.userAddress.city}, {selectedOrder.userAddress.state} - {selectedOrder.userAddress.pincode}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '8px' }}>Phone: {selectedOrder.userAddress.phone}</p>
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>No address available</p>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Order Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.products?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <img
                        src={item.product?.images?.[0] || item.product?.imageURL || item.imageURL?.[0] || item.imageURL}
                        alt={item.product?.name || item.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>{item.product?.name || item.name}</p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                          {item.product?.category || item.category}
                        </p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedColor && ` • Color: ${item.selectedColor}`}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Qty: {item.quantity}</p>
                        <p style={{ fontWeight: '700', fontSize: '18px', color: '#ff2e2e' }}>₹{(item.product?.price || item.price) * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255, 46, 46, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 46, 46, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>₹{selectedOrder.totalPrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Shipping</span>
                  <span style={{ fontWeight: '600', color: '#22c55e' }}>Free</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#ff2e2e' }}>₹{selectedOrder.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;
