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
        border: '4px solid #e2e8f0',
        borderTopColor: '#1e293b',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#475569', fontSize: '1rem', fontWeight: '500', fontFamily: 'Poppins, sans-serif' }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingOverlay;
