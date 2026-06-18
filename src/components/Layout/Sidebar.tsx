import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import { useAppContext } from '../../context/AppContext';
import FileUploadDropZone from '../UI/FileUploadDropZone';
import SidebarProgress from '../UI/SidebarProgress';
import PageList from '../UI/PageList';
import { useTranslation } from '../../hooks/useTranslation';
import FeedbackWidget from '../UI/FeedbackWidget';
import ConfirmDialog from '../UI/ConfirmDialog';

export default function Sidebar() {
  const { state, toggleSidebar, toggleCreatePrompt, goHome, visibleIndices, removeAllPages } = useAppContext();
  const { t } = useTranslation();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isOpen = state.sidebarOpen;
  const totalPages = state.pages.length;
  const visibleCount = visibleIndices.length;
  const isFiltered = visibleCount < totalPages;

  return (
    <>
      <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarCollapsed : styles.sidebarOpen}`}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            minWidth: 'var(--sidebar-width, 18rem)',
          }}
        >
          {/* Upload row: icon-only drop zone + Create JSON inline */}
          <div style={{ padding: '0.625rem', borderBottom: '1px solid var(--border-color)' }}>
            <div className={styles.uploadRow}>
              <FileUploadDropZone variant="compact" />
              <button
                className={styles.createBtn}
                onClick={toggleCreatePrompt}
                title={t('sidebar.createPromptTitle')}
                type="button"
              >
                <span>✨ {t('sidebar.createPrompt')}</span>
              </button>
            </div>
          </div>

          {/* Progress section */}
          <div style={{ padding: '0.625rem', borderBottom: '1px solid var(--border-color)' }}>
            <SidebarProgress />
          </div>

          {/* Page count badge + Clear All */}
          {totalPages > 0 && (
            <div className={styles.pageCountBadge}>
              <span>
                📄 {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                {isFiltered && (
                  <span style={{ color: 'var(--accent)', marginLeft: 4, fontSize: '0.6875rem' }}>
                    ({visibleCount} shown)
                  </span>
                )}
              </span>
              <button
                className={styles.clearAllBtn}
                onClick={() => setShowClearConfirm(true)}
                type="button"
                title={t('sidebar.clearAll')}
              >
                {t('sidebar.clearAllLabel')}
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.375rem' }} className={styles.pageListSection}>
            <PageList />
          </div>

          {/* Feedback Widget — sidebar compact variant */}
          <FeedbackWidget variant="sidebar" />

          {/* Permanent Home / Landing Page button — always pinned at bottom */}
          <div
            style={{
              padding: '0 0.625rem 0.5rem',
              flexShrink: 0,
            }}
          >
            <button
              className={styles.homeBtn}
              onClick={goHome}
              title={t('sidebar.goHomeTitle')}
              type="button"
              aria-label={t('sidebar.goHomeTitle')}
            >
              <span aria-hidden="true">🏠</span>
              <span>{t('sidebar.goHome')}</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Clear All confirmation dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title={t('sidebar.confirmClearTitle')}
        description={t('sidebar.confirmClearDesc')}
        confirmLabel={t('sidebar.deleteAll')}
        cancelLabel={t('sidebar.cancel')}
        onConfirm={() => {
          removeAllPages();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  );
}
