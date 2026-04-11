const paddingMap = {
  none: '0',
  sm:   'var(--space-4)',
  md:   'var(--space-6)',
  lg:   'var(--space-8)',
};

const variantStyles = {
  default:  { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' },
  elevated: { background: 'var(--color-bg-elevated)', border: 'none',                          boxShadow: 'var(--shadow-lg)' },
  bordered: { background: 'var(--color-bg-elevated)', border: '2px solid var(--color-border-strong)', boxShadow: 'none' },
};

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  className = '',
  style = {},
}) {
  const isClickable = !!onClick;

  return (
    <div
      className={`altair-card${className ? ` ${className}` : ''}`}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: isClickable ? 'pointer' : undefined,
        padding: paddingMap[padding],
        ...variantStyles[variant],
        ...(hover ? { '--card-hover': '1' } : {}),
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
      } : undefined}
    >
      {children}
    </div>
  );
}
