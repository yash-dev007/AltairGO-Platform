export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`altair-empty-state${className ? ` ${className}` : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        ...style,
      }}
    >
      {icon && (
        <div style={{ fontSize: '3rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>
          {icon}
        </div>
      )}
      {title && (
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', maxWidth: '320px', margin: 0, lineHeight: 'var(--line-height-relaxed)' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
