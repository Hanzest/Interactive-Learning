import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import SectionRenderer from '../Sections/SectionRenderer';
import { gradePageSections } from '../../utils/grading';
import styles from './PageContent.module.css';

export default function PageContent() {
  const { state, submitExam, retryExam, updateExamTimeLeft, toggleExamPause, setExamPause, setLearningMode, addToast } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideDirection = useRef(1);
  const [animClass, setAnimClass] = useState('');
  const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
  const [slideScore, setSlideScore] = useState<{ score: number; total: number } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [forceSubmit, setForceSubmit] = useState(false);
  // Exam timer: custom minutes override (null = auto-calculated)
  const [customExamMinutes, setCustomExamMinutes] = useState<number | null>(null);
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationInput, setDurationInput] = useState('');
  const [showRetryConfirm, setShowRetryConfirm] = useState(false);

  const page = state.currentPageIndex >= 0 && state.currentPageIndex < state.pages.length
    ? state.pages[state.currentPageIndex]
    : null;

  const currentPageId = page?._meta?.id || String(state.currentPageIndex);

  const isPaused = !!state.examPaused[currentPageId];
  const setIsPaused = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      setExamPause(state.currentPageIndex, val(isPaused));
    } else {
      setExamPause(state.currentPageIndex, val);
    }
  }, [state.currentPageIndex, isPaused, setExamPause]);

  // Reset slide position when navigating between pages or switching modes
  useEffect(() => {
    setCurrentSlide(0);
    setShowConfirmOverlay(false);
    setSlideScore(null);
    setIsConfirmed(false);
    setForceSubmit(false);
    setIsPaused(false);
  }, [state.currentPageIndex, state.learningMode]);

  const sections = page
    ? (state.learningMode === 'learn'
        ? (page.learn || [])
        : state.learningMode === 'practice'
        ? (page.practice || [])
        : (page.exam || []))
    : [];

  const totalSlides = sections.length;
  // Clamping to prevent out-of-bounds rendering crashes
  const activeSlideIndex = totalSlides > 0 ? Math.max(0, Math.min(currentSlide, totalSlides - 1)) : 0;

  // Synchronously adjust currentSlide state during render if it exceeds totalSlides
  if (totalSlides > 0 && currentSlide >= totalSlides) {
    setCurrentSlide(totalSlides - 1);
  }

  const section = sections[activeSlideIndex];
  const isGraded = section && ['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'].includes(section.type);

  // ── Exam mode: page-wide timer ─────────────────────────────────────────────
  const isExamMode = state.learningMode === 'exam';
  const isPageExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];

  // Calculate the auto total exam time for the entire page (sum of all graded components)
  const pageExamAutoTime = useMemo(() => {
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
    return Math.max(total, 60); // at least 1 minute
  }, [isExamMode, page, state.currentPageIndex]);

  const pageExamMaxTime = customExamMinutes != null
    ? customExamMinutes * 60
    : pageExamAutoTime;

  // Restore or initialize the page-level time left
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize timeLeft when entering exam mode or switching pages
  useEffect(() => {
    if (!isExamMode || isPageExamSubmitted) {
      setTimeLeft(0);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    const persisted = state.examTimeLeft[currentPageId];
    const initialTime = persisted !== undefined ? persisted : pageExamMaxTime;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(initialTime);
    setIsPaused(false); // Reset pause on page change
  }, [state.currentPageIndex, state.learningMode, pageExamMaxTime, isExamMode, isPageExamSubmitted]);

  // Page-wide countdown timer
  useEffect(() => {
    if (!isExamMode || isPageExamSubmitted || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          submitExam(state.currentPageIndex);
          addToast('⏰ Time is up! Exam submitted automatically.', 'warning', 4000);
          return 0;
        }
        const next = prev - 1;
        updateExamTimeLeft(state.currentPageIndex, next);
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isExamMode, isPageExamSubmitted, isPaused, state.currentPageIndex, timeLeft > 0, submitExam, addToast, updateExamTimeLeft]);

  // ── Practice mode: per-slide grading ──────────────────────────────────────
  // Reset slide-local states on slide navigation (practice mode only)
  useEffect(() => {
    if (!isExamMode) {
      setIsConfirmed(false);
      setForceSubmit(false);
      setSlideScore(null);
    }
  }, [activeSlideIndex, isExamMode]);

  const handleGraded = useCallback((score: number, total: number) => {
    setSlideScore({ score, total });
    setIsConfirmed(true);
  }, []);

  // ── Exam: Confirm & Submit all ─────────────────────────────────────────────
  const handleExamConfirm = useCallback(() => {
    submitExam(state.currentPageIndex);
    setShowConfirmOverlay(false);
    addToast('✅ Exam submitted! Scroll through each slide to review answers.', 'success', 5000);
  }, [state.currentPageIndex, submitExam, addToast]);

  // ── Exam: Retry ────────────────────────────────────────────────────────────
  const handleRetryExam = useCallback(() => {
    retryExam(state.currentPageIndex);
    setShowRetryConfirm(false);
    setCurrentSlide(0);
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const resetTime = customExamMinutes != null ? customExamMinutes * 60 : pageExamAutoTime;
    setTimeLeft(resetTime);
    updateExamTimeLeft(state.currentPageIndex, resetTime);
    addToast('🔄 Exam reset! Click Resume to start.', 'info', 3000);
  }, [state.currentPageIndex, retryExam, addToast, customExamMinutes, pageExamAutoTime, updateExamTimeLeft]);

  // Compute page exam score for the review summary
  const pageExamResult = useMemo(() => {
    if (!isPageExamSubmitted || !page) return null;
    return gradePageSections(page, currentPageId, state.sectionAnswers, 'exam');
  }, [isPageExamSubmitted, page, currentPageId, state.sectionAnswers]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const timerUrgent = timeLeft > 0 && timeLeft < 30;

  if (!page) return null;

  const meta = page.page || {};
  const title = meta.title || 'Untitled';
  const description = meta.description || '';
  const tags = (meta as any).tags || [];

  const hasMultipleSlides = totalSlides > 1;
  const isLastSlide = activeSlideIndex === totalSlides - 1;

  const goPrev = useCallback(() => {
    slideDirection.current = -1;
    setAnimClass(styles.slideEnterLeft);
    setCurrentSlide((p) => Math.max(0, p - 1));
  }, []);

  const goNext = useCallback(() => {
    slideDirection.current = 1;
    setAnimClass(styles.slideEnterRight);
    setCurrentSlide((p) => Math.min(totalSlides - 1, p + 1));
  }, [totalSlides]);

  // Clear animation class after it finishes
  useEffect(() => {
    if (!animClass) return;
    const timer = setTimeout(() => setAnimClass(''), 300);
    return () => clearTimeout(timer);
  }, [animClass]);

  return (
    <div className={styles.container}>

      {/* ── Confirm Submit Overlay ── */}
      {showConfirmOverlay && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            padding: '2rem',
            maxWidth: 480,
            width: '90%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Submit Exam?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Once you confirm, all your answers will be locked and you can review your results for <strong>every slide</strong> on this page.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmOverlay(false)}
                className="btn-base"
                style={{
                  padding: '0.6rem 1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExamConfirm}
                className="btn-base"
                style={{
                  padding: '0.6rem 1.5rem',
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px var(--accent-shadow)',
                }}
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Retry Exam Confirm Overlay ── */}
      {showRetryConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            padding: '2rem',
            maxWidth: 480,
            width: '90%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔄</div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Retry This Exam?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.6 }}>
              This will <strong>clear all your answers</strong> and reset the timer for this page. Your progress cannot be recovered.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowRetryConfirm(false)}
                className="btn-base"
                style={{
                  padding: '0.6rem 1.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRetryExam}
                className="btn-base"
                style={{
                  padding: '0.6rem 1.5rem',
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--error, #ef4444)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
                }}
              >
                Yes, Retry Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Fixed Metadata Section === */}

      <div style={{ marginBottom: 24 }}>
        {/* Title */}
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: 16,
            fontSize: '0.9375rem',
            lineHeight: 1.6,
          }}>
            {description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {tags.map((tag: string) => (
              <span key={tag} style={{
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-mid)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Page-wide exam timer banner */}
        {isExamMode && pageExamMaxTime > 0 && !isPageExamSubmitted && (
          <div className={styles.timerBanner} style={{
            backgroundColor: timerUrgent ? 'rgba(239,68,68,0.08)' : undefined,
            borderColor: timerUrgent ? 'var(--error)' : undefined,
          }}>
            {/* Top row: Title */}
            <div className={styles.timerTitleRow}>
              <div className={styles.timerTitleGroup} style={{ color: timerUrgent ? 'var(--error)' : undefined }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={16} height={16}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Exam Mode Controls</span>
              </div>
            </div>

            {/* Middle row: Progress Bar */}
            <div style={{
              width: '100%',
              height: 6,
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 3,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${pageExamMaxTime > 0 ? Math.max(0, (timeLeft / pageExamMaxTime) * 100) : 100}%`,
                height: '100%',
                backgroundColor: timerUrgent ? 'var(--error)' : 'var(--accent)',
                borderRadius: 3,
                transition: 'width 1s linear, background-color 0.3s',
              }} />
            </div>

            {/* Bottom row: Actions */}
            <div className={styles.timerActionsRow}>
              {/* Editable duration */}
              {editingDuration ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const mins = parseInt(durationInput, 10);
                    if (!isNaN(mins) && mins > 0) {
                      setCustomExamMinutes(mins);
                      setTimeLeft(mins * 60);
                      updateExamTimeLeft(state.currentPageIndex, mins * 60);
                      setIsPaused(true);
                    }
                    setEditingDuration(false);
                  }}
                  className={styles.timerForm}
                >
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingDuration(false);
                      }
                    }}
                    style={{
                      width: 60,
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--accent)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>min</span>
                  <button
                    type="submit"
                    className="btn-base"
                    style={{
                      padding: '4px 10px',
                      border: 'none',
                      borderRadius: 6,
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingDuration(false)}
                    className="btn-base"
                    style={{
                      padding: '4px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setDurationInput(String(Math.ceil(pageExamMaxTime / 60)));
                    setEditingDuration(true);
                  }}
                  title="Change exam duration"
                  className="btn-base"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    background: 'var(--bg-primary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Duration ({Math.ceil(pageExamMaxTime / 60)}m)</span>
                </button>
              )}

              {/* Pause/Resume Button */}
              <button
                onClick={() => setIsPaused((p) => !p)}
                data-exam-pause-btn
                className="btn-base"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  background: isPaused ? 'var(--accent)' : 'var(--bg-primary)',
                  color: isPaused ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isPaused ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Resume Exam</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width={13} height={13}>
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>Pause Exam</span>
                  </>
                )}
              </button>

              {/* Restart Button */}
              <button
                onClick={() => setShowRetryConfirm(true)}
                className="btn-base"
                title="Restart this exam (clears progress)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Restart</span>
              </button>
            </div>
          </div>
        )}

        {/* Exam submitted – review mode banner */}
        {isExamMode && isPageExamSubmitted && pageExamResult && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 10,
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success-text)', marginBottom: 2 }}>
                ✅ Exam Submitted — Review Mode
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Navigate slides to review your answers.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              {/* Score badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--success-border)',
                borderRadius: 8,
                padding: '0 12px',
              }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success-text)', lineHeight: 1 }}>
                  {pageExamResult.total > 0 ? Math.round((pageExamResult.correct / pageExamResult.total) * 100) : 0}%
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderLeft: '1px solid var(--success-border)', paddingLeft: '8px', lineHeight: 1 }}>
                  {pageExamResult.correct}/{pageExamResult.total}
                </span>
              </div>
              {/* Retry button */}
              <button
                onClick={() => setShowRetryConfirm(true)}
                className="btn-base"
                title="Retry this exam (clears all answers)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  height: '38px',
                  padding: '0 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}


        {/* Progress dots - only if multiple sections */}
        {hasMultipleSlides && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingTop: 4,
            borderTop: '1px solid var(--border-color)',
          }}>
            {sections.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  slideDirection.current = i > activeSlideIndex ? 1 : -1;
                  setAnimClass(i > activeSlideIndex ? styles.slideEnterRight : styles.slideEnterLeft);
                  setCurrentSlide(i);
                }}
                aria-label={`Go to section ${i + 1}`}
                style={{
                  width: i === activeSlideIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: i === activeSlideIndex ? 'var(--accent)' : 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginLeft: 8,
              whiteSpace: 'nowrap',
            }}>
              {activeSlideIndex + 1} / {totalSlides}
            </span>
          </div>
        )}
      </div>

      {/* === Slide Area === */}
      {totalSlides > 0 ? (
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          minHeight: isExamMode ? '340px' : undefined,
        }}>
          {isPaused && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              color: 'var(--text-primary)',
              textAlign: 'center',
              padding: '1.5rem',
              border: '1px solid var(--border-color)',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏸️</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Exam Paused</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: 8, marginBottom: 24, maxWidth: 320 }}>
                The exam timer is currently paused. Resume when you are ready to continue.
              </p>
              <button
                onClick={() => setIsPaused(false)}
                className="btn-base"
                style={{
                  padding: '0.6rem 1.8rem',
                  border: 'none',
                  borderRadius: 8,
                  background: 'var(--accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px var(--accent-shadow)',
                  transition: 'transform 0.2s',
                }}
              >
                Resume Exam
              </button>
            </div>
          )}

          {/* Previous Arrow */}
          {hasMultipleSlides && (
            <button
              onClick={goPrev}
              disabled={activeSlideIndex === 0}
              data-nav-prev="slide"
              aria-label="Previous section"
              className={styles.slideArrow}
              style={{
                color: activeSlideIndex === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: activeSlideIndex === 0 ? 0.3 : 1,
              }}
            >
              ◀
            </button>
          )}

          {/* Slide content */}
          <div className={animClass || undefined} style={{ flex: 1, minWidth: 0 }}>

            {/* Practice mode badge */}
            {state.learningMode === 'practice' && isGraded && (
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 16,
              }}>
                ✨ Practice Mode • Unlimited Time • Graded Component
              </div>
            )}

            {/* Practice mode: slide score after grading */}
            {state.learningMode === 'practice' && isConfirmed && slideScore && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 8,
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                color: 'var(--success-text)',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    🎉 Slide Score Summary
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    You got {slideScore.score} out of {slideScore.total} correct!
                  </p>
                </div>
                <div style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: 6,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--success-border)',
                }}>
                  {slideScore.total > 0 ? Math.round((slideScore.score / slideScore.total) * 100) : 0}%
                </div>
              </div>
            )}

            <SectionRenderer
              key={`${state.currentPageIndex}-${activeSlideIndex}`}
              section={section}
              sectionIndex={
                state.learningMode === 'learn'
                  ? (page.learn ? page.learn.indexOf(section) : activeSlideIndex)
                  : state.learningMode === 'practice'
                  ? (page.practice ? page.practice.indexOf(section) : activeSlideIndex)
                  : (page.exam ? page.exam.indexOf(section) : activeSlideIndex)
              }
              forceSubmit={forceSubmit}
              isConfirmed={isConfirmed}
              onGraded={isExamMode ? undefined : handleGraded}
            />

            {/* Navigation options to other modes on the last slide */}
            {isLastSlide && (
              <div style={{
                marginTop: 32,
                padding: '24px',
                borderRadius: 16,
                background: 'var(--bg-secondary)',
                border: '1.5px dashed var(--accent-mid)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🎓</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {state.learningMode === 'learn' && "Congratulations! You've finished learning."}
                  {state.learningMode === 'practice' && "Great job! You've completed the practice."}
                  {state.learningMode === 'exam' && "Congratulations! You've completed the exam."}
                </h3>
                <p style={{ margin: '8px 0 24px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {state.learningMode === 'learn' && "Ready to practice or take a timed exam on these concepts?"}
                  {state.learningMode === 'practice' && "Ready to review the learning material or take a timed exam?"}
                  {state.learningMode === 'exam' && "Ready to review the learning material or practice the concepts?"}
                </p>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  {state.learningMode !== 'learn' && (page.learn || []).length > 0 && (
                    <button
                      onClick={() => {
                        setLearningMode('learn');
                        addToast('📖 Switched to Learn Mode. Happy studying!', 'info', 3000);
                      }}
                      className="btn-base"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.625rem 1.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 10,
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      📖 Learn Mode
                    </button>
                  )}

                  {state.learningMode !== 'practice' && (page.practice || []).length > 0 && (
                    <button
                      onClick={() => {
                        setLearningMode('practice');
                        addToast('✍️ Switched to Practice Mode. Try answering the questions!', 'info', 3000);
                      }}
                      className="btn-base"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.625rem 1.5rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 10,
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      ✍️ Practice Mode
                    </button>
                  )}

                  {state.learningMode !== 'exam' && (page.exam || []).length > 0 && (
                    <button
                      onClick={() => {
                        setLearningMode('exam');
                        addToast('⏱️ Switched to Exam Mode. The page timer has started!', 'info', 3000);
                      }}
                      className="btn-base"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0.625rem 1.5rem',
                        border: 'none',
                        borderRadius: 10,
                        background: 'var(--accent)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 4px 12px var(--accent-shadow)',
                      }}
                    >
                      ⏱️ Take Exam
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Exam mode: Confirm & Submit on last slide */}
            {isExamMode && isLastSlide && !isPageExamSubmitted && (
              <div style={{
                marginTop: 24,
                padding: '20px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-secondary) 100%)',
                border: '1px solid var(--accent-mid)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                    Ready to submit?
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Make sure you've saved answers for all slides. After confirming, answers are locked and you can review them.
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirmOverlay(true)}
                  className="btn-base"
                  style={{
                    flexShrink: 0,
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    borderRadius: 8,
                    background: 'var(--accent)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px var(--accent-shadow)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Confirm & Submit →
                </button>
              </div>
            )}

            {/* Mobile navigation row (below content, only on small screens) */}
            {hasMultipleSlides && (
              <div className={styles.mobileNav}>
                <button
                  onClick={goPrev}
                  disabled={activeSlideIndex === 0}
                  className="btn-base"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: activeSlideIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: activeSlideIndex === 0 ? 0.5 : 1,
                  }}
                >
                  ← Prev Slide
                </button>
                <button
                  onClick={goNext}
                  disabled={activeSlideIndex === totalSlides - 1}
                  className="btn-base"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: activeSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
                    opacity: activeSlideIndex === totalSlides - 1 ? 0.5 : 1,
                  }}
                >
                  Next Slide →
                </button>
              </div>
            )}
          </div>

          {/* Next Arrow */}
          {hasMultipleSlides && (
            <button
              onClick={goNext}
              disabled={activeSlideIndex === totalSlides - 1}
              data-nav-next="slide"
              aria-label="Next section"
              className={styles.slideArrow}
              style={{
                color: activeSlideIndex === totalSlides - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: activeSlideIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
                opacity: activeSlideIndex === totalSlides - 1 ? 0.3 : 1,
              }}
            >
              ▶
            </button>
          )}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 32 }}>
          This page has no sections.
        </p>
      )}

    </div>
  );
}
