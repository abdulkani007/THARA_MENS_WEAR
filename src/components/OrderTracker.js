import React from 'react';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiBox } from 'react-icons/fi';
import './OrderTracker.css';

const OrderTracker = ({ status }) => {
  const steps = [
    { key: 'placed', label: 'Placed', icon: <FiCheckCircle /> },
    { key: 'processing', label: 'Processing', icon: <FiClock /> },
    { key: 'packed', label: 'Packed', icon: <FiBox /> },
    { key: 'shipped', label: 'Shipped', icon: <FiTruck /> },
    { key: 'delivered', label: 'Delivered', icon: <FiPackage /> }
  ];

  // Map different status variations to our standard steps
  const normalizeStatus = (status) => {
    if (!status) return 'placed';
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'placed';
    return statusLower;
  };

  const normalizedStatus = normalizeStatus(status);
  const currentIndex = steps.findIndex(step => step.key === normalizedStatus);

  return (
    <div className="order-tracker">
      <div className="tracker-container">
        {steps.map((step, index) => (
          <div key={step.key} className="tracker-step">
            <div className="step-content">
              <div className={`step-circle ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}`}>
                {step.icon}
              </div>
              <span className={`step-label ${index <= currentIndex ? 'completed' : ''}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${index < currentIndex ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;
