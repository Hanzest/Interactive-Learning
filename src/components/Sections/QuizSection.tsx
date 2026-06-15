import React, { useState, useCallback, useEffect } from 'react';
import type { QuizSection as QuizSectionType, QuizAttempt } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { renderMarkdown } from '../../utils/renderContent';

interface QuizSectionProps {
  section: QuizSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function QuizSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: QuizSectionProps) {
  const { state, recordQuizScore, saveSectionAnswers, addToast } = useAppContext();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);

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

  const runGrading = useCallback(() => {
    let correct = 0;
    section.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    setSubmitted(true);
    setConfirming(false);
    recordQuizScore(state.currentPageIndex, sectionIndex, correct, section.questions.length);
    if (onGraded) {
      onGraded(correct, section.questions.length);
    }
  }, [answers, section.questions, recordQuizScore, state.currentPageIndex, sectionIndex, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  useEffect(() => {
    setConfirming(false);
  }, [currentQ]);

  const pageMeta = state.pages[state.currentPageIndex]?._meta;
  const quizAttempts: QuizAttempt[] = pageMeta?.quizAttempts?.[sectionIndex] || [];
  const prevAttempts = quizAttempts.length;

  const totalQuestions = section.questions.length;

  const handleSelect = useCallback(
    (questionIndex: number, optionIndex: number) => {
      if (activeSubmitted) return;
      const newAnswers = { ...answers, [questionIndex]: optionIndex };
      setAnswers(newAnswers);
      saveSectionAnswers(state.currentPageIndex, sectionIndex, newAnswers);
    },
    [activeSubmitted, answers, saveSectionAnswers, state.currentPageIndex, sectionIndex]
  );

  const handleSubmit = useCallback(() => {
    const answeredAll = section.questions.every((_, i) => answers[i] !== undefined);
    if (!answeredAll) {
      alert("Please answer all questions before submitting.");
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
  }, [state.learningMode, isExamMode, confirming, runGrading, section.questions, answers, saveSectionAnswers, state.currentPageIndex, sectionIndex, addToast]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setConfirming(false);
    setAttempt((p) => p + 1);
    setCurrentQ(0);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, {});
  }, [state.currentPageIndex, sectionIndex, saveSectionAnswers]);

  const correctCount = activeSubmitted
    ? section.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;
  const progressPercent = activeSubmitted
    ? 100
    : (Object.keys(answers).length / section.questions.length) * 100;

  const current = section.questions[currentQ];
  if (!current) {
    return <div style={{
      padding: '1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      marginBottom: '1.5rem',
      color: 'var(--text-muted)',
    }}>No questions available.</div>;
  }

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

      {/* Score display after submit */}
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
          Score: {correctCount} / {section.questions.length}
          {prevAttempts > 0 && (
            <span style={{ marginLeft: '0.5rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              (Attempts: {prevAttempts})
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
          borderRadius: '3px',
          transition: 'var(--transition-normal)',
        }} />
      </div>

      {/* Question Navigator */}
      <div style={{
        display: 'flex',
        gap: '0.375rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        justifyContent: 'center',
      }}>
        {section.questions.map((_, qi) => {
          const isActive = qi === currentQ;
          const isAnswered = answers[qi] !== undefined;
          let boxBg = 'var(--bg-tertiary)';
          let boxBorder = 'var(--border-color)';
          let boxColor = 'var(--text-primary)';

          if (activeSubmitted) {
            const qCorrect = answers[qi] === section.questions[qi].correctIndex;
            if (qCorrect) {
              boxBg = 'var(--success-bg)';
              boxBorder = 'var(--success-border)';
              boxColor = 'var(--success-text)';
            } else if (isAnswered) {
              boxBg = 'var(--error-bg)';
              boxBorder = 'var(--error-border)';
              boxColor = 'var(--error-text)';
            }
          } else if (isAnswered) {
            boxBg = 'var(--accent-light)';
            boxBorder = 'var(--accent)';
          }

          return (
            <button
              key={qi}
              onClick={() => setCurrentQ(qi)}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '6px',
                border: `2px solid ${isActive ? 'var(--accent)' : boxBorder}`,
                backgroundColor: boxBg,
                color: boxColor,
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
              title={`Go to question ${qi + 1}`}
            >
              {qi + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          marginBottom: '0.5rem',
        }}>
          Question {currentQ + 1} of {totalQuestions}
        </div>
        <p style={{
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '1.05rem',
          marginBottom: '1rem',
          lineHeight: 1.5,
        }}>{current.question}</p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {current.options.map((opt, oi) => {
            const isSelected = answers[currentQ] === oi;
            const isCorrectAnswer = submitted && current.correctIndex === oi;
            const isWrongSelection = submitted && isSelected && current.correctIndex !== oi;
            let borderColor = 'var(--border-color)';
            let bgColor = 'transparent';
            if (submitted) {
              if (isCorrectAnswer) { borderColor = 'var(--success)'; bgColor = 'rgba(16, 185, 129, 0.08)'; }
              else if (isWrongSelection) { borderColor = 'var(--error)'; bgColor = 'rgba(239, 68, 68, 0.08)'; }
            } else if (isSelected) {
              borderColor = 'var(--accent)'; bgColor = 'var(--accent-light)';
            }

            // Custom radio indicator styling
            let radioBorderColor = 'var(--border-color)';
            const radioBgColor = 'var(--bg-primary)';
            let radioDotColor = 'var(--accent)';

            if (submitted) {
              if (isCorrectAnswer) {
                radioBorderColor = 'var(--success)';
                radioDotColor = 'var(--success)';
              } else if (isWrongSelection) {
                radioBorderColor = 'var(--error)';
                radioDotColor = 'var(--error)';
              }
            } else if (isSelected) {
              radioBorderColor = 'var(--accent)';
              radioDotColor = 'var(--accent)';
            }

            return (
              <label
                key={oi}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.625rem 0.75rem',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  backgroundColor: bgColor,
                  cursor: submitted ? 'default' : 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                <input
                  type="radio"
                  name={`quiz-${attempt}-${currentQ}`}
                  value={oi}
                  checked={isSelected}
                  onChange={() => handleSelect(currentQ, oi)}
                  disabled={submitted}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                />

                {/* Custom radio button */}
                <div style={{
                  width: '1.125rem',
                  height: '1.125rem',
                  borderRadius: '50%',
                  border: `2px solid ${radioBorderColor}`,
                  backgroundColor: radioBgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.1875rem',
                  transition: 'var(--transition-fast)',
                }}>
                  {isSelected && (
                    <div style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '50%',
                      backgroundColor: radioDotColor,
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}>{opt}</span>
                  {activeSubmitted && current.optionExplanations?.[oi] && (
                    <span style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginTop: '0.25rem',
                    }}>
                      {current.optionExplanations[oi]}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Global Explanation Box */}
      {activeSubmitted && current.explanation && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginTop: '1rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            fontWeight: 600,
            color: 'var(--success-text)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.9rem',
          }}>
            <span>💡 Explanation</span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{current.explanation}</p>
        </div>
      )}

      {/* Navigation + Submit/Reset on the same line */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
          disabled={currentQ === 0}
          data-nav-prev="quiz"
          className="btn-base"
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            color: currentQ === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
            cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)',
          }}
        >
          ◀ Prev
        </button>

        {!activeSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < section.questions.length}
            className="btn-base"
            style={{
              padding: '0.5rem 1.25rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: (Object.keys(answers).length < section.questions.length) ? 'var(--bg-tertiary)' : (confirming ? 'var(--warning)' : 'var(--accent)'),
              color: (Object.keys(answers).length < section.questions.length) ? 'var(--text-muted)' : '#fff',
              cursor: (Object.keys(answers).length < section.questions.length) ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'var(--transition-fast)',
            }}
          >
            {isExamMode ? (isSavedText ? 'Answers Saved ✓' : 'Save Answers') : (confirming ? 'Confirm Submit?' : 'Submit')}
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
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'var(--transition-fast)',
              }}
            >
              Reset
            </button>
          )
        )}

        <button
          onClick={() => setCurrentQ((p) => Math.min(totalQuestions - 1, p + 1))}
          disabled={currentQ === totalQuestions - 1}
          data-nav-next="quiz"
          className="btn-base"
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-secondary)',
            color: currentQ === totalQuestions - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
            cursor: currentQ === totalQuestions - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)',
          }}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
