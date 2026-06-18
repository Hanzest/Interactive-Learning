import React from 'react';
import { useAppContext } from '../../context/AppContext';
import PageListItem from './PageListItem';
import { useTranslation } from '../../hooks/useTranslation';

export default function PageList() {
  const { state, visibleIndices, currentPage, setSearchQuery } = useAppContext();
  const { t } = useTranslation();

  const totalPages = state.pages.length;

  // Empty state when search yields no results
  if (totalPages > 0 && visibleIndices.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          textAlign: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>🔍</span>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          {t('sidebar.noResults') || 'No matching pages'}
        </p>
        <button
          onClick={() => setSearchQuery('')}
          style={{
            padding: '4px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: 6,
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          type="button"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {t('sidebar.clearSearch') || 'Clear search'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {visibleIndices.map((pageIndex) => (
        <PageListItem
          key={pageIndex}
          page={state.pages[pageIndex]}
          index={pageIndex}
          isActive={state.currentPageIndex === pageIndex}
          isCompleted={!!state.pages[pageIndex]?._meta?.completed}
          isViewed={state.viewedPages.includes(pageIndex)}
          isQuizDone={false} /* Could compute from quizScores if needed */
        />
      ))}
    </div>
  );
}
