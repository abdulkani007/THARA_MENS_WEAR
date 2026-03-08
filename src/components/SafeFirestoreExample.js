import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SafeFirestoreExample = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (err) {
      console.error('Firestore Error:', err.message);
      
      if (err.code === 'unavailable') {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.code === 'permission-denied') {
        setError('Permission denied. Please check Firestore security rules.');
      } else {
        setError('Failed to load products. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="loader"></div>
        <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.6)' }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#ff2e2e', marginBottom: '20px' }}>{error}</p>
        <button onClick={fetchProducts} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Products ({products.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} className="card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p style={{ color: '#ff2e2e', fontWeight: 'bold' }}>₹{product.price}</p>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)' }}>
          No products found
        </p>
      )}
    </div>
  );
};

export default SafeFirestoreExample;
