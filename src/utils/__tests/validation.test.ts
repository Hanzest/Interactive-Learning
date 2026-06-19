import { describe, it, expect } from 'vitest';
import { validateLearningPage } from '../validation';

describe('validateLearningPage', () => {
  it('should validate a correct full learning page object', () => {
    const validData = {
      page: {
        title: 'Introduction to Testing',
        description: 'Learn how to write automated tests.',
        tags: ['testing', 'qa', 'vite'],
        icon: '🧪'
      },
      learn: [
        {
          type: 'text',
          title: 'Welcome',
          content: 'This is a text section.'
        },
        {
          type: 'tabs',
          title: 'Overview Tabs',
          tabs: [
            { label: 'Tab 1', content: 'Content 1' },
            { label: 'Tab 2', content: 'Content 2' }
          ]
        },
        {
          type: 'accordion',
          title: 'Accordion Section',
          accordionBehavior: 'exclusive',
          items: [
            { heading: 'Heading 1', content: 'Content 1' }
          ]
        },
        {
          type: 'timeline',
          title: 'History Timeline',
          layout: 'horizontal',
          items: [
            { date: '2026', title: 'Start', description: 'Began study.' }
          ]
        },
        {
          type: 'flashcards',
          title: 'Flashcards',
          cards: [
            { front: 'Q1', back: 'A1' }
          ]
        }
      ],
      practice: [
        {
          type: 'quiz',
          title: 'Mini Quiz',
          questions: [
            { question: 'Q1?', options: ['A', 'B'], correctIndex: 0, Explanation: 'Exp' },
            { question: 'Q2?', options: ['A', 'B'], correctIndex: 0, Explanation: 'Exp' },
            { question: 'Q3?', options: ['A', 'B'], correctIndex: 0, Explanation: 'Exp' },
            { question: 'Q4?', options: ['A', 'B'], correctIndex: 0, Explanation: 'Exp' },
            { question: 'Q5?', options: ['A', 'B'], correctIndex: 0, Explanation: 'Exp' }
          ]
        },
        {
          type: 'fill-blank',
          title: 'Fill in Blank',
          instantFeedback: true,
          sentences: [
            { text: 'Vite is a ___ build tool.', answer: 'frontend' },
            { text: 'React is a ___ library.', answer: 'ui' },
            { text: 'TypeScript is a ___ typed language.', answer: 'strongly' },
            { text: 'HTML is a ___ language.', answer: 'markup' },
            { text: 'JS is a ___ language.', answer: 'scripting' }
          ]
        }
      ],
      exam: [
        {
          type: 'matching',
          title: 'Matching Pairs',
          pairs: [
            { left: 'A', right: 'Apple' },
            { left: 'B', right: 'Banana' },
            { left: 'C', right: 'Cherry' },
            { left: 'D', right: 'Date' },
            { left: 'E', right: 'Elderberry' }
          ]
        },
        {
          type: 'sorting',
          title: 'Sorting Steps',
          items: [
            { text: 'Step 1', correctOrder: 0 },
            { text: 'Step 2', correctOrder: 1 },
            { text: 'Step 3', correctOrder: 2 },
            { text: 'Step 4', correctOrder: 3 },
            { text: 'Step 5', correctOrder: 4 }
          ]
        },
        {
          type: 'checklist',
          title: 'Checklist Item',
          items: [
            { text: 'Task 1', optional: false },
            { text: 'Task 2', optional: true }
          ]
        },
        {
          type: 'cloze',
          title: 'Cloze Deletion',
          text: 'Vite is a {{tool1}}, React is a {{tool2}}, TypeScript has {{tool3}}, HTML has {{tool4}}, CSS has {{tool5}}.',
          blanks: [
            { id: 'tool1', options: ['tool', 'library'], correctIndex: 0, correctAnswer: 'tool', hint: 'build tool' },
            { id: 'tool2', options: ['tool', 'library'], correctIndex: 1, correctAnswer: 'library', hint: 'ui library' },
            { id: 'tool3', options: ['types', 'none'], correctIndex: 0, correctAnswer: 'types', hint: 'strongly typed' },
            { id: 'tool4', options: ['tags', 'none'], correctIndex: 0, correctAnswer: 'tags', hint: 'markup language' },
            { id: 'tool5', options: ['styles', 'none'], correctIndex: 0, correctAnswer: 'styles', hint: 'cascading style sheets' }
          ]
        }
      ]
    };

    const result = validateLearningPage(validData);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  describe('root object checks', () => {
    it('should reject non-object root', () => {
      expect(validateLearningPage(null).valid).toBe(false);
      expect(validateLearningPage('not an object').valid).toBe(false);
      expect(validateLearningPage([]).valid).toBe(false);
    });

    it('should reject object with missing page, learn, practice, or exam', () => {
      const result = validateLearningPage({});
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Root object must contain');
    });
  });

  describe('page metadata checks', () => {
    const baseValid = { learn: [], practice: [], exam: [] };

    it('should reject non-object page property', () => {
      const result = validateLearningPage({ ...baseValid, page: 'not-an-obj' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page" property must be an object');
    });

    it('should reject non-string page title', () => {
      const result = validateLearningPage({ ...baseValid, page: { title: 123 } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.title" must be a string');
    });

    it('should reject non-string page description', () => {
      const result = validateLearningPage({ ...baseValid, page: { description: true } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.description" must be a string');
    });

    it('should reject non-array page tags', () => {
      const result = validateLearningPage({ ...baseValid, page: { tags: 'not-an-array' } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.tags" must be an array of strings');
    });

    it('should reject non-string page tag item', () => {
      const result = validateLearningPage({ ...baseValid, page: { tags: ['valid', 123] } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.tags[1]" must be a string');
    });

    it('should reject non-string page icon', () => {
      const result = validateLearningPage({ ...baseValid, page: { icon: {} } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.icon" must be a string');
    });
  });

  describe('learn array checks', () => {
    const baseValid = { page: { title: 'T' }, practice: [], exam: [] };

    it('should reject non-array learn property', () => {
      const result = validateLearningPage({ ...baseValid, learn: 'not-an-array' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn" property must be an array');
    });

    it('should reject non-object section item', () => {
      const result = validateLearningPage({ ...baseValid, learn: ['not-an-obj'] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0]" must be an object');
    });

    it('should reject invalid section type', () => {
      const result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'unknown-type', title: 'Intro' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0].type" must be one of:');
    });

    it('should reject missing or empty section title', () => {
      const result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'text', title: '   ', content: 'hello' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0].title" is required');
    });
  });

  describe('type-specific section checks', () => {
    const baseValid = { page: { title: 'T' }, practice: [], exam: [] };

    it('should validate text section properties', () => {
      const result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'text', title: 'T', content: 123 }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0].content" must be a string');
    });

    it('should validate tabs section properties', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'tabs', title: 'T', tabs: 'not-array' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0].tabs" must be an array');

      result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'tabs', title: 'T', tabs: [{ label: '', content: 'C' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"learn[0].tabs[0].label" must be a non-empty string');
    });

    it('should validate accordion section properties', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'accordion', title: 'T', items: [], accordionBehavior: 'invalid' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('accordionBehavior');

      result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'accordion', title: 'T', items: [{ heading: 'H' }] }] // missing content
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('content');
    });

    it('should validate timeline section properties', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'timeline', title: 'T', items: [], layout: 'invalid' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('layout');

      result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'timeline', title: 'T', items: [{ date: 'D', title: 'T', description: 123 }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('description');
    });

    it('should validate flashcards section properties', () => {
      const result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'flashcards', title: 'T', cards: [{ front: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('front');
    });

    it('should validate quiz section properties and reject less than 5 questions', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'quiz', title: 'T', questions: [{ question: 'Q', options: [] }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('questions" must contain at least 5 questions');

      result = validateLearningPage({
        ...baseValid,
        learn: [{
          type: 'quiz',
          title: 'T',
          questions: [
            { question: 'Q1', options: ['A', 'B'], correctIndex: 0 },
            { question: 'Q2', options: ['A', 'B'], correctIndex: 0 },
            { question: 'Q3', options: ['A', 'B'], correctIndex: 0 },
            { question: 'Q4', options: ['A', 'B'], correctIndex: 0 },
            { question: 'Q5', options: ['A', 'B'], correctIndex: 5 }
          ]
        }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('correctIndex" must be a valid integer index');
    });

    it('should validate fill-blank section properties and reject less than 5 sentences', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'fill-blank', title: 'T', sentences: [{ text: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('sentences" must contain at least 5 sentences');

      result = validateLearningPage({
        ...baseValid,
        learn: [{
          type: 'fill-blank',
          title: 'T',
          sentences: [
            { text: 'A ___', answer: 'a' },
            { text: 'B ___', answer: 'b' },
            { text: 'C ___', answer: 'c' },
            { text: 'D ___', answer: 123 },
            { text: 'E ___', answer: 'e' }
          ]
        }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('answer');
    });

    it('should validate matching section properties and reject less than 5 pairs', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'matching', title: 'T', pairs: [{ left: 'L', right: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pairs" must contain at least 5 matching pairs');
    });

    it('should validate sorting section properties and reject less than 5 items', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'sorting', title: 'T', items: [{ text: 'Step', correctOrder: 'first' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('items" must contain at least 5 items to sort');
    });

    it('should validate cloze section properties and reject less than 5 blanks', () => {
      let result = validateLearningPage({
        ...baseValid,
        learn: [{ type: 'cloze', title: 'T', text: 'This is {{blank1}}.', blanks: [] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('blanks" must contain at least 5 cloze blanks');
    });
  });
});
