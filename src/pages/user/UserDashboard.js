import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const UserDashboard = () => {
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '80vh', width: '100%' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
