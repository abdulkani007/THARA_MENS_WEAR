import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Loading from './components/Loading';
import './mobile.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';
import ManageProducts from './pages/admin/ManageProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminHistory from './pages/admin/AdminHistory';
import AccessoriesManagement from './pages/admin/AccessoriesManagement';
import AdminUsers from './pages/admin/AdminUsers';
import Categories from './pages/admin/Categories';
import Inventory from './pages/admin/Inventory';
import Coupons from './pages/admin/Coupons';
import Banners from './pages/admin/Banners';
import KidsCollection from './pages/admin/KidsCollection';
import AdminReviews from './pages/admin/AdminReviews';
import ReturnRequests from './pages/admin/ReturnRequests';

import UserDashboard from './pages/user/UserDashboard';
import UserHome from './pages/user/UserHome';
import Collections from './pages/user/Collections';
import UserKids from './pages/user/UserKids';
import Accessories from './pages/user/Accessories';
import ProductDetails from './pages/user/ProductDetails';
import Favorites from './pages/user/Favorites';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';

function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Loading onLoadingComplete={() => setLoading(false)} />;
  }

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f1f1f',
                color: '#fff',
                border: '1px solid rgba(255, 46, 46, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#ff2e2e',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route path="add-product" element={<AddProduct />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="kids-collection" element={<KidsCollection />} />
              <Route path="accessories" element={<AccessoriesManagement />} />
              <Route path="banners" element={<Banners />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="history" element={<AdminHistory />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="returns" element={<ReturnRequests />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/user" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<UserHome />} />
              <Route path="collections" element={<Collections />} />
              <Route path="accessories" element={<Accessories />} />
              <Route path="kids" element={<UserKids />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
