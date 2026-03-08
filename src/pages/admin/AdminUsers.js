import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
