import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import BackButton from '../../components/BackButton';
import './Collections.css';

const UserKids = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { addToCart, addToFavorites, isFavorite } = useCart();

  const KIDS_CATEGORIES = ['Boys Shirts', 'Boys T-Shirts', 'Boys Jeans', 'Boys Pants', 'Girls Dresses', 'Girls Tops', 'Girls Jeans', 'Girls Skirts'];
  const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y', '14-15Y'];
  const availableColors = [...new Set(products.flatMap(p => p.colors || []))].sort();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snapshot = await getDocs(collection(db, 'kidsProducts'));
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === '' || product.category === category;
      const matchesSize = selectedSize === '' || (product.sizes && product.sizes.includes(selectedSize));
      const matchesColor = selectedColor === '' || (product.colors && product.colors.includes(selectedColor));
      return matchesSearch && matchesCategory && matchesSize && matchesColor;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSelectedSize('');
    setSelectedColor('');
    setSortBy('');
  };

  return (
    <div className="collections-page">
      <BackButton to="/user" />
      <div className="collections-header">
        <h1 className="collections-title">KIDS COLLECTION</h1>
        <p className="collections-subtitle">Discover Premium Kids Fashion</p>
      </div>

      <div className="collections-container">
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>FILTERS</h3>
            {(search || category || selectedSize || selectedColor || sortBy) && (
              <button onClick={clearFilters} className="clear-btn">Clear All</button>
            )}
          </div>

          <div className="filter-section">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search kids products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
              <option value="">All Categories</option>
              {KIDS_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          <div className="filter-section">
            <label>Age Size</label>
            <div className="size-grid">
              {KIDS_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label>Color</label>
            <div className="color-grid">
              {availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  style={{ background: color.toLowerCase() }}
                  title={color}
                >
                  {selectedColor === color && '✓'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-info">
            <p>{filteredProducts.length} Products</p>
          </div>
        </aside>

        <main className="products-section">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onAddToFavorites={addToFavorites}
                  isFavorite={isFavorite(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No kids products found</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserKids;
