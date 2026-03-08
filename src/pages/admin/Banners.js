import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { uploadImageToMongoDB, deleteImageFromMongoDB } from '../../services/imageService';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    link: '/login',
    displayLocation: 'landing',
    image: null
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const snapshot = await getDocs(collection(db, 'banners'));
    setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const imageURL = await uploadImageToMongoDB(formData.image, `banner_${Date.now()}`);

      await addDoc(collection(db, 'banners'), {
        title: formData.title,
        subtitle: formData.subtitle,
        buttonText: formData.buttonText,
        link: formData.link,
        displayLocation: formData.displayLocation,
        imageURL,
        active: true,
        createdAt: new Date()
      });

      toast.success('Banner created');
      setFormData({ title: '', subtitle: '', buttonText: 'Shop Now', link: '/login', displayLocation: 'landing', image: null });
      setShowForm(false);
      loadBanners();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    await updateDoc(doc(db, 'banners', id), { active: !currentStatus });
    toast.success('Status updated');
    loadBanners();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      const banner = banners.find(b => b.id === id);
      await deleteDoc(doc(db, 'banners', id));
      if (banner?.imageURL) {
        await deleteImageFromMongoDB(banner.imageURL);
      }
      toast.success('Banner deleted');
      loadBanners();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Banner Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
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
            cursor: 'pointer'
          }}
        >
          <FiPlus size={18} /> Create Banner
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Create New Banner</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Banner Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{
                padding: '12px 16px',
                background: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              required
            />
            <input
              type="text"
              placeholder="Subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              style={{
                padding: '12px 16px',
                background: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder="Button Text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              style={{
                padding: '12px 16px',
                background: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <input
              type="text"
              placeholder="Link (e.g., /login)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              style={{
                padding: '12px 16px',
                background: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <select
              value={formData.displayLocation}
              onChange={(e) => setFormData({ ...formData, displayLocation: e.target.value })}
              style={{
                padding: '12px 16px',
                background: '#0f0f0f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              required
            >
              <option value="landing">Landing Page</option>
              <option value="home">Home Page</option>
            </select>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px 16px', background: '#0f0f0f', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                <FiImage /> {formData.image ? formData.image.name : 'Select Banner Image'}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} required />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={uploading} style={{ flex: 1, padding: '12px', background: '#ff2e2e', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : 'Create Banner'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No banners yet</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px' }}>Create your first banner</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {banners.map(banner => (
            <div key={banner.id} style={{ background: '#1a1a1a', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px' }}>
              <img src={banner.imageURL} alt={banner.title} style={{ width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{banner.title}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '8px' }}>{banner.subtitle}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                  Location: {banner.displayLocation === 'landing' ? 'Landing Page' : 'Home Page'} | Button: {banner.buttonText} → {banner.link}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: banner.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(156, 163, 175, 0.15)', color: banner.active ? '#22c55e' : '#9ca3af' }}>
                  {banner.active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => toggleActive(banner.id, banner.active)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '8px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {banner.active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                </button>
                <button onClick={() => handleDelete(banner.id)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Banners;
