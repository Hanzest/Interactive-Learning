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
  pageIndex: number,
  sectionAnswers: Record<number, Record<number, any>>
): PageGradingResult {
  let totalCorrect = 0;
  let totalItems = 0;
  const sectionScores: SectionScore[] = [];

  if (!page || !page.sections) {
    return { correct: 0, total: 0, sectionScores };
  }

  page.sections.forEach((sec: any, secIdx: number) => {
    const saved = sectionAnswers[pageIndex]?.[secIdx];
    let secCorrect = 0;
    let secTotal = 0;
    const isGraded = ['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'].includes(sec.type);

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
