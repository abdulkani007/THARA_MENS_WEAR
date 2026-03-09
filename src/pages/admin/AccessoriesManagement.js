import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import ImageInput from '../../components/ImageInput';

const ACCESSORY_CATEGORIES = ['Belts', 'Caps', 'Wallets', 'Sunglasses', 'Perfumes', 'Watches', 'Bags'];
const COLORS = ['Black', 'Brown', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Beige'];

const AccessoriesManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    subCategory: 'Belts',
    colors: [],
    stock: '',
    images: ['', '', '', '', '']
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const q = query(collection(db, 'products'), where('category', '==', 'Accessories'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const filteredImages = formData.images.filter(img => img.trim() !== '');
    if (filteredImages.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: 'Accessories',
      subCategory: formData.subCategory,
      colors: formData.colors,
      stock: parseInt(formData.stock),
      images: filteredImages,
      imageURL: filteredImages[0],
      createdAt: new Date()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Accessory updated');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Accessory added');
      }
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this accessory?')) {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Accessory deleted');
      loadProducts();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      subCategory: product.subCategory || 'Belts',
      colors: product.colors || [],
      stock: product.stock || 0,
      images: [...(product.images || []), '', '', '', '', ''].slice(0, 5)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      subCategory: 'Belts',
      colors: [],
      stock: '',
      images: ['', '', '', '', '']
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  return (
    <div style={{ padding: '0' }}>
      <BackButton to="/admin" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#fff' }}>Accessories Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#ff2e2e',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#e02828'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ff2e2e'}
        >
          <FiPlus size={18} /> Add Accessory
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⌛</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>No accessories yet</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>Add your first accessory to get started</p>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              padding: '12px 24px',
              background: '#ff2e2e',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Add First Accessory
          </button>
        </div>
      ) : (
        <div style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#222', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Image</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr 
                    key={product.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <img 
                        src={product.imageURL || product.images?.[0] || '/placeholder-product.png'} 
                        alt={product.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                        onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                      />
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: '600', color: '#fff' }}>{product.name}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>{product.subCategory}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 'bold', color: '#ff2e2e' }}>₹{product.price}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>{product.stock}</td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '8px 12px',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                          <FiEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: '8px 12px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
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
        }} onClick={resetForm}>
          <div style={{
            background: '#161616',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                {editingProduct ? 'Edit Accessory' : 'Add Accessory'}
              </h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="3"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <select
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="input"
              >
                {ACCESSORY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>Colors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      style={{
                        padding: '8px 16px',
                        background: formData.colors.includes(color) ? 'rgba(255, 46, 46, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: formData.colors.includes(color) ? '1px solid #ff2e2e' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: formData.colors.includes(color) ? '#ff2e2e' : '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <ImageInput images={formData.images} setImages={(images) => setFormData({ ...formData, images })} maxImages={5} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Update' : 'Add'} Accessory
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesManagement;
