import React, { useState, useCallback, useRef } from 'react';
import type { ClozeSection as ClozeSectionType } from '../../types/schema';
import { renderMarkdown } from '../../utils/renderContent';

interface ClozeSectionProps {
  section: ClozeSectionType;
}

export default function ClozeSection({ section }: ClozeSectionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const prevAnswersRef = useRef<Record<string, string>>({});

  const handleAnswerChange = useCallback(
    (blankId: string, value: string) => {
      if (submitted || showAnswer) return;
      setAnswers((prev) => ({ ...prev, [blankId]: value }));
    },
    [submitted, showAnswer]
  );

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleReset = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setHints({});
    setShowAnswer(false);
  }, []);

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
    if (!submitted) return null;
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

  const correctCount = submitted
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
      const isWrong = submitted && isCorrect === false;

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
              disabled={submitted || showAnswer}
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
              style={inputStyle}
              value={answers[blankId] || ''}
              onChange={(e) => handleAnswerChange(blankId, e.target.value)}
              disabled={submitted || showAnswer}
              placeholder="..."
              size={12}
            />
          )}
          {submitted && (
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

      {submitted && (
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
          disabled={submitted || showAnswer}
          className="btn-base"
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: (submitted || showAnswer) ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: (submitted || showAnswer) ? 'var(--text-muted)' : '#fff',
            cursor: (submitted || showAnswer) ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'var(--transition-fast)',
          }}
        >
          Submit
        </button>
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
      </div>
    </div>
  );
}
