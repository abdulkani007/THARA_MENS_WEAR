import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import ImageInput from '../../components/ImageInput';
import { deleteProductImages } from '../../services/imageService';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const product = products.find(p => p.id === id);
      await deleteDoc(doc(db, 'products', id));
      if (product?.images) {
        await deleteProductImages(product.images);
      }
      toast.success('Product deleted');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const filteredImages = formData.images?.filter(img => img.trim() !== '') || [];
    
    await updateDoc(doc(db, 'products', editingProduct), {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      images: filteredImages,
      imageURL: filteredImages[0] || formData.imageURL
    });
    toast.success('Product updated');
    setEditingProduct(null);
  };

  return (
    <div className="page-transition">
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Manage Products</h1>

      {editingProduct && (
        <div className="card" style={{ marginBottom: '32px', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Edit Product</h2>
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Product name"
              required
            />
            <textarea
              className="input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              rows="3"
              required
            />
            <ImageInput 
              images={formData.images || ['', '', '', '', '']} 
              setImages={(images) => setFormData({ ...formData, images })} 
              maxImages={5} 
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <input
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
                required
              />
              <input
                type="number"
                className="input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Stock"
                required
              />
            </div>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="Shirts">Shirts</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Jackets">Jackets</option>
              <option value="Accessories">Accessories</option>
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary">Update</button>
              <button type="button" className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {products.map(product => (
          <div key={product.id} className="card">
            <img
              src={product.imageURL || product.images?.[0] || '/placeholder-product.png'}
              alt={product.name}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
              onError={(e) => { 
                console.error('Image load error for product:', product.name, product.imageURL || product.images?.[0]);
                e.target.src = '/placeholder-product.png'; 
              }}
            />
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{product.name}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>
              {product.description?.substring(0, 60)}...
            </p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff2e2e', marginBottom: '8px' }}>₹{product.price}</p>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px' }}>
              Stock: {product.stock} | Category: {product.category}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleEdit(product)} className="btn-secondary" style={{ flex: 1, padding: '8px' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(product.id)} className="btn-primary" style={{ flex: 1, padding: '8px', background: '#dc2626' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProducts;
