import React from 'react';

const shimmerStyle = {
  background: '#e2e8f0',
  borderRadius: '8px',
  position: 'relative',
  overflow: 'hidden',
};

const shimmerAfter = `
  @keyframes shimmer { 100% { transform: translateX(100%); } }
`;

export const Skeleton = ({ width = '100%', height = '1rem', style = {}, borderRadius = '8px' }) => (
  <>
    <style>{shimmerAfter}</style>
    <div style={{
      ...shimmerStyle,
      width,
      height,
      borderRadius,
      ...style,
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: 'translateX(-100%)',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        animation: 'shimmer 1.5s infinite',
      }} />
    </div>
  </>
);

export const CardSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    <Skeleton height="200px" borderRadius="12px" style={{ marginBottom: '1rem' }} />
    <Skeleton height="1.2rem" width="70%" style={{ marginBottom: '0.5rem' }} />
    <Skeleton height="1rem" width="50%" style={{ marginBottom: '0.5rem' }} />
    <Skeleton height="1rem" width="40%" />
  </div>
);

export const TripCardSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <Skeleton height="160px" borderRadius="12px" />
    <Skeleton height="1.3rem" width="65%" />
    <Skeleton height="1rem" width="45%" />
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Skeleton height="2rem" width="80px" borderRadius="20px" />
      <Skeleton height="2rem" width="80px" borderRadius="20px" />
    </div>
  </div>
);

export const DashboardSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', paddingTop: '2rem' }}>
    {Array(count).fill(0).map((_, i) => <TripCardSkeleton key={i} />)}
  </div>
);

export const BlogCardSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
    <Skeleton height="200px" borderRadius="0" />
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <Skeleton height="0.75rem" width="35%" borderRadius="20px" />
      <Skeleton height="1.2rem" width="85%" />
      <Skeleton height="1.2rem" width="65%" />
      <Skeleton height="0.875rem" width="100%" style={{ marginTop: '0.25rem' }} />
      <Skeleton height="0.875rem" width="80%" />
      <Skeleton height="1rem" width="30%" style={{ marginTop: '0.5rem' }} borderRadius="20px" />
    </div>
  </div>
);

export const DetailPageSkeleton = () => (
  <div style={{ paddingTop: '4rem' }}>
    <Skeleton height="480px" borderRadius="0" />
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton height="1.5rem" width="30%" />
      <Skeleton height="2rem" width="80%" />
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" width="100%" style={{ marginTop: '1rem' }} />
      <Skeleton height="1rem" width="95%" />
      <Skeleton height="1rem" width="88%" />
      <Skeleton height="1rem" width="92%" />
    </div>
  </div>
);

export default Skeleton;
