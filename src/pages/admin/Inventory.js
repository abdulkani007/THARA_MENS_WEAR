import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const updateStock = async (productId, newStock) => {
    try {
      await updateDoc(doc(db, 'products', productId), { stock: parseInt(newStock) });
      toast.success('Stock updated');
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateSizeStock = async (productId, size, newStock) => {
    try {
      const product = products.find(p => p.id === productId);
      const updatedStockBySize = { ...product.stockBySize, [size]: parseInt(newStock) };
      await updateDoc(doc(db, 'products', productId), { stockBySize: updatedStockBySize });
      toast.success('Stock updated');
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getTotalStock = (product) => {
    if (product.stockBySize && Object.keys(product.stockBySize).length > 0) {
      return Object.values(product.stockBySize).reduce((sum, stock) => sum + stock, 0);
    }
    return product.stock || 0;
  };

  const filteredProducts = products.filter(p => {
    const totalStock = getTotalStock(p);
    if (filter === 'low') return totalStock > 0 && totalStock < 10;
    if (filter === 'out') return totalStock === 0;
    return true;
  });

  const lowStockCount = products.filter(p => {
    const totalStock = getTotalStock(p);
    return totalStock > 0 && totalStock < 10;
  }).length;
  
  const outOfStockCount = products.filter(p => getTotalStock(p) === 0).length;

  return (
    <div className="inventory-page page-transition">
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Inventory Management</h1>

      <div className="inventory-stats">
        <div className="inventory-stat-card">
          <div className="stat-icon low-stock">
            <FiAlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Low Stock</p>
            <h3 className="stat-value">{lowStockCount}</h3>
          </div>
        </div>
        <div className="inventory-stat-card">
          <div className="stat-icon out-stock">
            <FiPackage size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Out of Stock</p>
            <h3 className="stat-value">{outOfStockCount}</h3>
          </div>
        </div>
      </div>

      <div className="inventory-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
          <option value="all">All Products ({products.length})</option>
          <option value="low">Low Stock ({lowStockCount})</option>
          <option value="out">Out of Stock ({outOfStockCount})</option>
        </select>
      </div>

      <div className="inventory-grid">
        {filteredProducts.map(product => {
          const totalStock = getTotalStock(product);
          const hasSizes = product.sizes && product.sizes.length > 0;
          
          return (
            <div key={product.id} className="inventory-card">
              <div className="inventory-card-header">
                <div className="product-info">
                  <img 
                    src={product.images?.[0] || product.imageURL} 
                    alt={product.name}
                    className="product-thumb"
                  />
                  <div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                  </div>
                </div>
                <span className={`stock-badge ${
                  totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'in'
                }`}>
                  {totalStock === 0 ? 'Out' : totalStock < 10 ? 'Low' : 'In Stock'}
                </span>
              </div>

              <div className="inventory-card-body">
                <div className="total-stock">
                  <span>Total Stock:</span>
                  <strong style={{ 
                    color: totalStock === 0 ? '#ef4444' : totalStock < 10 ? '#f59e0b' : '#10b981'
                  }}>
                    {totalStock}
                  </strong>
                </div>

                {hasSizes ? (
                  <div className="size-stock-grid">
                    {product.sizes.map(size => (
                      <div key={size} className="size-stock-item">
                        <label>{size}</label>
                        <input
                          type="number"
                          defaultValue={product.stockBySize?.[size] || 0}
                          onBlur={(e) => updateSizeStock(product.id, size, e.target.value)}
                          className="stock-input"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="single-stock">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onBlur={(e) => updateStock(product.id, e.target.value)}
                      className="stock-input"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <FiPackage size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
