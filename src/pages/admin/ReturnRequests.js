import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiPackage, FiCheck, FiX } from 'react-icons/fi';

const ReturnRequests = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const returnsSnap = await getDocs(collection(db, 'returns'));
      const returnsData = returnsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReturns(returnsData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    } catch (error) {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnRequest) => {
    if (!window.confirm('Approve this return request?')) return;

    try {
      await updateDoc(doc(db, 'returns', returnRequest.id), {
        status: 'Approved',
        approvedAt: new Date()
      });

      // Update product stock
      const productRef = doc(db, returnRequest.productCollection || 'products', returnRequest.productId);
      if (returnRequest.selectedSize) {
        await updateDoc(productRef, {
          [`stockBySize.${returnRequest.selectedSize}`]: increment(returnRequest.quantity || 1)
        });
      } else {
        await updateDoc(productRef, {
          stock: increment(returnRequest.quantity || 1)
        });
      }

      toast.success('Return approved and stock updated');
      loadReturns();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve return');
    }
  };

  const handleReject = async (returnId) => {
    if (!window.confirm('Reject this return request?')) return;

    try {
      await updateDoc(doc(db, 'returns', returnId), {
        status: 'Rejected',
        rejectedAt: new Date()
      });

      toast.success('Return rejected');
      loadReturns();
    } catch (error) {
      toast.error('Failed to reject return');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#fbbf24',
      Approved: '#22c55e',
      Rejected: '#ef4444'
    };
    return colors[status] || '#fff';
  };

  const filteredReturns = returns.filter(ret => {
    if (filter === 'all') return true;
    return ret.status.toLowerCase() === filter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#fff' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>Return Requests</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                background: filter === f ? '#ff2a2a' : 'transparent',
                border: `1px solid ${filter === f ? '#ff2a2a' : '#2a2a2a'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
            >
              {f} ({returns.filter(r => f === 'all' || r.status.toLowerCase() === f).length})
            </button>
          ))}
        </div>
      </div>

      {filteredReturns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1a1a1a', borderRadius: '12px' }}>
          <FiPackage size={48} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }} />
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>No return requests</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReturns.map(returnReq => (
            <div key={returnReq.id} style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#fff' }}>
                    Order #{returnReq.orderId?.substring(0, 8)}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                    {returnReq.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: `${getStatusColor(returnReq.status)}20`,
                  color: getStatusColor(returnReq.status),
                  fontSize: '14px',
                  fontWeight: '600',
                  height: 'fit-content'
                }}>
                  {returnReq.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Product</p>
                  <p style={{ fontSize: '15px', color: '#fff', fontWeight: '600' }}>{returnReq.productName}</p>
                  {returnReq.selectedSize && (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                      Size: {returnReq.selectedSize}
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Reason</p>
                  <p style={{ fontSize: '15px', color: '#fff' }}>{returnReq.reason}</p>
                  {returnReq.comment && (
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                      "{returnReq.comment}"
                    </p>
                  )}
                </div>
              </div>

              {returnReq.imageUrl && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Attached Image</p>
                  <img src={returnReq.imageUrl} alt="Return" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                </div>
              )}

              {returnReq.status === 'Pending' && (
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
                  <button
                    onClick={() => handleApprove(returnReq)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      color: '#22c55e',
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
                    <FiCheck /> Approve Return
                  </button>
                  <button
                    onClick={() => handleReject(returnReq.id)}
                    style={{
                      flex: 1,
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
                    <FiX /> Reject Return
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
