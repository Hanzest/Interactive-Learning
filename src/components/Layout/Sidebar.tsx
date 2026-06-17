import React from 'react';
import styles from './Sidebar.module.css';
import { useAppContext } from '../../context/AppContext';
import FileUploadDropZone from '../UI/FileUploadDropZone';
import SidebarProgress from '../UI/SidebarProgress';
import PageList from '../UI/PageList';
import { useTranslation } from '../../hooks/useTranslation';

export default function Sidebar() {
  const { state, toggleSidebar, toggleCreatePrompt } = useAppContext();
  const { t } = useTranslation();

  const isOpen = state.sidebarOpen;

  // sidebarStyle removed to avoid conflict with CSS media queries

  const sidebarContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    minWidth: '18rem',
  };

  const sectionBorderStyle: React.CSSProperties = {
    borderBottom: '1px solid var(--border-color)',
  };

  const dropZoneSectionStyle: React.CSSProperties = {
    padding: '0.75rem',
    ...sectionBorderStyle,
  };

  const progressSectionStyle: React.CSSProperties = {
    padding: '0.75rem',
    ...sectionBorderStyle,
  };

  const pageListSectionStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '0.5rem',
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${!isOpen ? styles.sidebarCollapsed : styles.sidebarOpen}`}>
        <div style={sidebarContentStyle}>
          <div style={dropZoneSectionStyle}>
            <FileUploadDropZone />
            <button
              className={styles.createBtn}
              onClick={toggleCreatePrompt}
              title={t('sidebar.createPromptTitle')}
              type="button"
            >
              <span>✨ {t('sidebar.createPrompt')}</span>
            </button>
          </div>
          <div style={progressSectionStyle}>
            <SidebarProgress />
          </div>
          <div style={pageListSectionStyle}>
            <PageList />
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
    </>
  );
}
