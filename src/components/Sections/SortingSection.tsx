import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { SortingSection as SortingSectionType } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { renderMarkdown } from '../../utils/renderContent';
import { useTranslation } from '../../hooks/useTranslation';

interface SortingSectionProps {
  section: SortingSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function SortingSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: SortingSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const { t } = useTranslation();
  const [items, setItems] = useState<typeof section.items>([]);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animFrameRef = useRef<number>(0);

  const isExamMode = state.learningMode === 'exam';
  const currentPageId = state.pages[state.currentPageIndex]?._meta?.id || String(state.currentPageIndex);
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  // Load saved answers
  useEffect(() => {
    const saved = state.sectionAnswers[currentPageId]?.[sectionIndex];
    if (saved) {
      setItems(saved);
    } else {
      const freshItems = [...section.items].sort(() => Math.random() - 0.5);
      setItems(freshItems);
      if (isExamMode) {
        saveSectionAnswers(state.currentPageIndex, sectionIndex, freshItems);
      }
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [currentPageId, sectionIndex, isExamMode, state.sectionAnswers]);

  const saveAndSetItems = useCallback((newItems: typeof section.items) => {
    setItems(newItems);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, newItems);
  }, [state.currentPageIndex, sectionIndex, saveSectionAnswers]);

  // FLIP animation: record positions before reorder, animate delta after reorder
  const flipAnimate = useCallback(() => {
    const refs = itemRefs.current;
    const positions = refs.map((el) => el?.getBoundingClientRect());
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        refs.forEach((el, i) => {
          if (!el || !positions[i]) return;
          const newPos = el.getBoundingClientRect();
          const dx = positions[i]!.left - newPos.left;
          const dy = positions[i]!.top - newPos.top;
          if (dx === 0 && dy === 0) return;
          el.style.transition = 'none';
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          void el.offsetHeight;
          el.style.transition = 'transform 250ms ease';
          el.style.transform = '';
        });
      });
    };
  }, []);

  const handleDragStart = (index: number) => {
    if (activeSubmitted) return;
    dragItemRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (activeSubmitted) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (activeSubmitted) return;
    const from = dragItemRef.current;
    if (from === null || from === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const cleanup = flipAnimate();
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    saveAndSetItems(next);
    requestAnimationFrame(() => requestAnimationFrame(cleanup));
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const runGrading = useCallback(() => {
    setSubmitted(true);
    setConfirming(false);
    if (onGraded) {
      const correct = items.filter((item, i) => item.correctOrder === i + 1).length;
      onGraded(correct, section.items.length);
    }
  }, [items, section.items.length, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleSubmit = () => {
    if (isExamMode) {
      saveSectionAnswers(state.currentPageIndex, sectionIndex, items);
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 2000);
      addToast(t('sorting.orderSavedToast'), "success", 2000);
      return;
    }
    if (state.learningMode === 'learn') {
      runGrading();
    } else {
      if (!confirming) {
        setConfirming(true);
      } else {
        runGrading();
      }
    }
  };

  const handleReset = () => {
    const freshItems = [...section.items].sort(() => Math.random() - 0.5);
    setItems(freshItems);
    setSubmitted(false);
    setConfirming(false);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, freshItems);
  };

  const getItemStatus = (item: typeof section.items[0], index: number) => {
    if (!activeSubmitted) return '';
    if (item.correctOrder === index + 1) return 'correct';
    return 'wrong';
  };

  const correctCount = activeSubmitted
    ? items.filter((item, i) => item.correctOrder === i + 1).length
    : 0;

  const itemBg = (status: string, isDragging: boolean, isDragOver: boolean): string => {
    if (isDragging) return 'var(--accent-light)';
    if (isDragOver) return 'var(--bg-tertiary)';
    if (status === 'correct') return 'rgba(16, 185, 129, 0.1)';
    if (status === 'wrong') return 'rgba(239, 68, 68, 0.1)';
    return 'var(--bg-secondary)';
  };

  const itemBorder = (status: string, isDragging: boolean, isDragOver: boolean): string => {
    if (isDragging) return '2px solid var(--accent)';
    if (isDragOver) return '2px dashed var(--accent)';
    if (status === 'correct') return '2px solid var(--success)';
    if (status === 'wrong') return '2px solid var(--error)';
    return '1px solid var(--border-color)';
  };

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '1.5rem',
    }}>
      {section.title && <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
      }}>{section.title}</h2>}

      {activeSubmitted && (
        <div style={{
          padding: '0.625rem 1rem',
          backgroundColor: 'var(--accent-light)',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontWeight: 600,
          color: 'var(--accent)',
          fontSize: '0.9rem',
        }}>
          {t('sorting.correctlyPositioned', { correctCount, total: section.items.length })}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}>
        {items.map((item, i) => {
          const status = activeSubmitted ? getItemStatus(item, i) : '';
          const isDragging = dragIndex === i;
          const isDragOver = dragOverIndex === i;
          const correctPos = activeSubmitted ? item.correctOrder : null;

          return (
            <div
              key={`${item.text}-${i}`}
              ref={(el) => { itemRefs.current[i] = el; }}
              draggable={!activeSubmitted}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              className={`sorting-item ${activeSubmitted ? 'submitted' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: itemBg(status, isDragging, isDragOver),
                border: itemBorder(status, isDragging, isDragOver),
                borderRadius: '6px',
                cursor: activeSubmitted ? 'default' : 'grab',
                transition: 'background-color 150ms ease, border-color 150ms ease, opacity 150ms ease',
                opacity: isDragging ? 0.6 : 1,
              }}
            >
              <span style={{
                cursor: activeSubmitted ? 'default' : 'grab',
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                userSelect: 'none',
              }} title={t('sorting.dragToReorder')}>
                ⠿
              </span>
              <span
                style={{
                  flex: 1,
                  color: 'var(--text-primary)',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.text) }}
              />
              {activeSubmitted && correctPos !== i + 1 && (
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}>
                  → {t('sorting.correctPosition', { pos: correctPos! })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
      }}>
        {!activeSubmitted ? (
          <button
            onClick={handleSubmit}
            className="btn-base"
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: confirming ? 'var(--warning)' : 'var(--accent)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)',
            }}
          >
            {isExamMode ? (isSavedText ? t('sorting.orderSaved') : t('sorting.saveOrder')) : (confirming ? t('sorting.confirmSubmit') : t('sorting.checkOrder'))}
          </button>
        ) : (
          state.learningMode !== 'exam' && (
            <button
              onClick={handleReset}
              className="btn-base"
              style={{
                padding: '0.5rem 1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'var(--transition-fast)',
              }}
            >
              {t('sorting.resetReshuffle')}
            </button>
          )
        )}
      </div>
    </div>
  );
}
