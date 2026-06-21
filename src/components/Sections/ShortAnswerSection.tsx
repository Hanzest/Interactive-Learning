import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { ShortAnswerSection as ShortAnswerSectionType } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { renderMarkdown } from '../../utils/renderContent';
import { useTranslation } from '../../hooks/useTranslation';

interface ShortAnswerSectionProps {
  section: ShortAnswerSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

interface ShortAnswerQuestionItemProps {
  q: any;
  i: number;
  userAnswer: string;
  isRevealed: boolean;
  activeSubmitted: boolean;
  stateLearningMode: string;
  t: (key: string) => string;
  onAnswerChange: (i: number, value: string) => void;
  onReveal: (i: number) => void;
}

const ShortAnswerQuestionItem = React.memo(function ShortAnswerQuestionItem({
  q,
  i,
  userAnswer,
  isRevealed,
  activeSubmitted,
  stateLearningMode,
  t,
  onAnswerChange,
  onReveal,
}: ShortAnswerQuestionItemProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
      }}
    >
      {/* Question number */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          marginBottom: '0.375rem',
        }}
      >
        {t('shortAnswer.question')} {i + 1}
      </div>

      {/* Prompt */}
      <div
        style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.9875rem',
          lineHeight: 1.55,
          marginBottom: '0.75rem',
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(q.prompt) }}
      />

      {/* Hint */}
      {q.hint && (
        <div style={{ marginBottom: '0.625rem' }}>
          <button
            onClick={() => setShowHint(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <span>💡</span>
            <span>{showHint ? t('sections.hideHint') : t('sections.showHint')}</span>
          </button>
          {showHint && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                marginTop: '0.375rem',
                paddingLeft: '0.75rem',
                borderLeft: '3px solid var(--warning-border)',
              }}
            >
              {q.hint}
            </div>
          )}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={userAnswer}
        onChange={(e) => onAnswerChange(i, e.target.value)}
        readOnly={activeSubmitted}
        placeholder={t('shortAnswer.placeholder')}
        rows={4}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          backgroundColor: activeSubmitted ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: '0.9rem',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          boxSizing: 'border-box',
          cursor: activeSubmitted ? 'default' : 'text',
        }}
      />

      {/* Reveal sample answer button */}
      {(activeSubmitted || stateLearningMode === 'learn') && (
        <button
          onClick={() => onReveal(i)}
          className="btn-base"
          style={{
            marginTop: '0.625rem',
            padding: '0.375rem 0.875rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: isRevealed ? 'var(--accent-light)' : 'var(--bg-primary)',
            color: isRevealed ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
        >
          {isRevealed ? t('interactive.hideAnswer') : t('shortAnswer.revealSample')}
        </button>
      )}

      {/* Sample answer + key points */}
      {isRevealed && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.875rem 1rem',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            borderRadius: '6px',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: 'var(--success-text)',
              fontSize: '0.8125rem',
              marginBottom: '0.5rem',
            }}
          >
            📖 {t('shortAnswer.sampleAnswer')}
          </div>
          <div
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.55,
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(q.sampleAnswer) }}
          />

          {/* Key points checklist */}
          {q.keyPoints && q.keyPoints.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.375rem',
                }}
              >
                {t('shortAnswer.keyPoints')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {q.keyPoints.map((kp: string, ki: number) => (
                  <div
                    key={ki}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.1rem' }}>
                      ✓
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(kp) }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default function ShortAnswerSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
}: ShortAnswerSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const { t } = useTranslation();

  // answers[i] = typed string
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // revealed[i] = whether sample answer is shown
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);

  const isExamMode = state.learningMode === 'exam';
  const currentPageId = state.pages[state.currentPageIndex]?._meta?.id || String(state.currentPageIndex);
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  const isSavingRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const latestAnswersRef = useRef(answers);
  const latestRevealedRef = useRef(revealed);

  useEffect(() => {
    latestAnswersRef.current = answers;
    latestRevealedRef.current = revealed;
  }, [answers, revealed]);

  useEffect(() => {
    if (isSavingRef.current) {
      isSavingRef.current = false;
      return;
    }
    const savedKey = `${state.learningMode}_${sectionIndex}`;
    const saved = state.sectionAnswers[currentPageId]?.[savedKey] ?? state.sectionAnswers[currentPageId]?.[sectionIndex];
    if (saved) {
      setAnswers(saved.answers || {});
      setRevealed(saved.revealed || {});
    } else {
      setAnswers({});
      setRevealed({});
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [currentPageId, sectionIndex, isExamMode, state.sectionAnswers]);

  const saveState = useCallback(
    (newAnswers: Record<number, string>, newRevealed: Record<number, boolean>) => {
      isSavingRef.current = true;
      saveSectionAnswers(state.currentPageIndex, sectionIndex, {
        answers: newAnswers,
        revealed: newRevealed,
      });
    },
    [state.currentPageIndex, sectionIndex, saveSectionAnswers]
  );

  const handleAnswerChange = useCallback(
    (i: number, value: string) => {
      if (activeSubmitted) return;
      const newAnswers = { ...answers, [i]: value };
      setAnswers(newAnswers);

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        saveState(newAnswers, revealed);
      }, 500);
    },
    [activeSubmitted, answers, revealed, saveState]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        saveState(latestAnswersRef.current, latestRevealedRef.current);
      }
    };
  }, [saveState]);

  const handleReveal = useCallback(
    (i: number) => {
      const newRevealed = { ...revealed, [i]: !revealed[i] };
      setRevealed(newRevealed);
      saveState(answers, newRevealed);
    },
    [revealed, answers, saveState]
  );

  // Short answer is self-graded — "submit" in practice mode just locks answers
  const handleSubmit = useCallback(() => {
    const answeredAll = section.questions.every((_, i) => (answers[i] || '').trim().length > 0);
    if (!answeredAll) {
      alert(t('shortAnswer.pleaseAnswerAll'));
      return;
    }
    if (isExamMode) {
      saveState(answers, revealed);
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 2000);
      addToast(t('interactive.answersSaved'), 'success', 2000);
      return;
    }
    setSubmitted(true);
    if (onGraded) {
      // Self-assessed: pass total as score placeholder so parent knows it was completed
      onGraded(section.questions.length, section.questions.length);
    }
  }, [
    section.questions,
    answers,
    isExamMode,
    revealed,
    saveState,
    addToast,
    onGraded,
    t,
  ]);

  const handleToggleAllRevealed = useCallback(() => {
    const allRevealed = section.questions.every((_, i) => revealed[i]);
    const nextRevealedState: Record<number, boolean> = {};
    section.questions.forEach((_, i) => {
      nextRevealedState[i] = !allRevealed;
    });
    setRevealed(nextRevealedState);
    saveState(answers, nextRevealedState);
  }, [section.questions, revealed, answers, saveState]);



  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      handleSubmit();
    }
  }, [forceSubmit, submitted, handleSubmit, isExamMode]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    saveState({}, {});
  }, [saveState]);

  const answeredCount = section.questions.filter(
    (_, i) => (answers[i] || '').trim().length > 0
  ).length;
  const total = section.questions.length;
  const progressPercent = activeSubmitted ? 100 : (answeredCount / total) * 100;

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
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          {section.title}
        </h2>
      )}

      {/* Self-assessment notice */}
      <div
        style={{
          padding: '0.5rem 0.875rem',
          backgroundColor: 'var(--accent-light)',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--accent)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        📝 {t('shortAnswer.selfAssessNotice')}
      </div>

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

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {section.questions.map((q, i) => (
          <ShortAnswerQuestionItem
            key={i}
            q={q}
            i={i}
            userAnswer={answers[i] || ''}
            isRevealed={!!revealed[i]}
            activeSubmitted={activeSubmitted}
            stateLearningMode={state.learningMode}
            t={t}
            onAnswerChange={handleAnswerChange}
            onReveal={handleReveal}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '0.625rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        {!isExamMode && !activeSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={answeredCount < total}
            className="btn-base"
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: answeredCount < total ? 'var(--bg-tertiary)' : 'var(--accent)',
              color: answeredCount < total ? 'var(--text-muted)' : '#fff',
              cursor: answeredCount < total ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)',
            }}
          >
            {t('interactive.submit')}
          </button>
        ) : null}

        {state.learningMode !== 'exam' && (
          <>
            {(activeSubmitted || state.learningMode === 'learn') && (
              <button
                onClick={handleToggleAllRevealed}
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
                {section.questions.every((_, i) => revealed[i])
                  ? t('shortAnswer.hideAll')
                  : t('shortAnswer.revealAll')}
              </button>
            )}
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
          </>
        )}
      </div>
    </div>
  );
}
