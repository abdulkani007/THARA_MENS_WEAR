import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import BackButton from '../../components/BackButton';
import './Accessories.css';

const ACCESSORY_CATEGORIES = ['Belts', 'Caps', 'Wallets', 'Sunglasses', 'Perfumes', 'Watches', 'Bags'];

const Accessories = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('');
  const { addToCart, addToFavorites, isFavorite } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const q = query(collection(db, 'products'), where('category', '==', 'Accessories'));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(search.toLowerCase());
      const matchesSubCategory = subCategory === '' || product.subCategory === subCategory;
      
      let matchesPrice = true;
      if (priceRange === 'under500') matchesPrice = product.price < 500;
      else if (priceRange === '500-1500') matchesPrice = product.price >= 500 && product.price <= 1500;
      else if (priceRange === 'above1500') matchesPrice = product.price > 1500;
      
      return matchesSearch && matchesSubCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const clearFilters = () => {
    setSearch('');
    setSubCategory('');
    setPriceRange('');
    setSortBy('');
  };

  return (
    <div className="accessories-page page-transition">
      <BackButton to="/user" />
      <div className="accessories-header">
        <h1 className="accessories-title">ACCESSORIES</h1>
        <p className="accessories-subtitle">Complete Your Look</p>
      </div>

      <div className="accessories-container">
        <aside className="accessories-filter-sidebar">
          <div className="accessories-filter-header">
            <h3>FILTERS</h3>
            {(search || subCategory || priceRange || sortBy) && (
              <button onClick={clearFilters} className="accessories-clear-btn">Clear All</button>
            )}
          </div>

          <div className="accessories-filter-section">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search accessories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="accessories-filter-input"
            />
          </div>

          <div className="accessories-filter-section">
            <label>Type</label>
            <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="accessories-filter-select">
              <option value="">All Types</option>
              {ACCESSORY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="accessories-filter-section">
            <label>Price Range</label>
            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="accessories-filter-select">
              <option value="">All Prices</option>
              <option value="under500">Under ₹500</option>
              <option value="500-1500">₹500 - ₹1,500</option>
              <option value="above1500">Above ₹1,500</option>
            </select>
          </div>

          <div className="accessories-filter-section">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="accessories-filter-select">
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          <div className="accessories-filter-info">
            <p>{filteredProducts.length} Products</p>
          </div>
        </aside>

        <main className="accessories-products-section">
          {filteredProducts.length > 0 ? (
            <div className="accessories-products-grid">
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
            <div className="accessories-no-products">
              <p>No accessories found</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Accessories;
