import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { FillBlankSection as FillBlankSectionType } from '../../types/schema';
import { renderMarkdown } from '../../utils/renderContent';
import { useAppContext } from '../../context/AppContext';

interface FillBlankSectionProps {
  section: FillBlankSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function FillBlankSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: FillBlankSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hints, setHints] = useState<Record<number, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);
  const prevAnswersRef = useRef<Record<number, string>>({});

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

  const instantFeedback = section.instantFeedback ?? false;

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (showAnswer) return;
      if (activeSubmitted && !instantFeedback) return;
      const newAnswers = { ...answers, [index]: value };
      setAnswers(newAnswers);
      saveSectionAnswers(state.currentPageIndex, sectionIndex, newAnswers);
      if (instantFeedback) {
        setSubmitted(false);
      }
    },
    [activeSubmitted, instantFeedback, showAnswer, answers, saveSectionAnswers, state.currentPageIndex, sectionIndex]
  );

  const runGrading = useCallback(() => {
    setSubmitted(true);
    setConfirming(false);
    if (onGraded) {
      let correct = 0;
      section.sentences.forEach((s, i) => {
        if (answers[i]?.trim().toLowerCase() === s.answer.trim().toLowerCase()) correct++;
      });
      onGraded(correct, section.sentences.length);
    }
  }, [answers, section.sentences, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleCheck = useCallback(() => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < section.sentences.length) {
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
  }, [state.learningMode, isExamMode, confirming, runGrading, answers, section.sentences, saveSectionAnswers, state.currentPageIndex, sectionIndex, addToast]);

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
      const correctAnswers: Record<number, string> = {};
      section.sentences.forEach((s, idx) => {
        correctAnswers[idx] = s.answer;
      });
      setAnswers(correctAnswers);
    } else {
      setAnswers(prevAnswersRef.current);
    }
    setShowAnswer(!showAnswer);
  }, [showAnswer, section.sentences, answers]);

  const toggleHint = useCallback((index: number) => {
    setHints((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const correctCount = activeSubmitted
    ? section.sentences.filter((s, i) => answers[i]?.trim().toLowerCase() === s.answer.trim().toLowerCase()).length
    : 0;

  const renderSentence = (text: string, index: number) => {
    const isCorrect =
      activeSubmitted &&
      answers[index]?.trim().toLowerCase() === section.sentences[index].answer.trim().toLowerCase();
    const isWrong = activeSubmitted && answers[index] !== undefined && !isCorrect;

    const parts = text.split('___');
    return (
      <span key={index}>
        {parts.map((part, pi) => (
          <React.Fragment key={pi}>
            {part}
            {pi < parts.length - 1 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.125rem', position: 'relative' }}>
                <input
                  type="text"
                  style={{
                    padding: '0.25rem 0.5rem',
                    border: `2px solid ${isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    backgroundColor: isCorrect ? 'var(--success-bg)' : isWrong ? 'var(--error-bg)' : 'var(--bg-primary)',
                    color: isCorrect ? 'var(--success-text)' : isWrong ? 'var(--error-text)' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                  value={answers[index] || ''}
                  onChange={(e) => handleChange(index, e.target.value)}
                  disabled={(activeSubmitted && !instantFeedback) || showAnswer}
                  placeholder="..."
                />
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
                    onClick={() => toggleHint(index)}
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
                {hints[index] && (
                  <span style={{
                    position: 'absolute',
                    bottom: '125%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    width: 'max-content',
                    maxWidth: '220px',
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
                  }}>
                    Hint: starts with "{section.sentences[index].answer[0]}"
                  </span>
                )}
              </span>
            )}
          </React.Fragment>
        ))}
      </span>
    );
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
          Score: {correctCount} / {section.sentences.length}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {section.sentences.map((sentence, i) => (
          <div key={i} style={{
            padding: '0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            lineHeight: 2,
            color: 'var(--text-primary)',
          }}>
            {renderSentence(sentence.text, i)}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
      }}>
        <button
          onClick={handleCheck}
          disabled={
            activeSubmitted ||
            showAnswer ||
            Object.keys(answers).length < section.sentences.length
          }
          className="btn-base"
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: (activeSubmitted || showAnswer || Object.keys(answers).length < section.sentences.length) ? 'var(--bg-tertiary)' : (confirming ? 'var(--warning)' : 'var(--accent)'),
            color: (activeSubmitted || showAnswer || Object.keys(answers).length < section.sentences.length) ? 'var(--text-muted)' : '#fff',
            cursor: (activeSubmitted || showAnswer || Object.keys(answers).length < section.sentences.length) ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)',
          }}
        >
          {isExamMode ? (isSavedText ? 'Answers Saved ✓' : 'Save Answers') : (confirming ? 'Confirm Submit?' : 'Check Answers')}
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
