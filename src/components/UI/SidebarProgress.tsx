import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function SidebarProgress() {
  const { state, completedCount, removeAllPages } = useAppContext();
  const { t } = useTranslation();
  const total = state.pages.length;
  const viewedCount = state.viewedPages.length;

  if (total === 0) return null;

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
         }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {t('sidebar.completedCount', { count: completedCount, total })}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {t('sidebar.viewedCount', { count: viewedCount })}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          background: 'var(--border-color)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(completedCount / total) * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
            borderRadius: 3,
            transition: 'width 0.2s',
          }}
        />
      </div>
      <button
        onClick={removeAllPages}
        style={{
          marginTop: 8,
          padding: '4px 0',
          border: 'none',
          background: 'none',
          color: 'var(--text-muted)',
          fontSize: 12,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
        type="button"
      >
        {t('sidebar.clearAllLabel')}
      </button>
    </div>
  );
}
