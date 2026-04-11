const shimmerStyle = `
@keyframes altair-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
`;

let _injected = false;
function injectShimmer() {
  if (_injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
  _injected = true;
}

export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-md)',
  count = 1,
  className = '',
  style = {},
}) {
  injectShimmer();

  const skeletonStyle = {
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--color-bg-subtle) 25%, var(--color-border) 50%, var(--color-bg-subtle) 75%)',
    backgroundSize: '800px 100%',
    animation: 'altair-shimmer 1.5s infinite linear',
    display: 'block',
    ...style,
  };

  if (count === 1) {
    return <span className={className} style={skeletonStyle} aria-hidden="true" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={skeletonStyle} aria-hidden="true" />
      ))}
    </div>
  );
}
