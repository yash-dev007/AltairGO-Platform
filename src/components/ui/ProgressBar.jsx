const variantColors = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-accent)',
  error:   'var(--color-error)',
};

const sizeHeights = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

export default function ProgressBar({
  value = 0,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = false,
  className = '',
  style = {},
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', ...style }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
            {clamped}%
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: sizeHeights[size],
          background: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            background: animated && clamped < 100
              ? `linear-gradient(90deg, ${variantColors[variant]} 40%, color-mix(in srgb, ${variantColors[variant]} 60%, white) 60%, ${variantColors[variant]} 80%)`
              : variantColors[variant],
            backgroundSize: animated ? '200% 100%' : undefined,
            animation: animated && clamped < 100 ? 'altair-progress-shimmer 1.5s infinite linear' : undefined,
            borderRadius: 'var(--radius-full)',
            transition: 'width 500ms ease',
          }}
        />
      </div>
      <style>{`
        @keyframes altair-progress-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
