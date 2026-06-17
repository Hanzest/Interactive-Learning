import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import SearchBar from '../UI/SearchBar';
import PomodoroTimer from '../UI/PomodoroTimer';
import DarkModeToggle from '../UI/DarkModeToggle';
import UploadButton from '../UI/UploadButton';
import { useTranslation } from '../../hooks/useTranslation';

export default function Header() {
  const {
    state,
    toggleSidebar,
    toggleDashboard,
    toggleShortcuts,
    setLearningMode,
    setSearchQuery,
    toggleExamPause,
  } = useAppContext();

  const { t, language, setLanguage } = useTranslation();

  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);

  useEffect(() => {
    const mediaMobile = window.matchMedia('(max-width: 600px)');
    const mediaVerySmall = window.matchMedia('(max-width: 440px)');
    
    setIsMobile(mediaMobile.matches);
    setIsVerySmall(mediaVerySmall.matches);

    const listenerMobile = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) {
        setMobileSearchActive(false);
      }
    };
    const listenerVerySmall = (e: MediaQueryListEvent) => {
      setIsVerySmall(e.matches);
    };

    mediaMobile.addEventListener('change', listenerMobile);
    mediaVerySmall.addEventListener('change', listenerVerySmall);
    
    return () => {
      mediaMobile.removeEventListener('change', listenerMobile);
      mediaVerySmall.removeEventListener('change', listenerVerySmall);
    };
  }, []);

  // Exam timer calculations for top-nav display
  const page = state.currentPageIndex >= 0 && state.currentPageIndex < state.pages.length
    ? state.pages[state.currentPageIndex]
    : null;

  const currentPageId = page?._meta?.id || String(state.currentPageIndex);

  const isExamMode = state.learningMode === 'exam';
  const isPageExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];

  const pageExamAutoTime = React.useMemo(() => {
    if (!isExamMode || !page) return 0;
    let total = 0;
    (page.exam || []).forEach((sec) => {
      const isGradedSec = ['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'].includes(sec.type);
      if (!isGradedSec) return;
      if (sec.type === 'quiz' && 'questions' in sec) total += ((sec as any).questions?.length || 1) * 30;
      else if (sec.type === 'fill-blank' && 'sentences' in sec) total += ((sec as any).sentences?.length || 1) * 30;
      else if (sec.type === 'matching' && 'pairs' in sec) total += ((sec as any).pairs?.length || 1) * 20;
      else if (sec.type === 'sorting' && 'items' in sec) total += ((sec as any).items?.length || 1) * 30;
      else if (sec.type === 'cloze') total += 60;
    });
    return Math.max(total, 60);
  }, [isExamMode, page, state.currentPageIndex]);

  const persistedTime = state.examTimeLeft[currentPageId];
  const timeLeft = persistedTime !== undefined ? persistedTime : pageExamAutoTime;
  const isPaused = !!state.examPaused[currentPageId];
  const isExamActive = isExamMode && page && !isPageExamSubmitted;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerUrgent = timeLeft > 0 && timeLeft < 30;

  const iconBtnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 18,
    transition: 'background-color 0.15s, color 0.15s',
    flexShrink: 0,
  };

  // Mobile Active Search View
  if (isMobile && mobileSearchActive) {
    return (
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        minHeight: 56,
      }}>
        <button
          onClick={() => {
            setMobileSearchActive(false);
            setSearchQuery('');
          }}
          aria-label="Exit search"
          className="btn-base header-icon-btn"
          style={{
            ...iconBtnBase,
            width: 36,
            height: 36,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <SearchBar />
        </div>
      </header>
    );
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '8px 16px',
      background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      minHeight: 56,
      transition: 'background-color 0.3s',
    }}>
      {/* Left Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Sidebar toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar (Ctrl+B)"
          type="button"
          className="btn-base header-icon-btn"
          style={{
            ...iconBtnBase,
            fontSize: 20,
            width: 36,
            height: 36,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          {state.sidebarOpen ? '✕' : '☰'}
        </button>

        {/* Title */}
        <h1 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span>📚</span>
          {!isMobile && <span>{t('header.title')}</span>}
        </h1>
      </div>

      {/* Center Group (Desktop Search) */}
      {!isMobile && (
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 24px',
          minWidth: 0,
        }}>
          <div className="header-search-wrapper" style={{ width: '100%', maxWidth: 360 }}>
            <SearchBar />
          </div>
        </div>
      )}

      {/* Right Group (Mode Switcher + Actions) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Header Exam Timer Pill */}
        {isExamActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '4px 10px',
            borderRadius: '8px',
            background: timerUrgent ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
            border: `1.5px solid ${timerUrgent ? 'var(--error)' : 'var(--accent)'}`,
            color: timerUrgent ? 'var(--error)' : 'var(--accent)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            transition: 'all 0.2s',
            boxShadow: timerUrgent ? '0 0 8px rgba(239, 68, 68, 0.2)' : 'none',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13} style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
            <button
              onClick={() => toggleExamPause(state.currentPageIndex)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.85,
                transition: 'transform 0.1s',
              }}
              className="btn-base"
              title={isPaused ? 'Resume Exam' : 'Pause Exam'}
            >
              {isPaused ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width={11} height={11}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width={11} height={11}>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Mode Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: 2,
        }}>
          {(['learn', 'practice', 'exam'] as const).map((m) => {
            const isActive = state.learningMode === m;
            const labelKey = `header.mode${m.charAt(0).toUpperCase() + m.slice(1)}`;
            const shortLabelKey = `${labelKey}Short`;
            return (
              <button
                key={m}
                onClick={() => setLearningMode(m)}
                className={`btn-base mode-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: isMobile ? '4px 6px' : '4px 10px',
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {isVerySmall ? t(shortLabelKey) : t(labelKey)}
              </button>
            );
          })}
        </div>

        {/* Action group */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {/* Mobile search toggle */}
          {isMobile && !isExamActive && (
            <button
              onClick={() => setMobileSearchActive(true)}
              aria-label="Search pages"
              title="Search pages"
              type="button"
              className="btn-base header-icon-btn"
              style={{
                ...iconBtnBase,
                width: 36,
                height: 36,
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}

          {!isMobile && <PomodoroTimer />}

          {/* Dashboard button */}
          {(!isMobile || !isExamActive) && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                padding: 0,
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                background: state.showDashboard ? 'var(--accent-light)' : 'var(--bg-secondary)',
                color: state.showDashboard ? 'var(--accent)' : 'var(--text-secondary)',
                borderColor: state.showDashboard ? 'var(--accent)' : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                flexShrink: 0,
              }}
              onClick={toggleDashboard}
              aria-label="Dashboard"
              title="Dashboard"
              type="button"
              className="btn-base header-icon-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
          )}

          {(!isMobile || !isExamActive) && <DarkModeToggle />}

          {/* Language Switcher */}
          {(!isMobile || !isExamActive) && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                padding: 0,
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              aria-label="Toggle language"
              title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
              type="button"
              className="btn-base header-icon-btn"
            >
              {language.toUpperCase()}
            </button>
          )}

          {/* Keyboard shortcuts */}
          {!isMobile && (
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                padding: 0,
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                background: state.showShortcuts ? 'var(--accent-light)' : 'var(--bg-secondary)',
                color: state.showShortcuts ? 'var(--accent)' : 'var(--text-secondary)',
                borderColor: state.showShortcuts ? 'var(--accent)' : 'var(--border-color)',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                flexShrink: 0,
              }}
              onClick={toggleShortcuts}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
              type="button"
              className="btn-base header-icon-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
                <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                <line x1="6" y1="8" x2="6" y2="8" />
                <line x1="10" y1="8" x2="10" y2="8" />
                <line x1="14" y1="8" x2="14" y2="8" />
                <line x1="18" y1="8" x2="18" y2="8" />
                <line x1="6" y1="12" x2="6" y2="12" />
                <line x1="10" y1="12" x2="10" y2="12" />
                <line x1="14" y1="12" x2="14" y2="12" />
                <line x1="18" y1="12" x2="18" y2="12" />
                <line x1="7" y1="16" x2="17" y2="16" />
              </svg>
            </button>
          )}

          {/* Upload */}
          {(!isMobile || !isExamActive) && <UploadButton />}
        </div>
      </div>
    </header>
  );
}
