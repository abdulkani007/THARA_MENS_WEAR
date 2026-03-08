import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import BackButton from '../../components/BackButton';
import ImageInput from '../../components/ImageInput';

const KIDS_CATEGORIES = ['Boys Shirts', 'Boys T-Shirts', 'Boys Jeans', 'Boys Pants', 'Girls Dresses', 'Girls Tops', 'Girls Jeans', 'Girls Skirts'];
const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y', '14-15Y'];
const PRESET_COLORS = ['Black', 'White', 'Blue', 'Red', 'Pink', 'Green', 'Yellow', 'Purple'];

const KidsCollection = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sizes: [],
    colors: [],
    ageGroup: '',
    images: ['', '', '', '', '']
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, 'kidsProducts'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const setImages = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredImages = formData.images.filter(img => img.trim() !== '');
    if (!formData.name || !formData.price || !formData.category || formData.sizes.length === 0 || filteredImages.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        ageGroup: formData.ageGroup,
        images: filteredImages,
        imageURL: filteredImages[0],
        createdAt: serverTimestamp()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'kidsProducts', editingProduct.id), productData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'kidsProducts'), productData);
        toast.success('Product added');
      }

      resetForm();
      loadProducts();
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      sizes: product.sizes || [],
      colors: product.colors || [],
      ageGroup: product.ageGroup || '',
      images: [...(product.images || []), '', '', '', '', ''].slice(0, 5)
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'kidsProducts', id));
      toast.success('Product deleted');
      loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '', sizes: [], colors: [], ageGroup: '', images: ['', '', '', '', ''] });
    setEditingProduct(null);
    setShowModal(false);
  };

  return (
    <div className="page-transition">
      <BackButton to="/admin" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px' }}>Kids Collection</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> Add Kids Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.map(product => (
          <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>{product.category}</p>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.name}</h3>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#ff2e2e', marginBottom: '12px' }}>₹{product.price}</p>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '12px' }}>Stock: {product.stock}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(product)} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FiEdit2 size={16} /> Edit
                </button>
                <button onClick={() => handleDelete(product.id)} style={{ flex: 1, padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={resetForm}>
          <div style={{ background: '#161616', borderRadius: '16px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#161616', zIndex: 1 }}>
              <h2 style={{ fontSize: '24px' }}>{editingProduct ? 'Edit' : 'Add'} Kids Product</h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '24px' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label className="label">Product Name *</label>
                  <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" required />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea className="input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter description" rows="3" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label">Price (₹) *</label>
                    <input className="input" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required />
                  </div>
                  <div>
                    <label className="label">Stock</label>
                    <input className="input" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label">Category *</label>
                    <select className="input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Select Category</option>
                      {KIDS_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Age Group</label>
                    <input className="input" value={formData.ageGroup} onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })} placeholder="e.g., 2-5 Years" />
                  </div>
                </div>

                <div>
                  <label className="label">Sizes *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {KIDS_SIZES.map(size => (
                      <button key={size} type="button" onClick={() => toggleSize(size)} style={{ padding: '8px 16px', background: formData.sizes.includes(size) ? '#ff2e2e' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${formData.sizes.includes(size) ? '#ff2e2e' : 'rgba(255, 255, 255, 0.1)'}`, borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Colors</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PRESET_COLORS.map(color => (
                      <button key={color} type="button" onClick={() => toggleColor(color)} style={{ width: '40px', height: '40px', background: color.toLowerCase(), border: `2px solid ${formData.colors.includes(color) ? '#fff' : 'transparent'}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700' }}>
                        {formData.colors.includes(color) && '✓'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <ImageInput images={formData.images} setImages={setImages} maxImages={5} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={resetForm} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingProduct ? 'Update' : 'Add'} Product</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidsCollection;
