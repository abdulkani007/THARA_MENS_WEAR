import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiStar, FiTrash2, FiUser, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'ratings'));
      const ratingsData = await Promise.all(
        snapshot.docs.map(async (ratingDoc) => {
          const rating = { id: ratingDoc.id, ...ratingDoc.data() };
          
          if (!products[rating.productId]) {
            const productDoc = await getDoc(doc(db, 'products', rating.productId));
            if (productDoc.exists()) {
              setProducts(prev => ({ ...prev, [rating.productId]: productDoc.data() }));
            }
          }
          
          return rating;
        })
      );
      
      ratingsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setRatings(ratingsData);
    } catch (error) {
      toast.error('Error loading ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return;
    
    try {
      await deleteDoc(doc(db, 'ratings', ratingId));
      toast.success('Rating deleted');
      loadRatings();
    } catch (error) {
      toast.error('Error deleting rating');
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={16}
            fill={star <= rating ? '#FF2E2E' : 'none'}
            stroke="#FF2E2E"
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Product Reviews</h1>
        <p style={{ color: '#C5C6C7' }}>Manage customer ratings and reviews</p>
      </div>

      {ratings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#111111',
          borderRadius: '12px',
          border: '1px solid #1F2833'
        }}>
          <FiStar size={48} style={{ color: '#FF2E2E', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Reviews Yet</h3>
          <p style={{ color: '#C5C6C7' }}>Customer ratings will appear here</p>
        </div>
      ) : (
        <div style={{
          background: '#111111',
          borderRadius: '12px',
          border: '1px solid #1F2833',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#000000', borderBottom: '1px solid #1F2833' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: '#C5C6C7', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPackage size={16} />
                    Product
                  </div>
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#C5C6C7', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiUser size={16} />
                    User
                  </div>
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#C5C6C7', fontSize: '14px', fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiStar size={16} />
                    Rating
                  </div>
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#C5C6C7', fontSize: '14px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'center', color: '#C5C6C7', fontSize: '14px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.id} style={{ borderBottom: '1px solid #1F2833' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {products[rating.productId]?.imageURL && (
                        <img
                          src={products[rating.productId].imageURL}
                          alt={products[rating.productId]?.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      )}
                      <span style={{ fontWeight: '500' }}>
                        {products[rating.productId]?.name || 'Product not found'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#C5C6C7' }}>{rating.userEmail}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(rating.rating)}
                      <span style={{ color: '#FF2E2E', fontWeight: '600' }}>{rating.rating}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#C5C6C7', fontSize: '14px' }}>
                    {rating.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: '#111111',
        borderRadius: '12px',
        border: '1px solid #1F2833'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#FF2E2E' }}>Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <p style={{ color: '#C5C6C7', fontSize: '14px', marginBottom: '4px' }}>Total Reviews</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF2E2E' }}>{ratings.length}</p>
          </div>
          <div>
            <p style={{ color: '#C5C6C7', fontSize: '14px', marginBottom: '4px' }}>Average Rating</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF2E2E' }}>
              {ratings.length > 0 
                ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
