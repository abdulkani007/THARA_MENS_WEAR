import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart, addToFavorites, isFavorite } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadProduct();
    loadRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    try {
      // Try products collection first
      let docRef = doc(db, 'products', id);
      let docSnap = await getDoc(docRef);
      
      // If not found, try kidsProducts collection
      if (!docSnap.exists()) {
        docRef = doc(db, 'kidsProducts', id);
        docSnap = await getDoc(docRef);
      }
      
      // If still not found, try accessories collection
      if (!docSnap.exists()) {
        docRef = doc(db, 'accessories', id);
        docSnap = await getDoc(docRef);
      }
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setProduct(data);
      } else {
        toast.error('Product not found');
        navigate('/user');
      }
    } catch (error) {
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const q = query(collection(db, 'ratings'), where('productId', '==', id));
      const snapshot = await getDocs(q);
      const ratingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(ratingsData);
      
      if (ratingsData.length > 0) {
        const avg = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
        setAverageRating(avg);
      }
      
      if (currentUser) {
        const userRatingDoc = ratingsData.find(r => r.userId === currentUser.uid);
        setUserRating(userRatingDoc || null);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleRating = async (rating) => {
    if (!currentUser) {
      toast.error('Please login to rate this product');
      return;
    }

    try {
      if (userRating) {
        await updateDoc(doc(db, 'ratings', userRating.id), { rating });
        toast.success('Rating updated');
      } else {
        await addDoc(collection(db, 'ratings'), {
          productId: id,
          userId: currentUser.uid,
          userEmail: currentUser.email,
          rating,
          createdAt: new Date()
        });
        toast.success('Rating added');
      }
      loadRatings();
    } catch (error) {
      toast.error('Error saving rating');
    }
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const getAvailableStock = () => {
    if (!product) return 0;
    if (product.stockBySize && selectedSize) {
      return product.stockBySize[selectedSize] || product.stock || 0;
    }
    return product.stock || 0;
  };

  const nextImage = () => {
    const images = product.images || [product.imageURL];
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = product.images || [product.imageURL];
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [product.imageURL];
  const stock = getAvailableStock();
  const isOutOfStock = stock === 0;

  return (
    <div className="product-details-page page-transition">
      <button onClick={() => navigate(-1)} className="back-btn">
        <FiChevronLeft /> Back
      </button>

      <div className="product-details-container">
        {/* Image Section */}
        <div className="product-images-section">
          <div className="main-image-wrapper">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="main-product-image"
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="image-nav-btn prev-btn">
                  <FiChevronLeft />
                </button>
                <button onClick={nextImage} className="image-nav-btn next-btn">
                  <FiChevronRight />
                </button>
              </>
            )}
            {isOutOfStock && <div className="out-of-stock-overlay">OUT OF STOCK</div>}
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="product-info-section">
          <div className="product-header">
            <div>
              <p className="product-category">{product.category}</p>
              <h1 className="product-title">{product.name}</h1>
              {product.tags && (
                <div className="product-tags">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => addToFavorites(product)}
              className="wishlist-btn-large"
            >
              <FiHeart
                style={{
                  fill: isFavorite(product.id) ? '#ff2e2e' : 'none',
                  stroke: isFavorite(product.id) ? '#ff2e2e' : '#fff'
                }}
              />
            </button>
          </div>

          <div className="price-section">
            <span className="product-price">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="original-price">₹{product.originalPrice}</span>
                <span className="discount-badge">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          {!isOutOfStock && stock <= 5 && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>
                Hurry! Only {stock} {stock === 1 ? 'item' : 'items'} left in stock
              </span>
            </div>
          )}
          {isOutOfStock && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px', letterSpacing: '1px' }}>
                SOLD OUT
              </span>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="selection-section">
              <label className="selection-label">
                Select Size
                {selectedSize && stock > 0 && stock < 10 && (
                  <span className="stock-warning">Only {stock} left!</span>
                )}
              </label>
              <div className="size-options">
                {product.sizes.map((size) => {
                  const sizeStock = product.stockBySize?.[size] || product.stock || 0;
                  const isSizeOutOfStock = sizeStock === 0;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => !isSizeOutOfStock && setSelectedSize(size)}
                      className={`size-btn ${selectedSize === size ? 'active' : ''} ${isSizeOutOfStock ? 'disabled' : ''}`}
                      disabled={isSizeOutOfStock}
                    >
                      {size}
                      {isSizeOutOfStock && <span className="size-out">✕</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="selection-section">
              <label className="selection-label">Select Color</label>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    style={{ background: color.toLowerCase() }}
                    title={color}
                  >
                    {selectedColor === color && <span className="color-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="selection-section">
            <label className="selection-label">Quantity</label>
            <div className="quantity-selector">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="qty-btn"
              >
                -
              </button>
              <span className="qty-display">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="qty-btn"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleAddToCart}
              className="add-to-cart-btn-large"
              disabled={isOutOfStock || (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)}
              style={{
                opacity: (isOutOfStock || (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) ? 0.5 : 1,
                cursor: (isOutOfStock || (product.sizes?.length > 0 && !selectedSize) || (product.colors?.length > 0 && !selectedColor)) ? 'not-allowed' : 'pointer'
              }}
            >
              <FiShoppingCart />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Features */}
          <div className="product-features">
            <div className="feature-item">
              <FiTruck />
              <span>Free Delivery on orders above ₹999</span>
            </div>
            <div className="feature-item">
              <FiRefreshCw />
              <span>Easy 7 days return & exchange</span>
            </div>
            <div className="feature-item">
              <FiShield />
              <span>100% Authentic Products</span>
            </div>
          </div>

          {/* Description */}
          <div className="product-description">
            <h3>Product Details</h3>
            <p>{product.description}</p>
            {product.material && <p><strong>Material:</strong> {product.material}</p>}
            {product.fit && <p><strong>Fit:</strong> {product.fit}</p>}
          </div>

          {/* Rating Section */}
          <div className="product-rating-section">
            <h3>Customer Ratings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiStar size={24} fill="#FF2E2E" stroke="#FF2E2E" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF2E2E' }}>
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                </span>
              </div>
              <span style={{ color: '#C5C6C7' }}>({ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'})</span>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '12px', color: '#C5C6C7' }}>Rate this product:</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <FiStar
                      size={28}
                      fill={star <= (userRating?.rating || 0) ? '#FF2E2E' : 'none'}
                      stroke="#FF2E2E"
                    />
                  </button>
                ))}
              </div>
              {userRating && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#66FCF1' }}>
                  You rated this product {userRating.rating} star{userRating.rating > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
