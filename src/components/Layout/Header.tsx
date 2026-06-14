import React from 'react';
import { useAppContext } from '../../context/AppContext';
import SearchBar from '../UI/SearchBar';
import PomodoroTimer from '../UI/PomodoroTimer';
import DarkModeToggle from '../UI/DarkModeToggle';
import UploadButton from '../UI/UploadButton';

export default function Header() {
  const {
    state,
    toggleSidebar,
    toggleDashboard,
    toggleShortcuts,
  } = useAppContext();

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

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      minHeight: 56,
      transition: 'background-color 0.3s',
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        title="Toggle sidebar (Ctrl+B)"
        type="button"
        className="btn-base"
        style={{
          ...iconBtnBase,
          fontSize: 20,
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
        📚 Learn
      </h1>

      {/* Search */}
      <SearchBar />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Action group */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <PomodoroTimer />

        {/* Dashboard button */}
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
          title="Dashboard (Ctrl+D)"
          type="button"
          className="btn-base"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>

        <DarkModeToggle />

        {/* Keyboard shortcuts */}
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
          className="btn-base"
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

        {/* Upload */}
        <UploadButton />
      </div>
    </header>
  );
}
