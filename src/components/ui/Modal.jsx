import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const sizeMap = {
  sm: '400px',
  md: '560px',
  lg: '720px',
  xl: '900px',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-elevated)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-6)',
              width: '100%',
              maxWidth: sizeMap[size],
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              {title && (
                <h2 id="modal-title" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', margin: 0 }}>
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 'auto',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <X size={20} />
              </button>
            </div>

            <div>{children}</div>

            {footer && (
              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
