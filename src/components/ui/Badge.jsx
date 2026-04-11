const variantStyles = {
  default: { background: 'var(--color-bg-subtle)',      color: 'var(--color-text-muted)' },
  primary: { background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' },
  success: { background: 'var(--color-success-subtle)', color: 'var(--color-success)' },
  warning: { background: 'var(--color-warning-subtle)', color: 'var(--color-accent-dark)' },
  error:   { background: 'var(--color-error-subtle)',   color: 'var(--color-error)' },
  info:    { background: 'var(--color-info-subtle)',    color: 'var(--color-info)' },
};

const sizeStyles = {
  sm: { fontSize: 'var(--font-size-xs)', padding: '2px 8px' },
  md: { fontSize: 'var(--font-size-sm)', padding: '4px 10px' },
};

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  style = {},
}) {
  return (
    <span
      className={`altair-badge${className ? ` ${className}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-full)',
        fontWeight: 'var(--font-weight-medium)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
