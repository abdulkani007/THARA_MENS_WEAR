import React, { useState } from 'react';
import OrderTracker from './OrderTracker';

const OrderTrackerDemo = () => {
  const [currentStatus, setCurrentStatus] = useState('placed');
  
  const statuses = [
    { value: 'placed', label: 'Placed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' }
  ];

  return (
    <div style={{ 
      padding: '40px', 
      background: '#0B0C10', 
      minHeight: '100vh',
      color: '#fff'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: '#111111',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #1F2833'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '32px', 
          textAlign: 'center',
          color: '#FF2E2E'
        }}>
          THARA Order Tracking Demo
        </h1>
        
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: '#66FCF1' }}>
            Current Status: {currentStatus.toUpperCase()}
          </h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setCurrentStatus(status.value)}
                style={{
                  padding: '10px 20px',
                  background: currentStatus === status.value 
                    ? 'rgba(255, 46, 46, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: currentStatus === status.value 
                    ? '1px solid rgba(255, 46, 46, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: currentStatus === status.value ? '#ff2e2e' : '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <OrderTracker status={currentStatus} />
        
        <div style={{ 
          marginTop: '32px', 
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h4 style={{ marginBottom: '16px', color: '#66FCF1' }}>
            Features:
          </h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.8'
          }}>
            <li>✅ Visual progress tracking with animated icons</li>
            <li>✅ Completed steps highlighted in red (#FF2E2E)</li>
            <li>✅ Current step highlighted in cyan (#66FCF1)</li>
            <li>✅ Future steps appear grey</li>
            <li>✅ Responsive design for mobile devices</li>
            <li>✅ Smooth animations and transitions</li>
            <li>✅ Admin can update status from dropdown</li>
            <li>✅ Real-time updates for users</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackerDemo;