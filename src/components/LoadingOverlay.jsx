import React from 'react';

const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      gap: '1.5rem',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #f0eee6',
        borderTopColor: '#141413',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#5e5d59', fontSize: '1rem', fontWeight: '500', fontFamily: 'Poppins, sans-serif' }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingOverlay;
