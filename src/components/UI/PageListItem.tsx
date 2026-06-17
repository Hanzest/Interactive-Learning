import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { LearningPage } from '../../types/schema';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  page: LearningPage;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isViewed: boolean;
  isQuizDone: boolean;
}

export default function PageListItem({ page, index, isActive, isCompleted, isViewed, isQuizDone }: Props) {
  const { t } = useTranslation();
  const {
    goToPage,
    togglePageComplete,
    renamePage,
    removePage,
    setRenamingIndex,
    setContextMenu,
    state,
  } = useAppContext();

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = page.page?.title || `Page ${index + 1}`;

  // Sync with global renaming index
  useEffect(() => {
    if (state.renamingIndex === index && !renaming) {
      setRenaming(true);
      setRenameValue(title);
    }
    if (state.renamingIndex !== index && renaming) {
      setRenaming(false);
    }
  }, [state.renamingIndex, index]);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      renamePage(index, renameValue.trim());
    }
    setRenaming(false);
    setRenamingIndex(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (state.contextMenu?.index === index) {
      setContextMenu(null);
    } else {
      setContextMenu({ index, x: e.clientX, y: e.clientY });
    }
  };

  const statusIndicator = () => {
    const isExamMode = state.learningMode === 'exam';
    const pageId = page._meta?.id || String(index);
    const examSubmitted = isExamMode && !!state.examSubmittedPages[pageId];
    if (isExamMode && examSubmitted) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--success)', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.examCompletedTooltip')}>
          E
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--success)', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.completedTooltip')}>
          ✓
        </span>
      );
    }
    if (isQuizDone) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.quizCompletedTooltip')}>
          Q
        </span>
      );
    }
    return (
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: isViewed ? 'var(--accent)' : 'var(--text-muted)',
      }} />
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        cursor: 'pointer',
        background: isActive ? 'var(--accent-light)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'background 0.15s',
        userSelect: 'none',
        position: 'relative',
      }}
      onClick={() => goToPage(index)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
    >
      {/* Drag handle */}
      <span style={{ color: 'var(--text-muted)', fontSize: 16, cursor: 'grab', flexShrink: 0 }}>
        ⠿
      </span>

      {/* Status indicator */}
      {statusIndicator()}

      {/* Title / Rename input */}
      {renaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
            if (e.key === 'Escape') {
              setRenaming(false);
              setRenamingIndex(null);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            padding: '2px 4px',
            border: '1px solid var(--accent)',
            borderRadius: 4,
            fontSize: 13,
            outline: 'none',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Touch device detection */}
      {(() => {
        const [isTouch, setIsTouch] = useState(false);
        const [showMobileActions, setShowMobileActions] = useState(false);
        const menuRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
          setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
        }, []);

        useEffect(() => {
          if (!showMobileActions) return;
          const handleOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
              setShowMobileActions(false);
            }
          };
          document.addEventListener('mousedown', handleOutsideClick);
          return () => document.removeEventListener('mousedown', handleOutsideClick);
        }, [showMobileActions]);

        if (renaming) return null;

        if (hovered || showMobileActions) {
          return (
            <div
              ref={menuRef}
              style={{
                display: 'flex',
                gap: 4,
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--bg-primary)',
                padding: '4px 6px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                title={isCompleted ? t('sidebar.markIncompleteTooltip') : t('sidebar.markCompleteTooltip')}
                onClick={() => {
                  togglePageComplete(index);
                  setShowMobileActions(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  fontSize: 13,
                  color: isCompleted ? 'var(--success)' : 'var(--text-secondary)',
                  borderRadius: 4,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                type="button"
              >
                {isCompleted ? '↩' : '✓'}
              </button>
              <button
                title={t('sidebar.renameTooltip')}
                onClick={() => {
                  setRenaming(true);
                  setRenameValue(title);
                  setRenamingIndex(index);
                  setShowMobileActions(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  borderRadius: 4,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                type="button"
              >
                ✎
              </button>
              <button
                title={t('sidebar.deleteTooltip')}
                onClick={() => {
                  removePage(index);
                  setShowMobileActions(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  fontSize: 13,
                  color: 'var(--error-text, #ef4444)',
                  borderRadius: 4,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                type="button"
              >
                ✕
              </button>
            </div>
          );
        }

        if (isTouch) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileActions(true);
              }}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: 14,
                fontWeight: 'bold',
                color: 'var(--text-secondary)',
                borderRadius: 6,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                flexShrink: 0,
              }}
              title={t('sidebar.optionsTooltip')}
              type="button"
            >
              ⋮
            </button>
          );
        }

        return null;
      })()}
    </div>
  );
}
