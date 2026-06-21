import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { TrueFalseSection as TrueFalseSectionType } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { renderMarkdown } from '../../utils/renderContent';
import { useTranslation } from '../../hooks/useTranslation';

const StatementRow = React.memo(({
  stmt,
  index,
  userAnswer,
  activeSubmitted,
  onSelect,
  t,
}: {
  stmt: any;
  index: number;
  userAnswer: boolean | undefined;
  activeSubmitted: boolean;
  onSelect: (statementIndex: number, value: boolean) => void;
  t: any;
}) => {
  const isAnswered = userAnswer !== undefined;
  const isCorrect = activeSubmitted && userAnswer === stmt.isTrue;
  const isWrong = activeSubmitted && isAnswered && !isCorrect;

  let cardBg = 'var(--bg-secondary)';
  let cardBorder = 'var(--border-color)';
  if (activeSubmitted) {
    if (isCorrect) { cardBg = 'rgba(16,185,129,0.08)'; cardBorder = 'var(--success)'; }
    else if (isWrong) { cardBg = 'rgba(239,68,68,0.08)'; cardBorder = 'var(--error)'; }
  }

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        transition: 'var(--transition-fast)',
      }}
    >
      {/* Statement number + text */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          marginBottom: '0.375rem',
        }}
      >
        {t('trueFalse.statement')} {index + 1}
      </div>
      <div
        style={{
          color: 'var(--text-primary)',
          fontWeight: 500,
          fontSize: '0.9875rem',
          lineHeight: 1.55,
          marginBottom: '0.875rem',
        }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(stmt.statement) }}
      />

      {/* True / False buttons */}
      <div style={{ display: 'flex', gap: '0.625rem' }}>
        {([true, false] as const).map((val) => {
          const label = val ? t('trueFalse.true') : t('trueFalse.false');
          const isSelected = userAnswer === val;
          const isThisCorrect = activeSubmitted && stmt.isTrue === val;
          const isThisWrong = activeSubmitted && isSelected && stmt.isTrue !== val;

          let btnBg = isSelected ? 'var(--accent-light)' : 'var(--bg-primary)';
          let btnBorder = isSelected ? 'var(--accent)' : 'var(--border-color)';
          let btnColor = isSelected ? 'var(--accent)' : 'var(--text-secondary)';

          if (activeSubmitted) {
            if (isThisCorrect) {
              btnBg = 'rgba(16,185,129,0.15)';
              btnBorder = 'var(--success)';
              btnColor = 'var(--success-text)';
            } else if (isThisWrong) {
              btnBg = 'rgba(239,68,68,0.15)';
              btnBorder = 'var(--error)';
              btnColor = 'var(--error-text)';
            } else {
              btnBg = 'var(--bg-primary)';
              btnBorder = 'var(--border-color)';
              btnColor = 'var(--text-muted)';
            }
          }

          return (
            <button
              key={String(val)}
              onClick={() => onSelect(index, val)}
              disabled={activeSubmitted}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: `2px solid ${btnBorder}`,
                borderRadius: '6px',
                backgroundColor: btnBg,
                color: btnColor,
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: activeSubmitted ? 'default' : 'pointer',
                transition: 'var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}
            >
              {activeSubmitted && isThisCorrect && <span>✓</span>}
              {activeSubmitted && isThisWrong && <span>✕</span>}
              {label}
            </button>
          );
        })}
      </div>

      {/* Explanation after submit */}
      {activeSubmitted && stmt.explanation && (
        <div
          style={{
            marginTop: '0.875rem',
            padding: '0.75rem 1rem',
            backgroundColor: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${isCorrect ? 'var(--success-border)' : 'var(--error-border)'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            lineHeight: 1.5,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: isCorrect ? 'var(--success-text)' : 'var(--error-text)',
              marginBottom: '0.375rem',
              fontSize: '0.8125rem',
            }}
          >
            💡 {t('sections.explanation')}
          </div>
          <div
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(stmt.explanation) }}
          />
        </div>
      )}
    </div>
  );
});

interface TrueFalseSectionProps {
  section: TrueFalseSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function TrueFalseSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: TrueFalseSectionProps) {
  const { state, saveSectionAnswers, recordQuizScore, addToast } = useAppContext();
  const { t } = useTranslation();

  // answers[i] = true | false | undefined
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const isExamMode = state.learningMode === 'exam';
  const currentPageId = state.pages[state.currentPageIndex]?._meta?.id || String(state.currentPageIndex);
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[currentPageId];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  const isSavingRef = useRef(false);

  // Load saved answers
  useEffect(() => {
    if (isSavingRef.current) {
      isSavingRef.current = false;
      return;
    }
    const savedKey = `${state.learningMode}_${sectionIndex}`;
    const saved = state.sectionAnswers[currentPageId]?.[savedKey] ?? state.sectionAnswers[currentPageId]?.[sectionIndex];
    if (saved) {
      setAnswers(saved);
    } else {
      setAnswers({});
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [currentPageId, sectionIndex, isExamMode, state.sectionAnswers]);

  const runGrading = useCallback(() => {
    let correct = 0;
    section.statements.forEach((stmt, i) => {
      if (answers[i] === stmt.isTrue) correct++;
    });
    setSubmitted(true);
    setConfirming(false);
    recordQuizScore(state.currentPageIndex, sectionIndex, correct, section.statements.length);
    if (onGraded) {
      onGraded(correct, section.statements.length);
    }
  }, [answers, section.statements, recordQuizScore, state.currentPageIndex, sectionIndex, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleSelect = useCallback(
    (statementIndex: number, value: boolean) => {
      if (activeSubmitted) return;
      const newAnswers = { ...answersRef.current, [statementIndex]: value };
      setAnswers(newAnswers);
      isSavingRef.current = true;
      saveSectionAnswers(state.currentPageIndex, sectionIndex, newAnswers);
    },
    [activeSubmitted, saveSectionAnswers, state.currentPageIndex, sectionIndex]
  );

  const handleSubmit = useCallback(() => {
    const answeredAll = section.statements.every((_, i) => answers[i] !== undefined);
    if (!answeredAll) {
      alert(t('trueFalse.pleaseAnswerAll'));
      return;
    }
    if (isExamMode) {
      isSavingRef.current = true;
      saveSectionAnswers(state.currentPageIndex, sectionIndex, answers);
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 2000);
      addToast(t('interactive.answersSaved'), 'success', 2000);
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
  }, [
    state.learningMode,
    isExamMode,
    confirming,
    runGrading,
    section.statements,
    answers,
    saveSectionAnswers,
    state.currentPageIndex,
    sectionIndex,
    addToast,
    t,
  ]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setConfirming(false);
    isSavingRef.current = true;
    saveSectionAnswers(state.currentPageIndex, sectionIndex, {});
  }, [state.currentPageIndex, sectionIndex, saveSectionAnswers]);

  const correctCount = activeSubmitted
    ? section.statements.filter((stmt, i) => answers[i] === stmt.isTrue).length
    : 0;
  const answeredCount = Object.keys(answers).length;
  const total = section.statements.length;
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
            marginBottom: '0.75rem',
          }}
        >
          {section.title}
        </h2>
      )}

      {/* Score display */}
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

      {/* Statements */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {section.statements.map((stmt, i) => (
          <StatementRow
            key={i}
            stmt={stmt}
            index={i}
            userAnswer={answers[i]}
            activeSubmitted={activeSubmitted}
            onSelect={handleSelect}
            t={t}
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
              backgroundColor:
                answeredCount < total
                  ? 'var(--bg-tertiary)'
                  : confirming
                  ? 'var(--warning)'
                  : 'var(--accent)',
              color: answeredCount < total ? 'var(--text-muted)' : '#fff',
              cursor: answeredCount < total ? 'not-allowed' : 'pointer',
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
