import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { CategorizeSection as CategorizeSectionType } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { renderMarkdown } from '../../utils/renderContent';
import { shuffle } from '../../utils/shuffle';
import { useTranslation } from '../../hooks/useTranslation';

interface CategorizeSectionProps {
  section: CategorizeSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function CategorizeSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
}: CategorizeSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const { t } = useTranslation();

  // assignments[itemId] = categoryId (user's classification)
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [shuffledItems, setShuffledItems] = useState<typeof section.items>([]);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);
  // For drag-and-drop
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOverCat, setDragOverCat] = useState<string | null>(null);

  const isExamMode = state.learningMode === 'exam';
  const currentPageId = state.pages[state.currentPageIndex]?._meta?.id || String(state.currentPageIndex);
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  const isSavingRef = useRef(false);

  useEffect(() => {
    if (isSavingRef.current) {
      isSavingRef.current = false;
      return;
    }
    const savedKey = `${state.learningMode}_${sectionIndex}`;
    const saved = state.sectionAnswers[currentPageId]?.[savedKey] ?? state.sectionAnswers[currentPageId]?.[sectionIndex];
    if (saved) {
      setAssignments(saved.assignments || {});
      setShuffledItems(saved.shuffledItems || shuffle([...section.items]));
    } else {
      setAssignments({});
      const fresh = shuffle([...section.items]);
      setShuffledItems(fresh);
      if (isExamMode) {
        saveSectionAnswers(state.currentPageIndex, sectionIndex, {
          assignments: {},
          shuffledItems: fresh,
        });
      }
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [currentPageId, sectionIndex, isExamMode, state.sectionAnswers]);

  const saveState = useCallback(
    (newAssignments: Record<string, string>, items: typeof section.items) => {
      isSavingRef.current = true;
      saveSectionAnswers(state.currentPageIndex, sectionIndex, {
        assignments: newAssignments,
        shuffledItems: items,
      });
    },
    [state.currentPageIndex, sectionIndex, saveSectionAnswers]
  );

  const handleAssign = useCallback(
    (itemId: string, categoryId: string) => {
      if (activeSubmitted) return;
      const newAssignments = { ...assignments, [itemId]: categoryId };
      setAssignments(newAssignments);
      saveState(newAssignments, shuffledItems);
    },
    [activeSubmitted, assignments, shuffledItems, saveState]
  );

  const handleRemoveFromCategory = useCallback(
    (itemId: string) => {
      if (activeSubmitted) return;
      const newAssignments = { ...assignments };
      delete newAssignments[itemId];
      setAssignments(newAssignments);
      saveState(newAssignments, shuffledItems);
    },
    [activeSubmitted, assignments, shuffledItems, saveState]
  );

  // Drag handlers
  const handleDragStart = (itemId: string) => setDragging(itemId);
  const handleDragEnd = () => { setDragging(null); setDragOverCat(null); };
  const handleDragOver = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    setDragOverCat(catId);
  };
  const handleDrop = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    if (dragging) handleAssign(dragging, catId);
    setDragging(null);
    setDragOverCat(null);
  };
  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragging) handleRemoveFromCategory(dragging);
    setDragging(null);
    setDragOverCat(null);
  };

  const runGrading = useCallback(() => {
    let correct = 0;
    section.items.forEach((item) => {
      if (assignments[item.id] === item.categoryId) correct++;
    });
    setSubmitted(true);
    setConfirming(false);
    if (onGraded) onGraded(correct, section.items.length);
  }, [assignments, section.items, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleSubmit = useCallback(() => {
    const allAssigned = section.items.every((item) => assignments[item.id] !== undefined);
    if (!allAssigned) {
      alert(t('categorize.pleaseAssignAll'));
      return;
    }
    if (isExamMode) {
      saveState(assignments, shuffledItems);
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 2000);
      addToast(t('interactive.answersSaved'), 'success', 2000);
      return;
    }
    if (state.learningMode === 'learn') {
      runGrading();
    } else {
      if (!confirming) setConfirming(true);
      else runGrading();
    }
  }, [
    section.items,
    assignments,
    isExamMode,
    state.learningMode,
    confirming,
    runGrading,
    shuffledItems,
    saveState,
    addToast,
    t,
  ]);

  const handleReset = useCallback(() => {
    const fresh = shuffle([...section.items]);
    setAssignments({});
    setShuffledItems(fresh);
    setSubmitted(false);
    setConfirming(false);
    saveState({}, fresh);
  }, [section.items, saveState]);

  const unassignedItems = shuffledItems.filter((item) => assignments[item.id] === undefined);
  const assignedCount = Object.keys(assignments).length;
  const total = section.items.length;
  const progressPercent = activeSubmitted ? 100 : (assignedCount / total) * 100;

  const correctCount = activeSubmitted
    ? section.items.filter((item) => assignments[item.id] === item.categoryId).length
    : 0;

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '1.5rem',
      }}
    >
      {section.title && (
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {section.title}
        </h2>
      )}

      {/* Score */}
      {activeSubmitted && (
        <div
          style={{
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--accent-light)',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontWeight: 600,
            color: 'var(--accent)',
            fontSize: '0.9rem',
          }}
        >
          {t('interactive.score')}: {correctCount} / {total}
        </div>
      )}

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
            borderRadius: '3px',
            transition: 'var(--transition-normal)',
          }}
        />
      </div>

      {/* Instruction */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          fontStyle: 'italic',
        }}
      >
        {t('categorize.instruction')}
      </div>

      {/* Unassigned items pool */}
      {!activeSubmitted && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOverCat('__unassigned__'); }}
          onDrop={handleDropToUnassigned}
          onDragLeave={() => setDragOverCat(null)}
          style={{
            minHeight: '60px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            borderRadius: '8px',
            border: `2px dashed ${dragOverCat === '__unassigned__' ? 'var(--accent)' : 'var(--border-color)'}`,
            backgroundColor: dragOverCat === '__unassigned__' ? 'var(--accent-light)' : 'var(--bg-secondary)',
            transition: 'var(--transition-fast)',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {t('categorize.itemPool')} ({unassignedItems.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {unassignedItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: '0.4rem 0.875rem',
                  backgroundColor: dragging === item.id ? 'var(--accent)' : 'var(--bg-primary)',
                  color: dragging === item.id ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'var(--transition-fast)',
                  boxShadow: dragging === item.id ? 'var(--shadow-md)' : 'none',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.text) }}
              />
            ))}
            {unassignedItems.length === 0 && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {t('categorize.allAssigned')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Unassigned items pool during review */}
      {activeSubmitted && unassignedItems.length > 0 && (
        <div
          style={{
            padding: '1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--error-border, rgba(239,68,68,0.2))',
            backgroundColor: 'var(--error-bg, rgba(239,68,68,0.05))',
            transition: 'var(--transition-fast)',
          }}
        >
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--error-text, var(--error))',
              fontWeight: 700,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span>⚠️</span>
            <span>{t('categorize.unassignedItemsReview')} ({unassignedItems.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {unassignedItems.map((item) => {
              const correctCat = section.categories.find((c) => c.id === item.categoryId);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item.text) }} />
                    <span style={{ color: 'var(--text-muted)' }}>➔</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        border: '1px solid var(--success-border)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {correctCat?.label || t('categorize.unknownCategory')}
                    </span>
                  </div>
                  {item.explanation && (
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        paddingLeft: '0.75rem',
                        borderLeft: '2px solid var(--border-color)',
                      }}
                    >
                      💡 {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(section.categories.length, 3)}, 1fr)`,
          gap: '0.875rem',
        }}
      >
        {section.categories.map((cat) => {
          const itemsInCat = section.items.filter((item) => assignments[item.id] === cat.id);
          const isDragTarget = dragOverCat === cat.id;

          return (
            <div
              key={cat.id}
              onDragOver={(e) => handleDragOver(e, cat.id)}
              onDrop={(e) => handleDrop(e, cat.id)}
              onDragLeave={() => setDragOverCat(null)}
              style={{
                minHeight: '120px',
                padding: '0.875rem',
                borderRadius: '8px',
                border: `2px solid ${isDragTarget ? 'var(--accent)' : 'var(--border-color)'}`,
                backgroundColor: isDragTarget ? 'var(--accent-light)' : 'var(--bg-secondary)',
                transition: 'var(--transition-fast)',
              }}
            >
              {/* Category label */}
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: 'var(--accent)',
                  marginBottom: '0.625rem',
                  padding: '0.25rem 0.625rem',
                  backgroundColor: 'var(--accent-light)',
                  borderRadius: '4px',
                  display: 'inline-block',
                }}
              >
                {cat.label}
              </div>

              {/* Items in this category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.375rem' }}>
                {itemsInCat.map((item) => {
                  const isCorrect = activeSubmitted && assignments[item.id] === item.categoryId;
                  const isWrong = activeSubmitted && assignments[item.id] !== item.categoryId;

                  return (
                    <div
                      key={item.id}
                      draggable={!activeSubmitted}
                      onDragStart={() => !activeSubmitted && handleDragStart(item.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        padding: activeSubmitted && isWrong ? '0.625rem 0.875rem' : '0.375rem 0.75rem',
                        backgroundColor: isCorrect
                          ? 'rgba(16,185,129,0.06)'
                          : isWrong
                          ? 'rgba(239,68,68,0.06)'
                          : 'var(--bg-primary)',
                        border: `1px solid ${isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : 'var(--border-color)'}`,
                        borderRadius: activeSubmitted && isWrong ? '8px' : '16px',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        cursor: activeSubmitted ? 'default' : 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        gap: '0.25rem',
                        userSelect: 'none',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {activeSubmitted && isCorrect && <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>}
                        {activeSubmitted && isWrong && <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>✕</span>}
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item.text) }} />
                        {/* Remove button */}
                        {!activeSubmitted && (
                          <button
                            onClick={() => handleRemoveFromCategory(item.id)}
                            style={{
                              marginLeft: 'auto',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              padding: '0 2px',
                              lineHeight: 1,
                            }}
                            title={t('categorize.removeItem')}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {activeSubmitted && isWrong && item.explanation && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', borderTop: '1px dashed rgba(239,68,68,0.2)', paddingTop: '0.375rem' }}>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              fontStyle: 'italic',
                              lineHeight: 1.35,
                            }}
                          >
                            💡 {item.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Click-to-assign for unassigned items in non-drag env */}
              {!activeSubmitted && unassignedItems.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleAssign(e.target.value, cat.id);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.25rem 0.5rem',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">{t('categorize.addItem')}</option>
                    {unassignedItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.text}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!isExamMode && !activeSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={assignedCount < total}
            className="btn-base"
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor:
                assignedCount < total
                  ? 'var(--bg-tertiary)'
                  : confirming
                  ? 'var(--warning)'
                  : 'var(--accent)',
              color: assignedCount < total ? 'var(--text-muted)' : '#fff',
              cursor: assignedCount < total ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)',
            }}
          >
            {confirming
              ? t('interactive.confirmSubmit')
              : t('interactive.submit')}
          </button>
        ) : (
          !isExamMode && activeSubmitted && (
            <button
              onClick={handleReset}
              className="btn-base"
              style={{
                padding: '0.5rem 1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'var(--transition-fast)',
              }}
            >
              {t('interactive.reset')}
            </button>
          )
        )}
      </div>
    </div>
  );
}
