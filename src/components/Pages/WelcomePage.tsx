import React from 'react';
import { useAppContext } from '../../context/AppContext';
import FileUploadDropZone from '../UI/FileUploadDropZone';
import { useTranslation } from '../../hooks/useTranslation';

export default function WelcomePage() {
  const { toggleCreatePrompt } = useAppContext();
  const { t } = useTranslation();

  // Premium, responsive styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 1.5rem',
    maxWidth: '1000px',
    margin: '0 auto',
    color: 'var(--text-primary)',
  };

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.25,
    margin: '0 0 1rem 0',
    background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.0625rem',
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 0 2.5rem 0',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    marginBottom: '3.5rem',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const cardIconStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    display: 'inline-block',
    marginBottom: '0.25rem',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 700,
    margin: 0,
  };

  const cardTextStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
    margin: 0,
  };

  const actionBoxStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '480px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '1.25rem',
    padding: '2rem',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: '3rem',
  };

  const flexBtnContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '0.75rem',
  };

  const wizardBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.5rem',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.9375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'background 0.15s, transform 0.1s',
  };

  const creatorCreditStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
    textAlign: 'center',
  };

  const shortcutsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  };

  const kbdStyle: React.CSSProperties = {
    padding: '2px 6px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 4,
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
  };

  return (
    <div style={containerStyle}>
      {/* Badge */}
      <div style={badgeStyle}>
        <span>✨</span> {t('welcomePage.badge')}
      </div>

      {/* Hero Header */}
      <h1 style={titleStyle}>{t('welcomePage.title')}</h1>
      <p style={subtitleStyle}>
        {t('welcomePage.subtitle')}
      </p>

      {/* Features Grid */}
      <div style={gridStyle}>
        <div style={cardStyle} className="card-base">
          <span style={cardIconStyle}>💡</span>
          <h3 style={cardTitleStyle}>{t('welcomePage.feat1Title')}</h3>
          <p style={cardTextStyle}>
            {t('welcomePage.feat1Desc')}
          </p>
        </div>

        <div style={cardStyle} className="card-base">
          <span style={cardIconStyle}>⚡</span>
          <h3 style={cardTitleStyle}>{t('welcomePage.feat2Title')}</h3>
          <p style={cardTextStyle}>
            {t('welcomePage.feat2Desc')}
          </p>
        </div>

        <div style={cardStyle} className="card-base">
          <span style={cardIconStyle}>🎯</span>
          <h3 style={cardTitleStyle}>{t('welcomePage.feat3Title')}</h3>
          <p style={cardTextStyle}>
            {t('welcomePage.feat3Desc')}
          </p>
        </div>
      </div>

      {/* Upload & Prompt Area */}
      <div style={actionBoxStyle}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>{t('welcomePage.getStarted')}</h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
          {t('welcomePage.uploadPrompt')}
        </p>

        <div style={{ width: '100%' }}>
          <FileUploadDropZone />
        </div>

        <div style={flexBtnContainer}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0' }}>
            {t('welcomePage.aiPrompt')}
          </div>
          <button
            type="button"
            style={wizardBtnStyle}
            onClick={toggleCreatePrompt}
            className="btn-base"
          >
            ✨ {t('welcomePage.wizardBtn')}
          </button>
        </div>
      </div>

      {/* Creator Attribution */}
      <div style={creatorCreditStyle}>
        {t('welcomePage.createdBy')}{' '}
        <a
          href="https://github.com/Hanzest"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: 700,
          }}
          onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
          onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
        >
          Mingsy Hồ
        </a>
      </div>

      {/* Keyboard Shortcuts Reminder */}
      <div style={shortcutsContainerStyle}>
        <p style={{ margin: 0 }}>
          {t('welcomePage.press')} <kbd style={kbdStyle}>?</kbd> {t('welcomePage.shortcutHint1End')}
        </p>
        <p style={{ margin: 0 }}>
          {t('welcomePage.use')} <kbd style={kbdStyle}>←</kbd> {t('welcomePage.shortcutHint2And')} <kbd style={kbdStyle}>→</kbd> {t('welcomePage.shortcutHint2End')}
        </p>
      </div>
    </div>
  );
}
