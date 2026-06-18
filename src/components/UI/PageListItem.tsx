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
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [isTouch] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);

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

  // Close actions when clicking/touching outside
  useEffect(() => {
    if (!showActions) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [showActions]);

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
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--success)', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.examCompletedTooltip')}>
          E
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--success)', color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.completedTooltip')}>
          ✓
        </span>
      );
    }
    if (isQuizDone) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 8, fontWeight: 700, flexShrink: 0 }} title={t('sidebar.quizCompletedTooltip')}>
          Q
        </span>
      );
    }
    return (
      <span style={{
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: isViewed ? 'var(--accent)' : 'var(--text-muted)',
      }} />
    );
  };

  const shouldShowActions = hovered || showActions || isTouch;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        cursor: 'pointer',
        background: isActive ? 'var(--accent-light)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
        borderRadius: '0 6px 6px 0',
        transition: 'background 0.15s, border-color 0.15s',
        userSelect: 'none',
        position: 'relative',
        margin: '1px 4px',
      }}
      onClick={() => goToPage(index)}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={title}
    >
      {/* Drag handle */}
      <span style={{ color: 'var(--text-muted)', fontSize: 14, cursor: 'grab', flexShrink: 0, opacity: hovered ? 0.6 : 0.3 }}>
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
            minWidth: 0,
            padding: '2px 4px',
            border: '1px solid var(--accent)',
            borderRadius: 4,
            fontSize: 12,
            outline: 'none',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <span
            style={{
              fontSize: 12.5,
              color: isActive ? 'var(--accent)' : 'var(--text-primary)',
              fontWeight: isActive ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Action buttons: shown on hover, or always on touch devices */}
      {!renaming && shouldShowActions && (
        <div
          ref={actionsRef}
          style={{
            display: 'flex',
            gap: isTouch ? 2 : 3,
            marginLeft: 'auto',
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title={isCompleted ? t('sidebar.markIncompleteTooltip') : t('sidebar.markCompleteTooltip')}
            onClick={() => {
              togglePageComplete(index);
              setShowActions(false);
            }}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              padding: isTouch ? '2px 5px' : '3px 5px',
              fontSize: isTouch ? 11 : 12,
              color: isCompleted ? 'var(--success)' : 'var(--text-secondary)',
              borderRadius: 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              transition: 'all 0.1s',
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
              setShowActions(false);
            }}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              padding: isTouch ? '2px 5px' : '3px 5px',
              fontSize: isTouch ? 11 : 12,
              color: 'var(--text-secondary)',
              borderRadius: 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              transition: 'all 0.1s',
            }}
            type="button"
          >
            ✎
          </button>
          <button
            title={t('sidebar.deleteTooltip')}
            onClick={() => {
              removePage(index);
              setShowActions(false);
            }}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              padding: isTouch ? '2px 5px' : '3px 5px',
              fontSize: isTouch ? 11 : 12,
              color: 'var(--error-text, #ef4444)',
              borderRadius: 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              transition: 'all 0.1s',
            }}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
