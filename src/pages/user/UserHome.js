import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCart } from '../../context/CartContext';
import { FiSearch, FiX } from 'react-icons/fi';
import CustomSelect from '../../components/CustomSelect';
import ProductCard from '../../components/ProductCard';
import HomeBannerSlider from '../../components/HomeBannerSlider';
import './UserHome.css';

const UserHome = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart, addToFavorites, isFavorite } = useCart();

  const SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
  
  // Get unique colors from all products
  const availableColors = [...new Set(products.flatMap(p => p.colors || []))].sort();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === '' || product.category === category;
      
      let matchesPrice = true;
      if (priceRange === 'under1000') matchesPrice = product.price < 1000;
      else if (priceRange === '1000-2000') matchesPrice = product.price >= 1000 && product.price <= 2000;
      else if (priceRange === 'above2000') matchesPrice = product.price > 2000;
      
      const matchesSize = selectedSize === '' || (product.sizes && product.sizes.includes(selectedSize));
      const matchesColor = selectedColor === '' || (product.colors && product.colors.includes(selectedColor));
      
      return matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesColor;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const clearFilters = () => {
    setCategory('');
    setPriceRange('');
    setSortBy('');
    setSearch('');
    setSelectedSize('');
    setSelectedColor('');
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Shirts', label: 'Shirts' },
    { value: 'T-Shirts', label: 'T-Shirts' },
    { value: 'Jeans', label: 'Jeans' },
    { value: 'Pants', label: 'Pants' },
    { value: 'Jackets', label: 'Jackets' },
    { value: 'Hoodies', label: 'Hoodies' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Perfumes', label: 'Perfumes' }
  ];

  const priceOptions = [
    { value: '', label: 'All Prices' },
    { value: 'under1000', label: 'Under ₹1,000' },
    { value: '1000-2000', label: '₹1,000 - ₹2,000' },
    { value: 'above2000', label: 'Above ₹2,000' }
  ];

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  return (
    <div className="user-home page-transition">
      <HomeBannerSlider />

      <div className="shop-container">
        <aside className="filter-sidebar">
          <div className="filter-header">
            <h3>FILTERS</h3>
            {(category || priceRange || sortBy || search || selectedSize || selectedColor) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                <FiX /> Clear
              </button>
            )}
          </div>

          <div className="filter-section">
            <label className="filter-label">Search</label>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Category</label>
            <CustomSelect
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              placeholder="Select category"
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Price Range</label>
            <CustomSelect
              value={priceRange}
              onChange={setPriceRange}
              options={priceOptions}
              placeholder="Select price range"
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Sort By</label>
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Size</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  style={{
                    padding: '8px 16px',
                    background: selectedSize === size ? '#ff2e2e' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (selectedSize === size ? '#ff2e2e' : 'rgba(255, 255, 255, 0.1)'),
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selectedSize === size ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Color</label>
            {availableColors.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    title={color}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: color.toLowerCase(),
                      border: selectedColor === color ? '3px solid #ff2e2e' : '2px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedColor === color ? '0 0 0 2px rgba(255, 46, 46, 0.3)' : 'none'
                    }}
                  >
                    {selectedColor === color && <span style={{ color: color === 'White' ? '#000' : '#fff', fontWeight: 'bold' }}>✓</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>No colors available</p>
            )}
          </div>

          <div className="filter-info">
            <p>{filteredProducts.length} Products Found</p>
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
              <p>No products found matching your criteria</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserHome;
