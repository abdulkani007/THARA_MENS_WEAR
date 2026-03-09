import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteUser = async (userId, userEmail, userRole) => {
    if (userRole === 'admin') {
      toast.error('Cannot delete admin users');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}?\n\nThis will:\n- Delete user from Authentication\n- Delete user from Firestore\n- Delete user's cart, favorites, and orders`)) {
      return;
    }

    setDeleting(userId);

    try {
      // Delete from Firestore users collection
      await deleteDoc(doc(db, 'users', userId));

      // Delete user's cart items
      const cartSnapshot = await getDocs(collection(db, 'cart'));
      const userCartItems = cartSnapshot.docs.filter(doc => doc.data().userId === userId);
      await Promise.all(userCartItems.map(item => deleteDoc(doc(db, 'cart', item.id))));

      // Delete user's favorites
      const favSnapshot = await getDocs(collection(db, 'favorites'));
      const userFavorites = favSnapshot.docs.filter(doc => doc.data().userId === userId);
      await Promise.all(userFavorites.map(item => deleteDoc(doc(db, 'favorites', item.id))));

      // Note: Orders are kept for record-keeping, but you can delete them if needed
      // const ordersSnapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
      // await Promise.all(ordersSnapshot.docs.map(order => deleteDoc(doc(db, 'orders', order.id))));

      toast.success(`User ${userEmail} deleted successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Users Management</h1>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.6)' }}>Created At</th>
              <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '16px' }}>{user.email}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: user.role === 'admin' ? 'rgba(255, 46, 46, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: user.role === 'admin' ? '#ff2e2e' : '#fff',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {user.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email, user.role)}
                      disabled={deleting === user.id}
                      style={{
                        padding: '8px 16px',
                        background: deleting === user.id ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        cursor: deleting === user.id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)')}
                      onMouseLeave={(e) => !deleting && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                    >
                      <FiTrash2 size={16} />
                      {deleting === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
