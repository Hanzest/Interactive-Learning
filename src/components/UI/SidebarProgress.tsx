import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

export default function SidebarProgress() {
  const { state, completedCount } = useAppContext();
  const { t } = useTranslation();
  const total = state.pages.length;
  const viewedCount = state.viewedPages.length;

  if (total === 0) return null;

  return (
    <div>
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
    </div>
  );
}
