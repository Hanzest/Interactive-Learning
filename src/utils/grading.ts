/**
 * Shared utility to grade all interactive sections of a page based on global persisted answers.
 */
export interface SectionScore {
  correct: number;
  total: number;
}

export interface PageGradingResult {
  correct: number;
  total: number;
  sectionScores: SectionScore[];
}

export function gradePageSections(
  page: any,
  pageKey: string,
  sectionAnswers: Record<string, Record<string, any>>,
  mode: 'learn' | 'practice' | 'exam' = 'learn'
): PageGradingResult {
  let totalCorrect = 0;
  let totalItems = 0;
  const sectionScores: SectionScore[] = [];

  const targetSections = !page
    ? []
    : (mode === 'learn'
        ? (page.learn || [])
        : mode === 'practice'
        ? (page.practice || [])
        : (page.exam || []));

  if (!page || !targetSections) {
    return { correct: 0, total: 0, sectionScores };
  }

  targetSections.forEach((sec: any, secIdx: number) => {
    const saved = sectionAnswers[pageKey]?.[`${mode}_${secIdx}`] ?? sectionAnswers[pageKey]?.[secIdx];
    let secCorrect = 0;
    let secTotal = 0;
    const isGraded = sec.type === 'short-answer' && mode === 'exam'
      ? false
      : ['quiz', 'fill-blank', 'matching', 'sorting', 'cloze', 'true-false', 'short-answer', 'categorize'].includes(sec.type);

    if (sec.type === 'quiz') {
      const questions = sec.questions || [];
      secTotal = questions.length;
      if (saved !== undefined) {
        questions.forEach((q: any, qIdx: number) => {
          const ans = saved[qIdx];
          if (ans !== undefined) {
            if (q.multiSelect) {
              const userIndices = Array.isArray(ans) ? ans : [];
              const correctIndices = q.correctIndexes || [];
              const isCorrect =
                userIndices.length === correctIndices.length &&
                userIndices.every((val: number) => correctIndices.includes(val));
              if (isCorrect) secCorrect++;
            } else {
              if (ans === q.correctIndex) secCorrect++;
            }
          }
        });
      }
    } else if (sec.type === 'fill-blank') {
      const blanks = sec.sentences || [];
      secTotal = blanks.length;
      if (saved) {
        blanks.forEach((b: any, bIdx: number) => {
          const ans = saved[bIdx];
          if (ans !== undefined) {
            if (b.correctIndex !== undefined && b.options) {
              if (ans === b.options[b.correctIndex]) secCorrect++;
            } else if (b.correctAnswer) {
              if (ans.trim().toLowerCase() === b.correctAnswer.trim().toLowerCase()) secCorrect++;
            }
          }
        });
      }
    } else if (sec.type === 'matching') {
      secTotal = sec.pairs?.length || 0;
      if (saved && saved.matches && saved.shuffledRight) {
        const { matches, shuffledRight } = saved;
        Object.entries(matches).forEach(([leftIdxStr, rightIdx]) => {
          const leftIdx = Number(leftIdxStr);
          const rightVal = shuffledRight[Number(rightIdx)];
          if (sec.pairs[leftIdx]?.right === rightVal) {
            secCorrect++;
          }
        });
      }
    } else if (sec.type === 'sorting') {
      secTotal = sec.items?.length || 0;
      if (saved && Array.isArray(saved)) {
        saved.forEach((item: any, i: number) => {
          if (item.correctOrder === i + 1) {
            secCorrect++;
          }
        });
      }
    } else if (sec.type === 'cloze') {
      const blanks = sec.blanks || [];
      secTotal = blanks.length;
      if (saved) {
        blanks.forEach((b: any) => {
          const ans = saved[b.id];
          if (ans !== undefined) {
            if (b.correctIndex !== undefined && b.options) {
              if (ans === b.options[b.correctIndex]) {
                secCorrect++;
              }
            } else if (b.correctAnswer) {
              if (ans.trim().toLowerCase() === b.correctAnswer.trim().toLowerCase()) {
                secCorrect++;
              }
            }
          }
        });
      }
    } else if (sec.type === 'true-false') {
      const statements = sec.statements || [];
      secTotal = statements.length;
      if (saved) {
        statements.forEach((stmt: any, i: number) => {
          const ans = saved[i];
          if (ans !== undefined && ans === stmt.isTrue) {
            secCorrect++;
          }
        });
      }
    } else if (sec.type === 'short-answer') {
      const questions = sec.questions || [];
      secTotal = questions.length;
      const userAnswers = saved?.answers || {};
      questions.forEach((_: any, i: number) => {
        const ans = userAnswers[i];
        if (ans !== undefined && ans.trim().length > 0) {
          secCorrect++;
        }
      });
    } else if (sec.type === 'categorize') {
      const items = sec.items || [];
      secTotal = items.length;
      const userAssignments = saved?.assignments || {};
      items.forEach((item: any) => {
        const assignedCatId = userAssignments[item.id];
        if (assignedCatId !== undefined && assignedCatId === item.categoryId) {
          secCorrect++;
        }
      });
    }

    if (isGraded) {
      totalCorrect += secCorrect;
      totalItems += secTotal;
      sectionScores.push({ correct: secCorrect, total: secTotal });
    } else {
      sectionScores.push({ correct: 0, total: 0 });
    }
  });

  return { correct: totalCorrect, total: totalItems, sectionScores };
}
