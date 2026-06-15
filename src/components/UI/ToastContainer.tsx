import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';

const TYPE_COLORS: Record<string, string> = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export default function ToastContainer() {
  const { state, dismissToast } = useAppContext();

  const dismiss = useCallback(
    (id: number) => {
      const toast = state.toasts.find((t) => t.id === id);
      if (toast?.undo) {
        toast.undo();
      }
      dismissToast(id);
    },
    [state.toasts, dismissToast]
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {state.toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onUndo={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
  onUndo,
}: {
  toast: { id: number; message: string; type: string; duration: number; undo?: (() => void) | null };
  onDismiss: () => void;
  onUndo: () => void;
}) {
  const [visible, setVisible] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  // Trigger entrance animation on mount
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleDismiss = React.useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 300); // match exit animation duration (300ms)
  }, [onDismiss]);

  const dismissRef = React.useRef(handleDismiss);
  dismissRef.current = handleDismiss;

  useEffect(() => {
    // Wipe out in exactly 3 seconds (3000ms) from mounting
    const timer = setTimeout(() => {
      dismissRef.current();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const slideStyle: React.CSSProperties = {
    opacity: visible && !exiting ? 1 : 0,
    transform: visible && !exiting ? 'translateX(0)' : 'translateX(32px)',
    transition: 'opacity 300ms ease, transform 300ms ease',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderLeft: `4px solid ${TYPE_COLORS[toast.type] || '#3b82f6'}`,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        pointerEvents: 'auto',
        minWidth: 280,
        maxWidth: 420,
        ...slideStyle,
      }}
      role="alert"
    >
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {toast.undo && (
          <button
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: 4,
              background: 'var(--bg-tertiary)',
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onClick={onUndo}
            type="button"
          >
            Undo
          </button>
        )}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onClick={handleDismiss}
          type="button"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
