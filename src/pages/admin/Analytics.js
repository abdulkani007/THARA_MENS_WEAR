import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiDollarSign, FiUsers, FiShoppingCart, FiArrowUp, FiArrowDown, FiAlertCircle } from 'react-icons/fi';
import ReactApexChart from 'react-apexcharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    yesterdayOrders: 0,
    yesterdayRevenue: 0,
    todayLogins: 0,
    yesterdayLogins: 0
  });
  const [ordersData, setOrdersData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(query(collection(db, 'users'), where('role', '==', 'user')))
        ]);

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        
        let todayOrdersCount = 0;
        let todayRevenueTotal = 0;
        let yesterdayOrdersCount = 0;
        let yesterdayRevenueTotal = 0;

        ordersSnap.docs.forEach(doc => {
          const orderDate = doc.data().createdAt?.toDate();
          const orderPrice = doc.data().totalPrice || 0;
          
          if (orderDate >= todayStart) {
            todayOrdersCount++;
            todayRevenueTotal += orderPrice;
          } else if (orderDate >= yesterdayStart && orderDate < todayStart) {
            yesterdayOrdersCount++;
            yesterdayRevenueTotal += orderPrice;
          }
        });

        let lowStockCount = 0;
        const lowStockItems = [];
        productsSnap.docs.forEach(doc => {
          const stock = doc.data().stock || 0;
          if (stock < 10) {
            lowStockCount++;
            lowStockItems.push({
              id: doc.id,
              name: doc.data().name,
              stock: stock,
              category: doc.data().category || 'N/A'
            });
          }
        });
        
        // Sort by stock (lowest first)
        lowStockItems.sort((a, b) => a.stock - b.stock);
        setLowStockProducts(lowStockItems);

        // Process orders data
        const ordersLast7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayOrders = ordersSnap.docs.filter(doc => {
            const orderDate = doc.data().createdAt?.toDate();
            return orderDate >= date && orderDate < nextDate;
          });

          ordersLast7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: dayOrders.length
          });
        }

        // Process revenue data
        const revenueLast7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayRevenue = ordersSnap.docs
            .filter(doc => {
              const orderDate = doc.data().createdAt?.toDate();
              return orderDate >= date && orderDate < nextDate;
            })
            .reduce((sum, doc) => sum + (doc.data().totalPrice || 0), 0);

          revenueLast7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: dayRevenue
          });
        }

        // Fetch login stats from Firestore
        const loginSessionsSnap = await getDocs(collection(db, 'loginSessions'));
        
        let todayLoginsCount = 0;
        let yesterdayLoginsCount = 0;
        const loginsByDay = {};

        loginSessionsSnap.docs.forEach(doc => {
          const loginDate = doc.data().date?.toDate();
          if (!loginDate) return;
          
          if (loginDate >= todayStart) {
            todayLoginsCount++;
          } else if (loginDate >= yesterdayStart && loginDate < todayStart) {
            yesterdayLoginsCount++;
          }
          
          // Count logins for last 7 days
          const dateKey = loginDate.toDateString();
          loginsByDay[dateKey] = (loginsByDay[dateKey] || 0) + 1;
        });

        // Process login data for last 7 days
        const loginLast7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const dateKey = date.toDateString();
          const count = loginsByDay[dateKey] || 0;

          loginLast7Days.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            count: count
          });
        }

        setStats({
          todayOrders: todayOrdersCount,
          todayRevenue: todayRevenueTotal,
          totalProducts: productsSnap.size,
          totalCustomers: usersSnap.size,
          lowStockProducts: lowStockCount,
          yesterdayOrders: yesterdayOrdersCount,
          yesterdayRevenue: yesterdayRevenueTotal,
          todayLogins: todayLoginsCount,
          yesterdayLogins: yesterdayLoginsCount
        });

        setLoginData(loginLast7Days);

        setOrdersData(ordersLast7Days);
        setRevenueData(revenueLast7Days);
        setLoading(false);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // ApexCharts configuration
  const chartAnimation = {
    enabled: true,
    easing: 'easeinout',
    speed: 800,
    animateGradually: {
      enabled: true,
      delay: 150
    },
    dynamicAnimation: {
      enabled: true,
      speed: 350
    }
  };

  const ordersChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
      animations: chartAnimation
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#ff2e2e'],
    xaxis: {
      categories: ordersData.map(d => d.date),
      labels: { style: { colors: '#C5C6C7' } }
    },
    yaxis: {
      labels: { style: { colors: '#C5C6C7' } }
    },
    grid: {
      borderColor: '#1F2833',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      style: { fontSize: '12px' },
      y: { formatter: (val) => `${val} orders` }
    },
    markers: {
      size: 5,
      colors: ['#ff2e2e'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { size: 7 }
    }
  };

  const revenueChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      animations: chartAnimation
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `₹${val.toFixed(0)}`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#66FCF1']
      }
    },
    colors: ['#66FCF1'],
    xaxis: {
      categories: revenueData.map(d => d.date),
      labels: { style: { colors: '#C5C6C7' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#C5C6C7' },
        formatter: (val) => `₹${val.toFixed(0)}`
      }
    },
    grid: {
      borderColor: '#1F2833',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `₹${val.toFixed(2)}` }
    }
  };

  const loginChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
      animations: chartAnimation
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        distributed: true
      }
    },
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140'],
    xaxis: {
      categories: loginData.map(d => d.date),
      labels: { style: { colors: '#C5C6C7' } }
    },
    yaxis: {
      labels: { style: { colors: '#C5C6C7' } }
    },
    grid: {
      borderColor: '#1F2833',
      strokeDashArray: 4
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (val) => `${val} logins` }
    },
    legend: { show: false }
  };

  if (loading) {
    return (
      <div className="page-transition" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)' }}>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(135deg, #ff2e2e 0%, #66FCF1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics Dashboard</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>Real-time business insights and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Users Today Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid rgba(102, 252, 241, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 252, 241, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(102, 252, 241, 0.2)', borderRadius: '8px' }}>
                  <FiUsers size={20} style={{ color: '#66FCF1' }} />
                </div>
                <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>Users Today</h3>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{stats.todayLogins}</p>
              {stats.yesterdayLogins > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: stats.todayLogins >= stats.yesterdayLogins ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {stats.todayLogins >= stats.yesterdayLogins ? (
                    <><FiArrowUp size={14} color="#22c55e" /> <span style={{ color: '#22c55e' }}>+{getPercentageChange(stats.todayLogins, stats.yesterdayLogins)}%</span></>
                  ) : (
                    <><FiArrowDown size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>{getPercentageChange(stats.todayLogins, stats.yesterdayLogins)}%</span></>
                  )}
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>vs yesterday</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Orders Today Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 46, 46, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid rgba(255, 46, 46, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 46, 46, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(255, 46, 46, 0.2)', borderRadius: '8px' }}>
                  <FiShoppingCart size={20} style={{ color: '#ff2e2e' }} />
                </div>
                <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>Orders Today</h3>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{stats.todayOrders}</p>
              {stats.yesterdayOrders > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: stats.todayOrders >= stats.yesterdayOrders ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {stats.todayOrders >= stats.yesterdayOrders ? (
                    <><FiArrowUp size={14} color="#22c55e" /> <span style={{ color: '#22c55e' }}>+{getPercentageChange(stats.todayOrders, stats.yesterdayOrders)}%</span></>
                  ) : (
                    <><FiArrowDown size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>{getPercentageChange(stats.todayOrders, stats.yesterdayOrders)}%</span></>
                  )}
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>vs yesterday</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px' }}>
                  <FiDollarSign size={20} style={{ color: '#22c55e' }} />
                </div>
                <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600' }}>Revenue Today</h3>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>₹{stats.todayRevenue.toFixed(0)}</p>
              {stats.yesterdayRevenue > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: stats.todayRevenue >= stats.yesterdayRevenue ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {stats.todayRevenue >= stats.yesterdayRevenue ? (
                    <><FiArrowUp size={14} color="#22c55e" /> <span style={{ color: '#22c55e' }}>+{getPercentageChange(stats.todayRevenue, stats.yesterdayRevenue)}%</span></>
                  ) : (
                    <><FiArrowDown size={14} color="#ef4444" /> <span style={{ color: '#ef4444' }}>{getPercentageChange(stats.todayRevenue, stats.yesterdayRevenue)}%</span></>
                  )}
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>vs yesterday</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Total Products Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '12px' }}>
              <FiShoppingCart size={24} style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Total Products</h3>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: '1' }}>{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Total Customers Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(236, 72, 153, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.2)', borderRadius: '12px' }}>
              <FiUsers size={24} style={{ color: '#ec4899' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Total Customers</h3>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: '1' }}>{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
          border: '1px solid rgba(251, 146, 60, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(251, 146, 60, 0.4)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(251, 146, 60, 0.2)', borderRadius: '12px' }}>
              <FiAlertCircle size={24} style={{ color: '#fb923c' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: '600', marginBottom: '4px' }}>Low Stock Alert</h3>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: '1' }}>{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div style={{
        background: '#111111',
        border: '1px solid #1F2833',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>Orders Analytics (Last 7 Days)</h2>
        <ReactApexChart
          options={ordersChartOptions}
          series={[{ name: 'Orders', data: ordersData.map(d => d.count) }]}
          type="line"
          height={300}
        />
      </div>

      {/* User Login Analytics Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 252, 241, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        border: '1px solid rgba(102, 252, 241, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#66FCF1' }}>User Login Analytics</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Track daily user login activity</p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          background: 'rgba(102, 252, 241, 0.1)',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid rgba(102, 252, 241, 0.2)'
        }}>
          <div style={{
            padding: '16px',
            background: 'rgba(102, 252, 241, 0.2)',
            borderRadius: '12px'
          }}>
            <FiUsers size={32} style={{ color: '#66FCF1' }} />
          </div>
          <div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>Users Logged In Today</p>
            <p style={{ fontSize: '36px', fontWeight: '700', color: '#fff', lineHeight: '1' }}>{stats.todayLogins}</p>
          </div>
        </div>

        <ReactApexChart
          options={loginChartOptions}
          series={[{ name: 'Logins', data: loginData.map(d => d.count) }]}
          type="bar"
          height={300}
        />
      </div>

      {/* Revenue Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px'
      }}>
        <div style={{
          background: '#111111',
          border: '1px solid #1F2833',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>Revenue Analytics (Last 7 Days)</h2>
          <ReactApexChart
            options={revenueChartOptions}
            series={[{ name: 'Revenue', data: revenueData.map(d => d.amount) }]}
            type="bar"
            height={300}
          />
        </div>

        {/* Low Stock Products Table */}
        <div style={{
          background: '#111111',
          border: '1px solid #1F2833',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>Low Stock Products</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {lowStockProducts.length === 0 ? (
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '40px 0' }}>All products are well stocked!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowStockProducts.map((product, index) => (
                  <div key={product.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    background: product.stock === 0 ? 'rgba(239, 68, 68, 0.1)' : product.stock < 5 ? 'rgba(251, 146, 60, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    border: `1px solid ${product.stock === 0 ? 'rgba(239, 68, 68, 0.3)' : product.stock < 5 ? 'rgba(251, 146, 60, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{product.name}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{product.category}</p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      background: product.stock === 0 ? 'rgba(239, 68, 68, 0.2)' : product.stock < 5 ? 'rgba(251, 146, 60, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                      borderRadius: '20px'
                    }}>
                      <FiAlertCircle size={16} style={{ color: product.stock === 0 ? '#ef4444' : product.stock < 5 ? '#fb923c' : '#eab308' }} />
                      <span style={{ fontSize: '14px', fontWeight: '700', color: product.stock === 0 ? '#ef4444' : product.stock < 5 ? '#fb923c' : '#eab308' }}>
                        {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
