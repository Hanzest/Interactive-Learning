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
      sections: [
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
        },
        {
          type: 'quiz',
          title: 'Mini Quiz',
          questions: [
            {
              question: 'What is 1+1?',
              options: ['1', '2', '3'],
              correctIndex: 1,
              explanation: '1+1 is 2',
              optionExplanations: ['Incorrect', 'Correct!', 'Incorrect']
            }
          ]
        },
        {
          type: 'fill-blank',
          title: 'Fill in Blank',
          instantFeedback: true,
          sentences: [
            { text: 'Vite is a ___ build tool.', answer: 'frontend' }
          ]
        },
        {
          type: 'matching',
          title: 'Matching Pairs',
          pairs: [
            { left: 'A', right: 'Apple' }
          ]
        },
        {
          type: 'sorting',
          title: 'Sorting Steps',
          items: [
            { text: 'Step 1', correctOrder: 0 },
            { text: 'Step 2', correctOrder: 1 }
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
          text: 'Vite is a {{tool}}.',
          blanks: [
            {
              id: 'tool',
              options: ['tool', 'library'],
              correctIndex: 0,
              correctAnswer: 'tool',
              hint: 'A dev build helper.'
            }
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

    it('should reject object with missing page, sections, and test', () => {
      const result = validateLearningPage({});
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must contain "page", "sections", or "test"');
    });
  });

  describe('page metadata checks', () => {
    it('should reject non-object page property', () => {
      const result = validateLearningPage({ page: 'not-an-obj' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page" property must be an object');
    });

    it('should reject non-string page title', () => {
      const result = validateLearningPage({ page: { title: 123 } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.title" must be a string');
    });

    it('should reject non-string page description', () => {
      const result = validateLearningPage({ page: { description: true } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.description" must be a string');
    });

    it('should reject non-array page tags', () => {
      const result = validateLearningPage({ page: { tags: 'not-an-array' } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.tags" must be an array of strings');
    });

    it('should reject non-string page tag item', () => {
      const result = validateLearningPage({ page: { tags: ['valid', 123] } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.tags[1]" must be a string');
    });

    it('should reject non-string page icon', () => {
      const result = validateLearningPage({ page: { icon: {} } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"page.icon" must be a string');
    });
  });

  describe('sections general checks', () => {
    it('should reject non-array sections property', () => {
      const result = validateLearningPage({ sections: 'not-an-array' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections" property must be an array');
    });

    it('should reject non-object section item', () => {
      const result = validateLearningPage({ sections: ['not-an-obj'] });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0]" must be an object');
    });

    it('should reject invalid section type', () => {
      const result = validateLearningPage({
        sections: [{ type: 'unknown-type', title: 'Intro' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0].type" must be one of:');
    });

    it('should reject missing or empty section title', () => {
      const result = validateLearningPage({
        sections: [{ type: 'text', title: '   ', content: 'hello' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0].title" is required');
    });
  });

  describe('type-specific section checks', () => {
    it('should validate text section properties', () => {
      const result = validateLearningPage({
        sections: [{ type: 'text', title: 'T', content: 123 }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0].content" must be a string');
    });

    it('should validate tabs section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'tabs', title: 'T', tabs: 'not-array' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0].tabs" must be an array');

      result = validateLearningPage({
        sections: [{ type: 'tabs', title: 'T', tabs: [{ label: '', content: 'C' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"sections[0].tabs[0].label" must be a non-empty string');
    });

    it('should validate accordion section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'accordion', title: 'T', items: [], accordionBehavior: 'invalid' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('accordionBehavior');

      result = validateLearningPage({
        sections: [{ type: 'accordion', title: 'T', items: [{ heading: 'H' }] }] // missing content
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('content');
    });

    it('should validate timeline section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'timeline', title: 'T', items: [], layout: 'invalid' }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('layout');

      result = validateLearningPage({
        sections: [{ type: 'timeline', title: 'T', items: [{ date: 'D', title: 'T', description: 123 }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('description');
    });

    it('should validate flashcards section properties', () => {
      const result = validateLearningPage({
        sections: [{ type: 'flashcards', title: 'T', cards: [{ front: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('front');
    });

    it('should validate quiz section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'quiz', title: 'T', questions: [{ question: 'Q', options: [] }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('options');

      result = validateLearningPage({
        sections: [{ type: 'quiz', title: 'T', questions: [{ question: 'Q', options: ['A', 'B'], correctIndex: 5 }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('correctIndex');

      result = validateLearningPage({
        sections: [{ type: 'quiz', title: 'T', questions: [{ question: 'Q', options: ['A'], optionExplanations: ['E1', 'E2'] }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('optionExplanations" length must match options length');
    });

    it('should validate fill-blank section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'fill-blank', title: 'T', sentences: [{ text: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('text');

      result = validateLearningPage({
        sections: [{ type: 'fill-blank', title: 'T', sentences: [{ text: 'T', answer: 123 }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('answer');
    });

    it('should validate matching section properties', () => {
      const result = validateLearningPage({
        sections: [{ type: 'matching', title: 'T', pairs: [{ left: 'L', right: '' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('right');
    });

    it('should validate sorting section properties', () => {
      const result = validateLearningPage({
        sections: [{ type: 'sorting', title: 'T', items: [{ text: 'Step', correctOrder: 'first' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('correctOrder');
    });

    it('should validate checklist section properties', () => {
      const result = validateLearningPage({
        sections: [{ type: 'checklist', title: 'T', items: [{ text: 'Task', optional: 'yes' }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('optional');
    });

    it('should validate cloze section properties', () => {
      let result = validateLearningPage({
        sections: [{ type: 'cloze', title: 'T', text: '', blanks: [] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('text');

      result = validateLearningPage({
        sections: [{ type: 'cloze', title: 'T', text: 'Sentence', blanks: [{ id: '1', options: ['A'], correctIndex: 1 }] }]
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('correctIndex');
    });
  });

  describe('test object checks', () => {
    it('should reject non-object test property', () => {
      const result = validateLearningPage({ test: 'not-an-obj' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"test" property must be an object');
    });

    it('should reject non-string test title', () => {
      const result = validateLearningPage({ test: { title: 123 } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"test.title" must be a string');
    });

    it('should reject non-array test subsections', () => {
      const result = validateLearningPage({ test: { subsections: 'not-an-array' } });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"test.subsections" must be an array');
    });

    it('should reject invalid section inside test subsections', () => {
      const result = validateLearningPage({
        test: {
          subsections: [
            { type: 'invalid-type', title: 'Invalid' }
          ]
        }
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('"test.subsections[0].type" must be one of');
    });

    it('should validate a correct test subsections structure', () => {
      const result = validateLearningPage({
        test: {
          title: 'Exam 1',
          subsections: [
            {
              type: 'text',
              title: 'Welcome',
              content: 'Instructions go here.'
            }
          ]
        }
      });
      expect(result.valid).toBe(true);
    });
  });
});
