import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';
import ImageInput from '../../components/ImageInput';
import './AddProduct.css';

const CATEGORIES = ['Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Jackets', 'Hoodies', 'Accessories', 'Perfumes'];
const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
const PANT_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42'];
const PRESET_COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Grey', 'Navy', 'Beige', 'Brown', 'Olive'];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sizes: [],
    colors: [],
    images: ['', '', '', '', ''],
    returnAllowed: true,
    returnDays: 7
  });

  const setImages = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const toggleSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const addCustomColor = () => {
    const color = customColorInput.trim();
    if (!color) {
      toast.error('Enter a color name');
      return;
    }
    const colorName = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    if (formData.colors.includes(colorName)) {
      toast.error('Color already added');
      return;
    }
    setFormData(prev => ({ ...prev, colors: [...prev.colors, colorName] }));
    setCustomColorInput('');
    toast.success(`${colorName} added`);
  };

  const removeColor = (color) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return false;
    }
    if (formData.sizes.length === 0) {
      toast.error('Select at least one size');
      return false;
    }
    const filteredImages = formData.images.filter(img => img.trim() !== '');
    if (filteredImages.length === 0) {
      toast.error('Upload at least one image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const filteredImages = formData.images.filter(img => img.trim() !== '');

      await addDoc(collection(db, 'products'), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category: formData.category,
        sizes: formData.sizes,
        colors: formData.colors,
        images: filteredImages,
        imageURL: filteredImages[0],
        returnAllowed: formData.returnAllowed,
        returnDays: formData.returnAllowed ? formData.returnDays : 0,
        createdAt: serverTimestamp()
      });
      
      toast.success('Product added successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPantCategory = formData.category === 'Jeans' || formData.category === 'Pants';
  const availableSizes = isPantCategory ? PANT_SIZES : CLOTHING_SIZES;

  return (
    <div className="add-product-page">
      <BackButton to="/admin/products" />
      <div className="product-form-container">
        <h1 className="form-title">Add New Product</h1>

        <form onSubmit={handleSubmit} className="product-form">
          
          <div className="form-group full-width">
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, sizes: [] })}
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sizes * {isPantCategory && '(Waist)'}</label>
            <div className="size-grid">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`size-btn ${formData.sizes.includes(size) ? 'active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <label>Colors</label>
            <div className="color-grid">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  className={`color-btn ${formData.colors.includes(color) ? 'active' : ''}`}
                  style={{ background: color.toLowerCase() }}
                  title={color}
                >
                  {formData.colors.includes(color) && '✓'}
                </button>
              ))}
            </div>

            <div className="custom-color-input">
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                placeholder="Add custom color (e.g., Maroon)"
              />
              <button type="button" onClick={addCustomColor} className="add-color-btn">
                Add Color
              </button>
            </div>

            {formData.colors.length > 0 && (
              <div className="selected-colors">
                {formData.colors.map(color => (
                  <span key={color} className="color-tag">
                    {color}
                    <button type="button" onClick={() => removeColor(color)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <ImageInput images={formData.images} setImages={setImages} maxImages={5} />
          </div>

          <div className="form-group full-width">
            <label className="toggle-label">
              <span>Return Policy</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.returnAllowed}
                  onChange={(e) => setFormData({ ...formData, returnAllowed: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </div>
            </label>
            {formData.returnAllowed && (
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>Return Window</label>
                <select
                  value={formData.returnDays}
                  onChange={(e) => setFormData({ ...formData, returnDays: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#0a0a0a',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value={7}>Return within 7 days</option>
                  <option value={10}>Return within 10 days</option>
                  <option value={15}>Return within 15 days</option>
                  <option value={30}>Return within 30 days</option>
                </select>
              </div>
            )}
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
              {formData.returnAllowed ? `Customers can return within ${formData.returnDays} days of delivery` : 'Returns not allowed for this product'}
            </p>
          </div>

          <div className="form-actions full-width">
            <button type="button" onClick={() => navigate('/admin/products')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
