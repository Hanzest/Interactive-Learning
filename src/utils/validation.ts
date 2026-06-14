import type { LearningPage } from '../types/schema';

export function validateLearningPage(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'JSON content must be an object' };
  }

  // 1. Validate page metadata
  if (!data.page && !data.sections) {
    return { valid: false, error: 'Root object must contain "page" or "sections"' };
  }

  if (data.page) {
    if (typeof data.page !== 'object' || Array.isArray(data.page)) {
      return { valid: false, error: '"page" property must be an object' };
    }
    if (data.page.title !== undefined && typeof data.page.title !== 'string') {
      return { valid: false, error: '"page.title" must be a string' };
    }
    if (data.page.description !== undefined && typeof data.page.description !== 'string') {
      return { valid: false, error: '"page.description" must be a string' };
    }
    if (data.page.tags !== undefined) {
      if (!Array.isArray(data.page.tags)) {
        return { valid: false, error: '"page.tags" must be an array of strings' };
      }
      for (let i = 0; i < data.page.tags.length; i++) {
        if (typeof data.page.tags[i] !== 'string') {
          return { valid: false, error: `"page.tags[${i}]" must be a string` };
        }
      }
    }
    if (data.page.icon !== undefined && typeof data.page.icon !== 'string') {
      return { valid: false, error: '"page.icon" must be a string' };
    }
  }

  // 2. Validate sections array
  if (data.sections) {
    if (!Array.isArray(data.sections)) {
      return { valid: false, error: '"sections" property must be an array' };
    }

    const validTypes = [
      'text', 'tabs', 'accordion', 'timeline', 'flashcards',
      'quiz', 'fill-blank', 'matching', 'sorting', 'checklist', 'cloze'
    ];

    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      if (!section || typeof section !== 'object' || Array.isArray(section)) {
        return { valid: false, error: `"sections[${i}]" must be an object` };
      }

      const { type, title } = section;
      if (typeof type !== 'string' || !validTypes.includes(type)) {
        return { valid: false, error: `"sections[${i}].type" must be one of: ${validTypes.join(', ')}` };
      }

      if (typeof title !== 'string' || !title.trim()) {
        return { valid: false, error: `"sections[${i}].title" is required and must be a non-empty string` };
      }

      // Type-specific validations
      if (type === 'text') {
        if (typeof section.content !== 'string') {
          return { valid: false, error: `"sections[${i}].content" must be a string` };
        }
      } else if (type === 'tabs') {
        if (!Array.isArray(section.tabs)) {
          return { valid: false, error: `"sections[${i}].tabs" must be an array` };
        }
        for (let j = 0; j < section.tabs.length; j++) {
          const tab = section.tabs[j];
          if (!tab || typeof tab !== 'object' || Array.isArray(tab)) {
            return { valid: false, error: `"sections[${i}].tabs[${j}]" must be an object` };
          }
          if (typeof tab.label !== 'string' || !tab.label.trim()) {
            return { valid: false, error: `"sections[${i}].tabs[${j}].label" must be a non-empty string` };
          }
          if (typeof tab.content !== 'string') {
            return { valid: false, error: `"sections[${i}].tabs[${j}].content" must be a string` };
          }
        }
      } else if (type === 'accordion') {
        if (!Array.isArray(section.items)) {
          return { valid: false, error: `"sections[${i}].items" must be an array` };
        }
        if (section.accordionBehavior !== undefined && section.accordionBehavior !== 'exclusive' && section.accordionBehavior !== 'multiple') {
          return { valid: false, error: `"sections[${i}].accordionBehavior" must be either "exclusive" or "multiple"` };
        }
        for (let j = 0; j < section.items.length; j++) {
          const item = section.items[j];
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { valid: false, error: `"sections[${i}].items[${j}]" must be an object` };
          }
          if (typeof item.heading !== 'string' || !item.heading.trim()) {
            return { valid: false, error: `"sections[${i}].items[${j}].heading" must be a non-empty string` };
          }
          if (typeof item.content !== 'string') {
            return { valid: false, error: `"sections[${i}].items[${j}].content" must be a string` };
          }
        }
      } else if (type === 'timeline') {
        if (!Array.isArray(section.items)) {
          return { valid: false, error: `"sections[${i}].items" must be an array` };
        }
        if (section.layout !== undefined && section.layout !== 'vertical' && section.layout !== 'horizontal') {
          return { valid: false, error: `"sections[${i}].layout" must be either "vertical" or "horizontal"` };
        }
        for (let j = 0; j < section.items.length; j++) {
          const item = section.items[j];
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { valid: false, error: `"sections[${i}].items[${j}]" must be an object` };
          }
          if (typeof item.date !== 'string') {
            return { valid: false, error: `"sections[${i}].items[${j}].date" must be a string` };
          }
          if (typeof item.title !== 'string') {
            return { valid: false, error: `"sections[${i}].items[${j}].title" must be a string` };
          }
          if (typeof item.description !== 'string') {
            return { valid: false, error: `"sections[${i}].items[${j}].description" must be a string` };
          }
        }
      } else if (type === 'flashcards') {
        if (!Array.isArray(section.cards)) {
          return { valid: false, error: `"sections[${i}].cards" must be an array` };
        }
        for (let j = 0; j < section.cards.length; j++) {
          const card = section.cards[j];
          if (!card || typeof card !== 'object' || Array.isArray(card)) {
            return { valid: false, error: `"sections[${i}].cards[${j}]" must be an object` };
          }
          if (typeof card.front !== 'string' || !card.front.trim()) {
            return { valid: false, error: `"sections[${i}].cards[${j}].front" must be a non-empty string` };
          }
          if (typeof card.back !== 'string' || !card.back.trim()) {
            return { valid: false, error: `"sections[${i}].cards[${j}].back" must be a non-empty string` };
          }
        }
      } else if (type === 'quiz') {
        if (!Array.isArray(section.questions)) {
          return { valid: false, error: `"sections[${i}].questions" must be an array` };
        }
        for (let j = 0; j < section.questions.length; j++) {
          const q = section.questions[j];
          if (!q || typeof q !== 'object' || Array.isArray(q)) {
            return { valid: false, error: `"sections[${i}].questions[${j}]" must be an object` };
          }
          if (typeof q.question !== 'string' || !q.question.trim()) {
            return { valid: false, error: `"sections[${i}].questions[${j}].question" must be a non-empty string` };
          }
          if (!Array.isArray(q.options) || q.options.length === 0) {
            return { valid: false, error: `"sections[${i}].questions[${j}].options" must be a non-empty array of strings` };
          }
          for (let k = 0; k < q.options.length; k++) {
            if (typeof q.options[k] !== 'string') {
              return { valid: false, error: `"sections[${i}].questions[${j}].options[${k}]" must be a string` };
            }
          }
          if (q.correctIndex !== undefined) {
            if (typeof q.correctIndex !== 'number' || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
              return { valid: false, error: `"sections[${i}].questions[${j}].correctIndex" must be a valid integer index within options range` };
            }
          }
          if (q.explanation !== undefined && typeof q.explanation !== 'string') {
            return { valid: false, error: `"sections[${i}].questions[${j}].explanation" must be a string` };
          }
          if (q.optionExplanations !== undefined) {
            if (!Array.isArray(q.optionExplanations)) {
              return { valid: false, error: `"sections[${i}].questions[${j}].optionExplanations" must be an array` };
            }
            if (q.optionExplanations.length !== q.options.length) {
              return { valid: false, error: `"sections[${i}].questions[${j}].optionExplanations" length must match options length` };
            }
            for (let k = 0; k < q.optionExplanations.length; k++) {
              if (typeof q.optionExplanations[k] !== 'string') {
                return { valid: false, error: `"sections[${i}].questions[${j}].optionExplanations[${k}]" must be a string` };
              }
            }
          }
        }
      } else if (type === 'fill-blank') {
        if (!Array.isArray(section.sentences)) {
          return { valid: false, error: `"sections[${i}].sentences" must be an array` };
        }
        if (section.instantFeedback !== undefined && typeof section.instantFeedback !== 'boolean') {
          return { valid: false, error: `"sections[${i}].instantFeedback" must be a boolean` };
        }
        for (let j = 0; j < section.sentences.length; j++) {
          const sentence = section.sentences[j];
          if (!sentence || typeof sentence !== 'object' || Array.isArray(sentence)) {
            return { valid: false, error: `"sections[${i}].sentences[${j}]" must be an object` };
          }
          if (typeof sentence.text !== 'string' || !sentence.text.trim()) {
            return { valid: false, error: `"sections[${i}].sentences[${j}].text" must be a non-empty string` };
          }
          if (typeof sentence.answer !== 'string' || !sentence.answer.trim()) {
            return { valid: false, error: `"sections[${i}].sentences[${j}].answer" must be a non-empty string` };
          }
        }
      } else if (type === 'matching') {
        if (!Array.isArray(section.pairs)) {
          return { valid: false, error: `"sections[${i}].pairs" must be an array` };
        }
        for (let j = 0; j < section.pairs.length; j++) {
          const pair = section.pairs[j];
          if (!pair || typeof pair !== 'object' || Array.isArray(pair)) {
            return { valid: false, error: `"sections[${i}].pairs[${j}]" must be an object` };
          }
          if (typeof pair.left !== 'string' || !pair.left.trim()) {
            return { valid: false, error: `"sections[${i}].pairs[${j}].left" must be a non-empty string` };
          }
          if (typeof pair.right !== 'string' || !pair.right.trim()) {
            return { valid: false, error: `"sections[${i}].pairs[${j}].right" must be a non-empty string` };
          }
        }
      } else if (type === 'sorting') {
        if (!Array.isArray(section.items)) {
          return { valid: false, error: `"sections[${i}].items" must be an array` };
        }
        for (let j = 0; j < section.items.length; j++) {
          const item = section.items[j];
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { valid: false, error: `"sections[${i}].items[${j}]" must be an object` };
          }
          if (typeof item.text !== 'string' || !item.text.trim()) {
            return { valid: false, error: `"sections[${i}].items[${j}].text" must be a non-empty string` };
          }
          if (typeof item.correctOrder !== 'number' || !Number.isInteger(item.correctOrder)) {
            return { valid: false, error: `"sections[${i}].items[${j}].correctOrder" must be an integer` };
          }
        }
      } else if (type === 'checklist') {
        if (!Array.isArray(section.items)) {
          return { valid: false, error: `"sections[${i}].items" must be an array` };
        }
        for (let j = 0; j < section.items.length; j++) {
          const item = section.items[j];
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { valid: false, error: `"sections[${i}].items[${j}]" must be an object` };
          }
          if (typeof item.text !== 'string' || !item.text.trim()) {
            return { valid: false, error: `"sections[${i}].items[${j}].text" must be a non-empty string` };
          }
          if (item.optional !== undefined && typeof item.optional !== 'boolean') {
            return { valid: false, error: `"sections[${i}].items[${j}].optional" must be a boolean` };
          }
        }
      } else if (type === 'cloze') {
        if (typeof section.text !== 'string' || !section.text.trim()) {
          return { valid: false, error: `"sections[${i}].text" must be a non-empty string` };
        }
        if (!Array.isArray(section.blanks)) {
          return { valid: false, error: `"sections[${i}].blanks" must be an array` };
        }
        for (let j = 0; j < section.blanks.length; j++) {
          const blank = section.blanks[j];
          if (!blank || typeof blank !== 'object' || Array.isArray(blank)) {
            return { valid: false, error: `"sections[${i}].blanks[${j}]" must be an object` };
          }
          if (typeof blank.id !== 'string' || !blank.id.trim()) {
            return { valid: false, error: `"sections[${i}].blanks[${j}].id" must be a non-empty string` };
          }
          if (blank.options !== undefined) {
            if (!Array.isArray(blank.options)) {
              return { valid: false, error: `"sections[${i}].blanks[${j}].options" must be an array of strings` };
            }
            for (let k = 0; k < blank.options.length; k++) {
              if (typeof blank.options[k] !== 'string') {
                return { valid: false, error: `"sections[${i}].blanks[${j}].options[${k}]" must be a string` };
              }
            }
            if (blank.correctIndex !== undefined) {
              if (typeof blank.correctIndex !== 'number' || !Number.isInteger(blank.correctIndex) || blank.correctIndex < 0 || blank.correctIndex >= blank.options.length) {
                return { valid: false, error: `"sections[${i}].blanks[${j}].correctIndex" must be a valid integer index within options range` };
              }
            }
          }
          if (blank.correctAnswer !== undefined && typeof blank.correctAnswer !== 'string') {
            return { valid: false, error: `"sections[${i}].blanks[${j}].correctAnswer" must be a string` };
          }
          if (blank.hint !== undefined && typeof blank.hint !== 'string') {
            return { valid: false, error: `"sections[${i}].blanks[${j}].hint" must be a string` };
          }
        }
      }
    }
  }

  return { valid: true };
}
