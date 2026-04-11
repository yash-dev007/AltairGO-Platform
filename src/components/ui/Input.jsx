import { useState } from 'react';

export default function Input({
  label,
  id,
  error,
  hint,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }} className={className}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-1)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: `1px solid ${error ? 'var(--color-error)' : focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-base)',
          background: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg-elevated)',
          color: 'var(--color-text)',
          outline: 'none',
          boxShadow: focused && !error ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          cursor: disabled ? 'not-allowed' : undefined,
          opacity: disabled ? 0.6 : 1,
          boxSizing: 'border-box',
        }}
        {...rest}
      />
      {error && (
        <span style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          {error}
        </span>
      )}
      {!error && hint && (
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}
