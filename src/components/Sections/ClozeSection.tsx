import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ClozeSection as ClozeSectionType } from '../../types/schema';
import { renderMarkdown } from '../../utils/renderContent';
import { useAppContext } from '../../context/AppContext';

interface ClozeSectionProps {
  section: ClozeSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function ClozeSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: ClozeSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);
  const prevAnswersRef = useRef<Record<string, string>>({});

  const isExamMode = state.learningMode === 'exam';
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[state.currentPageIndex];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  // Load saved answers
  useEffect(() => {
    const saved = state.sectionAnswers[state.currentPageIndex]?.[sectionIndex];
    if (saved) {
      setAnswers(saved);
    } else {
      setAnswers({});
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [state.currentPageIndex, sectionIndex, isExamMode, state.sectionAnswers]);

  const handleAnswerChange = useCallback(
    (blankId: string, value: string) => {
      if (activeSubmitted || showAnswer) return;
      const cappedValue = value.slice(0, 100);
      const newAnswers = { ...answers, [blankId]: cappedValue };
      setAnswers(newAnswers);
      saveSectionAnswers(state.currentPageIndex, sectionIndex, newAnswers);
    },
    [activeSubmitted, showAnswer, answers, saveSectionAnswers, state.currentPageIndex, sectionIndex]
  );

  const runGrading = useCallback(() => {
    setSubmitted(true);
    setConfirming(false);
    if (onGraded) {
      let correct = 0;
      section.blanks.forEach((b) => {
        const userAnswer = answers[b.id]?.trim().toLowerCase() || '';
        let isCorrect = false;
        if (b.correctIndex !== undefined && b.options) {
          const selectedOptionIndex = b.options.indexOf(answers[b.id] || '');
          isCorrect = selectedOptionIndex === b.correctIndex;
        } else if (b.correctAnswer) {
          isCorrect = userAnswer === b.correctAnswer.trim().toLowerCase();
        }
        if (isCorrect) correct++;
      });
      onGraded(correct, section.blanks.length);
    }
  }, [answers, section.blanks, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleSubmit = useCallback(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < section.blanks.length) {
      alert("Please fill in all blanks before checking.");
      return;
    }
    if (isExamMode) {
      saveSectionAnswers(state.currentPageIndex, sectionIndex, answers);
      setIsSavedText(true);
      setTimeout(() => setIsSavedText(false), 2000);
      addToast("Answers saved!", "success", 2000);
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
  }, [state.learningMode, isExamMode, confirming, runGrading, answers, section.blanks.length, saveSectionAnswers, state.currentPageIndex, sectionIndex, addToast]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setConfirming(false);
    setHints({});
    setShowAnswer(false);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, {});
  }, [state.currentPageIndex, sectionIndex, saveSectionAnswers]);

  const handleShowAnswer = useCallback(() => {
    if (!showAnswer) {
      prevAnswersRef.current = { ...answers };
      const correctAnswers: Record<string, string> = {};
      section.blanks.forEach((b) => {
        const ans = b.correctIndex !== undefined && b.options
          ? b.options[b.correctIndex]
          : b.correctAnswer || '';
        correctAnswers[b.id] = ans;
      });
      setAnswers(correctAnswers);
    } else {
      setAnswers(prevAnswersRef.current);
    }
    setShowAnswer(!showAnswer);
  }, [showAnswer, section.blanks, answers]);

  const toggleHint = useCallback((blankId: string) => {
    setHints((prev) => ({ ...prev, [blankId]: !prev[blankId] }));
  }, []);

  const checkBlank = (blank: typeof section.blanks[0]) => {
    if (!activeSubmitted) return null;
    const userAnswer = answers[blank.id]?.trim().toLowerCase() || '';
    if (blank.correctIndex !== undefined && blank.options) {
      const selectedOptionIndex = blank.options.indexOf(answers[blank.id] || '');
      return selectedOptionIndex === blank.correctIndex;
    }
    if (blank.correctAnswer) {
      return userAnswer === blank.correctAnswer.trim().toLowerCase();
    }
    return null;
  };

  const correctCount = activeSubmitted
    ? section.blanks.filter((b) => {
        const result = checkBlank(b);
        return result === true;
      }).length
    : 0;

  // Render passage with blank placeholders replaced by inputs
  const renderPassage = () => {
    let parts = section.text.split(/(\{\{[a-zA-Z0-9_-]+\}\})/g);
    return parts.map((part, i) => {
      const match = part.match(/^\{\{([a-zA-Z0-9_-]+)\}\}$/);
      if (!match) {
        return <span key={i}>{part}</span>;
      }
      const blankId = match[1];
      const blank = section.blanks.find((b) => b.id === blankId);
      if (!blank) {
        return <span key={i}>{part}</span>;
      }

      const isCorrect = checkBlank(blank);
      const isWrong = activeSubmitted && isCorrect === false;

      const inputBaseStyle: React.CSSProperties = {
        padding: '0.25rem 0.5rem',
        border: '2px solid var(--border-color)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        outline: 'none',
      };

      let inputStyle: React.CSSProperties = { ...inputBaseStyle };
      if (isCorrect) {
        inputStyle = {
          ...inputStyle,
          borderColor: 'var(--success)',
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success-text)',
        };
      }
      if (isWrong) {
        inputStyle = {
          ...inputStyle,
          borderColor: 'var(--error)',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
        };
      }

      return (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.125rem', position: 'relative' }}>
          {blank.options ? (
            <select
              style={inputStyle}
              value={answers[blankId] || ''}
              onChange={(e) => handleAnswerChange(blankId, e.target.value)}
              disabled={activeSubmitted || showAnswer}
            >
              <option value="">...</option>
              {blank.options.map((opt, oi) => (
                <option key={oi} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              maxLength={100}
              style={inputStyle}
              value={answers[blankId] || ''}
              onChange={(e) => handleAnswerChange(blankId, e.target.value)}
              disabled={activeSubmitted || showAnswer}
              placeholder="..."
              size={12}
            />
          )}
          {activeSubmitted && (
            <span style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: isCorrect ? 'var(--success-text)' : 'var(--error-text)',
              marginLeft: '2px',
              userSelect: 'none',
            }}
            title={isCorrect ? 'Correct' : 'Incorrect'}>
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
          {state.learningMode !== 'exam' && (
            <button
              onClick={() => toggleHint(blankId)}
              title="Show hint"
              aria-label="Show hint"
              style={{
                padding: '0.35rem 0.35rem',
                border: '2px solid var(--warning-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--warning-bg)',
                color: 'var(--warning-text)',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1.2,
                transition: 'var(--transition-fast)',
              }}
            >
              💡
            </button>
          )}
          {hints[blankId] && blank.hint && (
            <span style={{
              position: 'absolute',
              bottom: '125%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              width: 'max-content',
              maxWidth: '200px',
              whiteSpace: 'normal',
              fontSize: '0.8rem',
              color: 'var(--warning-text)',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              boxShadow: 'var(--shadow-md)',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}>{blank.hint}</span>
          )}
        </span>
      );
    });
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
          Score: {correctCount} / {section.blanks.length}
        </div>
      )}

      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        lineHeight: 2,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        {renderPassage()}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleSubmit}
          disabled={activeSubmitted || showAnswer}
          className="btn-base"
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: (activeSubmitted || showAnswer) ? 'var(--bg-tertiary)' : (confirming ? 'var(--warning)' : 'var(--accent)'),
            color: (activeSubmitted || showAnswer) ? 'var(--text-muted)' : '#fff',
            cursor: (activeSubmitted || showAnswer) ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)',
          }}
        >
          {isExamMode ? (isSavedText ? 'Answers Saved ✓' : 'Save Answers') : (confirming ? 'Confirm Submit?' : 'Submit')}
        </button>
        {state.learningMode !== 'exam' && (
          <>
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
              Reset
            </button>
            <button
              onClick={handleShowAnswer}
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
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
