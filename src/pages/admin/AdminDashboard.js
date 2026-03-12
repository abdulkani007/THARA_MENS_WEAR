import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { FiHome, FiPackage, FiPlus, FiShoppingCart, FiUsers, FiTag, FiUser, FiLogOut, FiMenu, FiX, FiGrid, FiAlertTriangle, FiSmile, FiArchive, FiWatch, FiImage, FiStar, FiRotateCcw, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import logo from '../../assets/thara-logo.jpeg';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, todayOrders: 0, yesterdayOrders: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const productsSnap = await getDocs(collection(db, 'products'));
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'user')));
    
    // Calculate today and yesterday orders
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    let todayCount = 0;
    let yesterdayCount = 0;
    
    ordersSnap.docs.forEach(doc => {
      const orderDate = doc.data().createdAt?.toDate();
      if (orderDate >= todayStart) {
        todayCount++;
      } else if (orderDate >= yesterdayStart && orderDate < todayStart) {
        yesterdayCount++;
      }
    });
    
    setStats({
      products: productsSnap.size,
      orders: ordersSnap.size,
      users: usersSnap.size,
      todayOrders: todayCount,
      yesterdayOrders: yesterdayCount
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { path: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/admin/add-product', icon: FiPlus, label: 'Add Product' },
    { path: '/admin/products', icon: FiPackage, label: 'Manage Products' },
    { path: '/admin/categories', icon: FiGrid, label: 'Categories' },
    { path: '/admin/inventory', icon: FiAlertTriangle, label: 'Inventory' },
    { path: '/admin/kids-collection', icon: FiSmile, label: 'Kids Collection' },
    { path: '/admin/accessories', icon: FiWatch, label: 'Accessories' },
    { path: '/admin/banners', icon: FiImage, label: 'Banners' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/admin/history', icon: FiArchive, label: 'History' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/coupons', icon: FiTag, label: 'Coupons' },
    { path: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { path: '/admin/returns', icon: FiRotateCcw, label: 'Return Requests' },
    { path: '/admin/profile', icon: FiUser, label: 'Profile' }
  ];

  const isActive = (path, exact) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f' }}>
      <aside style={{
        width: '260px',
        background: '#000000',
        borderRight: '1px solid #1F2833',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 1000,
        transform: sidebarOpen ? 'translateX(0)' : window.innerWidth <= 1024 ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <img src={logo} alt="THARA Admin" style={{ height: '35px', width: 'auto' }} />
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: window.innerWidth <= 1024 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            <FiX />
          </button>
        </div>

        <nav style={{ padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: isActive(item.path, item.exact) ? 'rgba(255, 46, 46, 0.15)' : 'none',
                border: 'none',
                borderLeft: isActive(item.path, item.exact) ? '3px solid #ff2e2e' : '3px solid transparent',
                color: isActive(item.path, item.exact) ? '#ff2e2e' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                textDecoration: 'none',
                fontWeight: isActive(item.path, item.exact) ? '600' : '400'
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              borderLeft: '3px solid transparent',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              marginTop: 'auto'
            }}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <div style={{ flex: 1, marginLeft: window.innerWidth <= 1024 ? 0 : '260px', minHeight: '100vh' }}>
        <header style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: window.innerWidth <= 1024 ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            <FiMenu />
          </button>
          <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Admin Panel</h1>
        </header>

        <main style={{ padding: '32px', maxWidth: '1400px' }}>
        {location.pathname === '/admin' ? (
          <div className="page-transition">
            <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Dashboard</h1>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Total Products</h3>
                <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#ff2e2e' }}>{stats.products}</p>
              </div>
              
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Total Orders</h3>
                <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#ff2e2e' }}>{stats.orders}</p>
              </div>
              
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Today's Orders</h3>
                <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#22c55e' }}>{stats.todayOrders}</p>
                {stats.todayOrders > 0 && (
                  <span style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    🔔 New orders today!
                  </span>
                )}
              </div>
              
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Yesterday's Orders</h3>
                <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.yesterdayOrders}</p>
              </div>
              
              <div className="card">
                <h3 style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>Total Users</h3>
                <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#ff2e2e' }}>{stats.users}</p>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Welcome to Admin Panel</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
                Manage your products, orders, and users from this dashboard. Use the sidebar to navigate between different sections.
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
        </main>
      </div>

      {sidebarOpen && window.innerWidth <= 1024 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
