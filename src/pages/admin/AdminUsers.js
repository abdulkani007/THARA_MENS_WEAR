import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch, FiShoppingBag, FiClock, FiLock, FiUnlock, FiX, FiEye } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [blocking, setBlocking] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    setUsers(snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      status: doc.data().status || 'active',
      deleted: doc.data().deleted || false
    })));
  };

  const getFilteredUsers = () => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      const email = (user.email || '').toLowerCase();
      const name = (user.name || user.displayName || '').toLowerCase();
      const userId = (user.id || '').toLowerCase();
      
      return email.includes(query) || name.includes(query) || userId.includes(query);
    });
  };

  const handleBlockUser = async (userId, userEmail, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const action = newStatus === 'blocked' ? 'block' : 'unblock';
    
    if (!window.confirm(`Are you sure you want to ${action} user: ${userEmail}?`)) {
      return;
    }

    setBlocking(userId);

    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date()
      });

      toast.success(`User ${action}ed successfully`);
      loadUsers();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user: ` + error.message);
    } finally {
      setBlocking(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail, userRole) => {
    if (userRole === 'admin') {
      toast.error('Cannot delete admin users');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis will:\n- Mark user as deleted\n- User cannot login\n- User data preserved for records`)) {
      return;
    }

    setDeleting(userId);

    try {
      // Soft delete - mark as deleted instead of removing
      await updateDoc(doc(db, 'users', userId), {
        deleted: true,
        status: 'deleted',
        deletedAt: new Date()
      });

      toast.success(`User ${userEmail} deleted successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const loadUserOrders = async (userId) => {
    try {
      // Load from orders collection
      const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId));
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Load from orderHistory collection
      const historyQuery = query(collection(db, 'orderHistory'), where('userId', '==', userId));
      const historySnapshot = await getDocs(historyQuery);
      const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Combine and sort by date
      const allOrders = [...orders, ...history].sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setUserOrders(allOrders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const loadLoginHistory = async (userId) => {
    try {
      const historyQuery = query(
        collection(db, 'loginHistory'), 
        where('userId', '==', userId),
        orderBy('loginTime', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(historyQuery);
      setLoginHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading login history:', error);
      // If collection doesn't exist yet, just show empty
      setLoginHistory([]);
    }
  };

  const handleViewOrders = async (user) => {
    setSelectedUser(user);
    await loadUserOrders(user.id);
    setShowOrdersModal(true);
  };

  const handleViewLoginHistory = async (user) => {
    setSelectedUser(user);
    await loadLoginHistory(user.id);
    setShowLoginHistoryModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#22c55e',
      blocked: '#ef4444',
      deleted: '#6b7280'
    };
    return colors[status] || '#fff';
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '36px', marginBottom: '24px' }}>Users Management</h1>

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
            placeholder="Search by Email, Name, or User ID..."
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
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created At</th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px' }}>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '2px' }}>{user.email}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>ID: {user.id.substring(0, 8)}...</p>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: user.role === 'admin' ? 'rgba(255, 46, 46, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: user.role === 'admin' ? '#ff2e2e' : '#3b82f6',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: `${getStatusColor(user.status)}20`,
                    color: getStatusColor(user.status),
                    border: `1px solid ${getStatusColor(user.status)}40`,
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                  {user.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {/* View Orders Button */}
                    <button
                      onClick={() => handleViewOrders(user)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                    >
                      <FiShoppingBag size={14} /> Orders
                    </button>

                    {/* Login History Button */}
                    <button
                      onClick={() => handleViewLoginHistory(user)}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#8b5cf6',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                    >
                      <FiClock size={14} /> History
                    </button>

                    {/* Block/Unblock Button */}
                    {user.role !== 'admin' && user.status !== 'deleted' && (
                      <button
                        onClick={() => handleBlockUser(user.id, user.email, user.status)}
                        disabled={blocking === user.id}
                        style={{
                          padding: '6px 12px',
                          background: user.status === 'blocked' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          border: user.status === 'blocked' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          color: user.status === 'blocked' ? '#22c55e' : '#f59e0b',
                          cursor: blocking === user.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
                          opacity: blocking === user.id ? 0.6 : 1
                        }}
                      >
                        {user.status === 'blocked' ? <FiUnlock size={14} /> : <FiLock size={14} />}
                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                    )}

                    {/* Delete Button */}
                    {user.role !== 'admin' && user.status !== 'deleted' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                        disabled={deleting === user.id}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: deleting === user.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
                          opacity: deleting === user.id ? 0.6 : 1
                        }}
                      >
                        <FiTrash2 size={14} />
                        {deleting === user.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}

                    {/* Protected Label for Admin */}
                    {user.role === 'admin' && (
                      <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px', padding: '6px 12px' }}>Protected</span>
                    )}

                    {/* Deleted Label */}
                    {user.status === 'deleted' && (
                      <span style={{ color: '#6b7280', fontSize: '13px', padding: '6px 12px' }}>Deleted</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
            {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found'}
          </div>
        )}
      </div>

      {/* Orders Modal */}
      {showOrdersModal && selectedUser && (
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
        }} onClick={() => setShowOrdersModal(false)}>
          <div style={{
            background: '#161616',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#161616', zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>User Orders</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowOrdersModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
                <FiX />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  <FiShoppingBag size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p>No orders found for this user</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userOrders.map(order => (
                    <div key={order.id} style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Order #{order.id.substring(0, 8)}</p>
                          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {order.createdAt?.toDate().toLocaleDateString()} {order.createdAt?.toDate().toLocaleTimeString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: order.status === 'delivered' ? '#22c55e' : '#3b82f6',
                            border: order.status === 'delivered' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)'
                          }}>
                            {order.status}
                          </span>
                          <p style={{ fontSize: '18px', fontWeight: '700', color: '#ff2e2e', marginTop: '8px' }}>₹{order.totalPrice}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.products?.slice(0, 3).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img
                              src={item.product.images?.[0] || item.product.imageURL}
                              alt={item.product.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '14px', fontWeight: '600' }}>{item.product.name}</p>
                              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                Qty: {item.quantity} × ₹{item.product.price}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.products?.length > 3 && (
                          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                            +{order.products.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistoryModal && selectedUser && (
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
        }} onClick={() => setShowLoginHistoryModal(false)}>
          <div style={{
            background: '#161616',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#161616', zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Login History</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowLoginHistoryModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
                <FiX />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {loginHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  <FiClock size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p>No login history available</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Login tracking will start from the next login</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loginHistory.map((login, idx) => (
                    <div key={login.id} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            {login.loginTime?.toDate().toLocaleDateString()} {login.loginTime?.toDate().toLocaleTimeString()}
                          </p>
                          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                            IP: {login.ipAddress || 'N/A'}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#22c55e'
                        }}>
                          #{idx + 1}
                        </span>
                      </div>
                      {login.deviceInfo && (
                        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          Device: {login.deviceInfo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
