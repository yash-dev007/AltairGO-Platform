import { Loader2 } from 'lucide-react';

const sizeStyles = {
  sm: { height: '2rem',  padding: '0 0.75rem', fontSize: 'var(--font-size-sm)' },
  md: { height: '2.5rem', padding: '0 1rem',   fontSize: 'var(--font-size-base)' },
  lg: { height: '3rem',  padding: '0 1.5rem',  fontSize: 'var(--font-size-lg)' },
};

const variantStyles = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    '--btn-hover-bg': 'var(--color-primary-dark)',
  },
  secondary: {
    background: 'var(--color-bg-elevated)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    '--btn-hover-bg': 'var(--color-bg-subtle)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
    '--btn-hover-bg': 'var(--color-primary-subtle)',
  },
  danger: {
    background: 'var(--color-error)',
    color: '#fff',
    border: 'none',
    '--btn-hover-bg': '#dc2626',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  className = '',
  style = {},
}) {
  const isDisabled = disabled || loading;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'var(--font-weight-medium)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'background var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast)',
    whiteSpace: 'nowrap',
    outline: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      type={type}
      className={`altair-btn altair-btn--${variant} altair-btn--${size}${className ? ` ${className}` : ''}`}
      style={baseStyle}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="altair-spin" aria-hidden="true" />}
      <span style={loading ? { opacity: 0, position: 'absolute' } : undefined}>{children}</span>
      {loading && <span className="sr-only">Loading...</span>}
    </button>
  );
}
