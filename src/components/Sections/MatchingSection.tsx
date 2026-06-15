import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { MatchingSection as MatchingSectionType } from '../../types/schema';
import { renderMarkdown } from '../../utils/renderContent';
import { shuffle } from '../../utils/shuffle';
import { useAppContext } from '../../context/AppContext';

interface MatchingSectionProps {
  section: MatchingSectionType;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function MatchingSection({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: MatchingSectionProps) {
  const { state, saveSectionAnswers, addToast } = useAppContext();
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isSavedText, setIsSavedText] = useState(false);

  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const isExamMode = state.learningMode === 'exam';
  const isExamSubmitted = isExamMode && !!state.examSubmittedPages[state.currentPageIndex];
  const activeSubmitted = isExamMode ? isExamSubmitted : submitted;

  // Load saved answers and layout
  useEffect(() => {
    const saved = state.sectionAnswers[state.currentPageIndex]?.[sectionIndex];
    if (saved) {
      setMatches(saved.matches || {});
      setShuffledRight(saved.shuffledRight || shuffle(section.pairs.map(p => p.right)));
    } else {
      setMatches({});
      const freshShuffled = shuffle(section.pairs.map(p => p.right));
      setShuffledRight(freshShuffled);
      if (isExamMode) {
        saveSectionAnswers(state.currentPageIndex, sectionIndex, { matches: {}, shuffledRight: freshShuffled });
      }
    }
    if (!isExamMode) {
      setSubmitted(false);
    }
  }, [state.currentPageIndex, sectionIndex, isExamMode, state.sectionAnswers]);

  const saveAndSetMatches = useCallback((newMatches: Record<number, number>) => {
    setMatches(newMatches);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, { matches: newMatches, shuffledRight });
  }, [state.currentPageIndex, sectionIndex, shuffledRight, saveSectionAnswers]);

  const handleLeftClick = useCallback(
    (leftIdx: number) => {
      if (activeSubmitted || showAnswer) return;
      setSelectedLeft(leftIdx);
      if (selectedRight !== null) {
        const newMatches = { ...matches, [leftIdx]: selectedRight };
        saveAndSetMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
      }
    },
    [activeSubmitted, showAnswer, selectedRight, matches, saveAndSetMatches]
  );

  const handleRightClick = useCallback(
    (rightIdx: number) => {
      if (activeSubmitted || showAnswer) return;
      setSelectedRight(rightIdx);
      if (selectedLeft !== null) {
        const newMatches = { ...matches, [selectedLeft]: rightIdx };
        saveAndSetMatches(newMatches);
        setSelectedLeft(null);
        setSelectedRight(null);
      }
    },
    [activeSubmitted, showAnswer, selectedLeft, matches, saveAndSetMatches]
  );

  const runGrading = useCallback(() => {
    setSubmitted(true);
    setConfirming(false);
    if (onGraded) {
      let correct = 0;
      Object.entries(matches).forEach(([leftIdxStr, rightIdx]) => {
        const leftIdx = Number(leftIdxStr);
        if (section.pairs[leftIdx].right === shuffledRight[rightIdx]) {
          correct++;
        }
      });
      onGraded(correct, section.pairs.length);
    }
  }, [matches, section.pairs, shuffledRight, onGraded]);

  useEffect(() => {
    if (forceSubmit && !submitted && !isExamMode) {
      runGrading();
    }
  }, [forceSubmit, submitted, runGrading, isExamMode]);

  const handleSubmit = useCallback(() => {
    const allMatched = Object.keys(matches).length === section.pairs.length;
    if (!allMatched) {
      alert("Please match all pairs before submitting.");
      return;
    }
    if (isExamMode) {
      saveSectionAnswers(state.currentPageIndex, sectionIndex, { matches, shuffledRight });
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
  }, [state.learningMode, isExamMode, confirming, runGrading, matches, section.pairs.length, shuffledRight, saveSectionAnswers, state.currentPageIndex, sectionIndex, addToast]);

  const handleReset = useCallback(() => {
    const freshShuffled = shuffle(section.pairs.map(p => p.right));
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setSubmitted(false);
    setConfirming(false);
    setShowAnswer(false);
    setShuffledRight(freshShuffled);
    saveSectionAnswers(state.currentPageIndex, sectionIndex, { matches: {}, shuffledRight: freshShuffled });
  }, [section.pairs, state.currentPageIndex, sectionIndex, saveSectionAnswers]);

  const prevMatchesRef = useRef<Record<number, number>>({});

  const handleShowAnswer = useCallback(() => {
    if (!showAnswer) {
      // Saving current matches before showing answer
      prevMatchesRef.current = { ...matches };
      const correctMatches: Record<number, number> = {};
      section.pairs.forEach((_, i) => {
        const correctRight = section.pairs[i].right;
        const rightIdx = shuffledRight.findIndex((r) => r === correctRight);
        correctMatches[i] = rightIdx;
      });
      setMatches(correctMatches);
    } else {
      // Restore previous matches
      setMatches(prevMatchesRef.current);
    }
    setShowAnswer(!showAnswer);
  }, [showAnswer, section.pairs, shuffledRight, matches]);

  // Calculate connection lines
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; correct: boolean }[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (Object.keys(matches).length === 0) {
      setLines([]);
      return;
    }
    const container = leftRefs.current[0]?.parentElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const newLines: { x1: number; y1: number; x2: number; y2: number; correct: boolean }[] = [];
    Object.entries(matches).forEach(([leftIdxStr, rightIdx]) => {
      const leftIdx = Number(leftIdxStr);
      const leftEl = leftRefs.current[leftIdx];
      const rightEl = rightRefs.current[rightIdx];
      if (!leftEl || !rightEl) return;

      const leftRect = leftEl.getBoundingClientRect();
      const rightRect = rightEl.getBoundingClientRect();

      const isCorrect = section.pairs[leftIdx].right === shuffledRight[rightIdx];

      newLines.push({
        x1: leftRect.right - containerRect.left,
        y1: leftRect.top + leftRect.height / 2 - containerRect.top,
        x2: rightRect.left - containerRect.left,
        y2: rightRect.top + rightRect.height / 2 - containerRect.top,
        correct: isCorrect,
      });
    });

    setLines(newLines);
    setSvgSize({ width: containerRect.width, height: containerRect.height });
  }, [matches, section.pairs, shuffledRight]);

  const allMatched = Object.keys(matches).length === section.pairs.length;

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
          {lines.filter((l) => l.correct).length} / {section.pairs.length} correct
        </div>
      )}

      <div style={{
        position: 'relative',
        display: 'flex',
        gap: '2rem',
        justifyContent: 'space-between',
      }}>
        {/* SVG connection lines */}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          width={svgSize.width}
          height={svgSize.height}
        >
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
stroke={activeSubmitted ? (line.correct ? 'var(--success)' : 'var(--error)') : 'var(--accent)'}
              strokeWidth={2}
              strokeDasharray={activeSubmitted && line.correct ? 'none' : '4'}
            />
          ))}
        </svg>

        {/* Left column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {section.pairs.map((pair, i) => {
            const isSelected = selectedLeft === i;
            const isMatched = matches[i] !== undefined;
            const isCorrect = activeSubmitted && isMatched && section.pairs[i].right === shuffledRight[matches[i]];
            const isWrong = activeSubmitted && isMatched && !isCorrect;

            return (
              <div
                key={i}
                ref={(el) => { leftRefs.current[i] = el; }}
                onClick={() => handleLeftClick(i)}
                className={`matching-option ${activeSubmitted ? 'submitted' : ''}`}
                style={{
                  padding: '0.75rem',
                  backgroundColor: isSelected ? 'var(--accent-light)' : isCorrect ? 'rgba(16, 185, 129, 0.1)' : isWrong ? 'rgba(239, 68, 68, 0.1)' : isMatched ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : isMatched ? 'var(--border-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: activeSubmitted ? 'default' : 'pointer',
                  transition: 'var(--transition-fast)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(pair.left) }} />
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {shuffledRight.map((right, i) => {
            const matchedLeft = Object.entries(matches).find(([, v]) => v === i)?.[0];
            const isSelected = selectedRight === i;
            const isCorrect = activeSubmitted && matchedLeft !== undefined && section.pairs[Number(matchedLeft)].right === right;
            const isWrong = activeSubmitted && matchedLeft !== undefined && !isCorrect;

            return (
              <div
                key={i}
                ref={(el) => { rightRefs.current[i] = el; }}
                onClick={() => handleRightClick(i)}
                className={`matching-option ${activeSubmitted ? 'submitted' : ''}`}
                style={{
                  padding: '0.75rem',
                  backgroundColor: isSelected ? 'var(--accent-light)' : isCorrect ? 'rgba(16, 185, 129, 0.1)' : isWrong ? 'rgba(239, 68, 68, 0.1)' : matchedLeft !== undefined ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : isCorrect ? 'var(--success)' : isWrong ? 'var(--error)' : matchedLeft !== undefined ? 'var(--border-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: activeSubmitted ? 'default' : 'pointer',
                  transition: 'var(--transition-fast)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(right) }} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
      }}>
        <button
          onClick={handleSubmit}
          disabled={!allMatched || activeSubmitted}
          className="btn-base"
          style={{
            padding: '0.5rem 1.25rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: (!allMatched || activeSubmitted) ? 'var(--bg-tertiary)' : (confirming ? 'var(--warning)' : 'var(--accent)'),
            color: (!allMatched || activeSubmitted) ? 'var(--text-muted)' : '#fff',
            cursor: (!allMatched || activeSubmitted) ? 'not-allowed' : 'pointer',
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
