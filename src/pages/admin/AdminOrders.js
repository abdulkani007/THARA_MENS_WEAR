import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiEye, FiX, FiSearch } from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const snapshot = await getDocs(collection(db, 'orders'));
    setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleCancelOrder = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await updateDoc(doc(db, 'orders', orderToCancel.id), {
        status: 'cancelled',
        cancelReason: 'Admin cancelled order',
        cancelledBy: 'admin',
        cancelledAt: new Date()
      });

      for (const item of orderToCancel.products) {
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
      if (selectedOrder?.id === orderToCancel.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    
    if (newStatus === 'delivered') {
      await addDoc(collection(db, 'orderHistory'), {
        ...order,
        deliveredAt: serverTimestamp()
      });
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Order delivered and moved to history');
    } else {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success('Order status updated');
    }
    
    loadOrders();
    if (selectedOrder?.id === orderId) {
      if (newStatus === 'delivered') {
        setSelectedOrder(null);
      } else {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      packed: '#8b5cf6',
      shipped: '#a78bfa',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#fff';
  };

  const getFilteredOrders = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    let filtered = orders;
    
    // Apply time period filter
    if (filterPeriod === 'today') {
      filtered = orders.filter(order => {
        const orderDate = order.createdAt?.toDate();
        return orderDate >= todayStart;
      });
    } else if (filterPeriod === 'yesterday') {
      filtered = orders.filter(order => {
        const orderDate = order.createdAt?.toDate();
        return orderDate >= yesterdayStart && orderDate < todayStart;
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        // Search by Order ID
        const orderId = order.id.toLowerCase();
        if (orderId.includes(query)) return true;
        
        // Search by Customer Name
        const customerName = (order.userName || order.userAddress?.name || '').toLowerCase();
        if (customerName.includes(query)) return true;
        
        // Search by Email
        const email = (order.userEmail || '').toLowerCase();
        if (email.includes(query)) return true;
        
        // Search by Phone
        const phone = (order.userAddress?.phone || '').toLowerCase();
        if (phone.includes(query)) return true;
        
        return false;
      });
    }
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="page-transition">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '36px' }}>Orders Management</h1>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '600px' }}>
          <FiSearch style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '18px',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Email, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '15px',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff2e2e'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 46, 46, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        {searchQuery && (
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterPeriod('all')}
          style={{
            padding: '10px 20px',
            background: filterPeriod === 'all' ? 'rgba(255, 46, 46, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: filterPeriod === 'all' ? '1px solid rgba(255, 46, 46, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: filterPeriod === 'all' ? '#ff2e2e' : '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilterPeriod('today')}
          style={{
            padding: '10px 20px',
            background: filterPeriod === 'today' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: filterPeriod === 'today' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: filterPeriod === 'today' ? '#22c55e' : '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Today ({orders.filter(o => {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return o.createdAt?.toDate() >= todayStart;
          }).length})
        </button>
        <button
          onClick={() => setFilterPeriod('yesterday')}
          style={{
            padding: '10px 20px',
            background: filterPeriod === 'yesterday' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: filterPeriod === 'yesterday' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: filterPeriod === 'yesterday' ? '#f59e0b' : '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Yesterday ({orders.filter(o => {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterdayStart = new Date(todayStart);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            const orderDate = o.createdAt?.toDate();
            return orderDate >= yesterdayStart && orderDate < todayStart;
          }).length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredOrders.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
              {filterPeriod === 'today' ? 'No orders today' : filterPeriod === 'yesterday' ? 'No orders yesterday' : 'No orders yet'}
            </p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Order #{order.id.substring(0, 8)}</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                    {order.createdAt?.toDate().toLocaleDateString()} {order.createdAt?.toDate().toLocaleTimeString()}
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
                    background: `${getStatusColor(order.status)}20`,
                    color: getStatusColor(order.status),
                    border: `1px solid ${getStatusColor(order.status)}40`
                  }}>
                    {order.status}
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <FiEye /> View Details
                  </button>
                  {order.status?.toLowerCase() !== 'cancelled' && order.status?.toLowerCase() !== 'delivered' && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                {order.products?.slice(0, 2).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                    <img
                      src={item.product.images?.[0] || item.product.imageURL}
                      alt={item.product.name}
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.product.name}</p>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                        Qty: {item.quantity} × ₹{item.product.price}
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

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {order.couponCode && (
                    <p style={{ fontSize: '12px', color: '#22c55e', marginBottom: '4px' }}>
                      Coupon: {order.couponCode} (-₹{order.discount?.toFixed(2) || 0})
                    </p>
                  )}
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff2e2e' }}>
                    Total: ₹{order.totalPrice}
                  </p>
                </div>
                <select
                  className="input"
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{ padding: '8px 16px', width: 'auto' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {showCancelModal && (
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
        }} onClick={() => setShowCancelModal(false)}>
          <div style={{
            background: '#161616',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#fff' }}>Cancel Order?</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              Are you sure you want to cancel order #{orderToCancel?.id.substring(0, 8)}? Stock will be restored automatically.
            </p>
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
                onClick={confirmCancelOrder}
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
                    <p style={{ fontWeight: '600' }}>{selectedOrder.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Status</p>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: `${getStatusColor(selectedOrder.status)}20`,
                      color: getStatusColor(selectedOrder.status),
                      border: `1px solid ${getStatusColor(selectedOrder.status)}40`,
                      display: 'inline-block'
                    }}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Payment Method</p>
                    <p style={{ fontWeight: '600', textTransform: 'uppercase' }}>{selectedOrder.paymentMethod || 'COD'}</p>
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
                        src={item.product.images?.[0] || item.product.imageURL}
                        alt={item.product.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>{item.product.name}</p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                          {item.product.category}
                        </p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                          {item.selectedColor && ` • Color: ${item.selectedColor}`}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Qty: {item.quantity}</p>
                        <p style={{ fontWeight: '700', fontSize: '18px', color: '#ff2e2e' }}>₹{item.product.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px', background: 'rgba(255, 46, 46, 0.1)', borderRadius: '12px', border: '1px solid rgba(255, 46, 46, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Subtotal</span>
                  <span style={{ fontWeight: '600' }}>₹{selectedOrder.subtotal?.toFixed(2) || selectedOrder.totalPrice}</span>
                </div>
                {selectedOrder.couponCode && selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#22c55e' }}>Coupon ({selectedOrder.couponCode})</span>
                    <span style={{ fontWeight: '600', color: '#22c55e' }}>-₹{selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Shipping</span>
                  <span style={{ fontWeight: '600', color: '#22c55e' }}>Free</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#ff2e2e' }}>₹{selectedOrder.totalPrice}</span>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <select
                  className="input"
                  value={selectedOrder.status}
                  onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                  style={{ flex: 1, padding: '12px 16px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
