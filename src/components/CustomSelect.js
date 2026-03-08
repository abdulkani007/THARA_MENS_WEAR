import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={selectRef} style={{ position: 'relative', ...style }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${isOpen ? '#ff2e2e' : 'rgba(255, 255, 255, 0.1)'}`,
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          fontSize: '14px'
        }}
      >
        <span style={{ color: selectedOption ? '#fff' : 'rgba(255, 255, 255, 0.4)' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown style={{ 
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#1a1a1a',
          border: '1px solid rgba(255, 46, 46, 0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: value === option.value ? 'rgba(255, 46, 46, 0.1)' : 'transparent',
                color: value === option.value ? '#ff2e2e' : '#fff',
                transition: 'all 0.2s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
