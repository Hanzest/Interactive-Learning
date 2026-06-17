import type { LearningPage } from '../types/schema';

function validateSection(section: any, path: string): { valid: boolean; error?: string } {
  if (!section || typeof section !== 'object' || Array.isArray(section)) {
    return { valid: false, error: `"${path}" must be an object` };
  }

  const { type, title } = section;
  const validTypes = [
    'text', 'tabs', 'accordion', 'timeline', 'flashcards',
    'quiz', 'fill-blank', 'matching', 'sorting', 'checklist', 'cloze'
  ];

  if (typeof type !== 'string' || !validTypes.includes(type)) {
    return { valid: false, error: `"${path}.type" must be one of: ${validTypes.join(', ')}` };
  }

  if (typeof title !== 'string' || !title.trim()) {
    return { valid: false, error: `"${path}.title" is required and must be a non-empty string` };
  }

  // Type-specific validations
  if (type === 'text') {
    if (typeof section.content !== 'string') {
      return { valid: false, error: `"${path}.content" must be a string` };
    }
  } else if (type === 'tabs') {
    if (!Array.isArray(section.tabs)) {
      return { valid: false, error: `"${path}.tabs" must be an array` };
    }
    for (let j = 0; j < section.tabs.length; j++) {
      const tab = section.tabs[j];
      if (!tab || typeof tab !== 'object' || Array.isArray(tab)) {
        return { valid: false, error: `"${path}.tabs[${j}]" must be an object` };
      }
      if (typeof tab.label !== 'string' || !tab.label.trim()) {
        return { valid: false, error: `"${path}.tabs[${j}].label" must be a non-empty string` };
      }
      if (typeof tab.content !== 'string') {
        return { valid: false, error: `"${path}.tabs[${j}].content" must be a string` };
      }
    }
  } else if (type === 'accordion') {
    if (!Array.isArray(section.items)) {
      return { valid: false, error: `"${path}.items" must be an array` };
    }
    if (section.accordionBehavior !== undefined && section.accordionBehavior !== 'exclusive' && section.accordionBehavior !== 'multiple') {
      return { valid: false, error: `"${path}.accordionBehavior" must be either "exclusive" or "multiple"` };
    }
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `"${path}.items[${j}]" must be an object` };
      }
      if (typeof item.heading !== 'string' || !item.heading.trim()) {
        return { valid: false, error: `"${path}.items[${j}].heading" must be a non-empty string` };
      }
      if (typeof item.content !== 'string') {
        return { valid: false, error: `"${path}.items[${j}].content" must be a string` };
      }
    }
  } else if (type === 'timeline') {
    if (!Array.isArray(section.items)) {
      return { valid: false, error: `"${path}.items" must be an array` };
    }
    if (section.layout !== undefined && section.layout !== 'vertical' && section.layout !== 'horizontal') {
      return { valid: false, error: `"${path}.layout" must be either "vertical" or "horizontal"` };
    }
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `"${path}.items[${j}]" must be an object` };
      }
      if (typeof item.date !== 'string') {
        return { valid: false, error: `"${path}.items[${j}].date" must be a string` };
      }
      if (typeof item.title !== 'string') {
        return { valid: false, error: `"${path}.items[${j}].title" must be a string` };
      }
      if (typeof item.description !== 'string') {
        return { valid: false, error: `"${path}.items[${j}].description" must be a string` };
      }
    }
  } else if (type === 'flashcards') {
    if (!Array.isArray(section.cards)) {
      return { valid: false, error: `"${path}.cards" must be an array` };
    }
    for (let j = 0; j < section.cards.length; j++) {
      const card = section.cards[j];
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        return { valid: false, error: `"${path}.cards[${j}]" must be an object` };
      }
      if (typeof card.front !== 'string' || !card.front.trim()) {
        return { valid: false, error: `"${path}.cards[${j}].front" must be a non-empty string` };
      }
      if (typeof card.back !== 'string' || !card.back.trim()) {
        return { valid: false, error: `"${path}.cards[${j}].back" must be a non-empty string` };
      }
    }
  } else if (type === 'quiz') {
    if (!Array.isArray(section.questions)) {
      return { valid: false, error: `"${path}.questions" must be an array` };
    }
    if (section.questions.length < 5) {
      return { valid: false, error: `"${path}.questions" must contain at least 5 questions (found ${section.questions.length})` };
    }
    for (let j = 0; j < section.questions.length; j++) {
      const q = section.questions[j];
      if (!q || typeof q !== 'object' || Array.isArray(q)) {
        return { valid: false, error: `"${path}.questions[${j}]" must be an object` };
      }
      if (typeof q.question !== 'string' || !q.question.trim()) {
        return { valid: false, error: `"${path}.questions[${j}].question" must be a non-empty string` };
      }
      if (!Array.isArray(q.options) || q.options.length === 0) {
        return { valid: false, error: `"${path}.questions[${j}].options" must be a non-empty array of strings` };
      }
      for (let k = 0; k < q.options.length; k++) {
        if (typeof q.options[k] !== 'string') {
          return { valid: false, error: `"${path}.questions[${j}].options[${k}]" must be a string` };
        }
      }
      if (q.correctIndex !== undefined) {
        if (typeof q.correctIndex !== 'number' || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          return { valid: false, error: `"${path}.questions[${j}].correctIndex" must be a valid integer index within options range` };
        }
      }
      if (q.Explanation !== undefined && typeof q.Explanation !== 'string') {
        return { valid: false, error: `"${path}.questions[${j}].Explanation" must be a string` };
      }
      if (q.optionExplanations !== undefined) {
        if (!Array.isArray(q.optionExplanations)) {
          return { valid: false, error: `"${path}.questions[${j}].optionExplanations" must be an array` };
        }
        if (q.optionExplanations.length !== q.options.length) {
          return { valid: false, error: `"${path}.questions[${j}].optionExplanations" length must match options length` };
        }
        for (let k = 0; k < q.optionExplanations.length; k++) {
          if (typeof q.optionExplanations[k] !== 'string') {
            return { valid: false, error: `"${path}.questions[${j}].optionExplanations[${k}]" must be a string` };
          }
        }
      }
    }
  } else if (type === 'fill-blank') {
    if (!Array.isArray(section.sentences)) {
      return { valid: false, error: `"${path}.sentences" must be an array` };
    }
    if (section.sentences.length < 4) {
      return { valid: false, error: `"${path}.sentences" must contain at least 4 sentences (found ${section.sentences.length})` };
    }
    if (section.instantFeedback !== undefined && typeof section.instantFeedback !== 'boolean') {
      return { valid: false, error: `"${path}.instantFeedback" must be a boolean` };
    }
    for (let j = 0; j < section.sentences.length; j++) {
      const sentence = section.sentences[j];
      if (!sentence || typeof sentence !== 'object' || Array.isArray(sentence)) {
        return { valid: false, error: `"${path}.sentences[${j}]" must be an object` };
      }
      if (typeof sentence.text !== 'string' || !sentence.text.trim()) {
        return { valid: false, error: `"${path}.sentences[${j}].text" must be a non-empty string` };
      }
      if (typeof sentence.answer !== 'string' || !sentence.answer.trim()) {
        return { valid: false, error: `"${path}.sentences[${j}].answer" must be a non-empty string` };
      }
    }
  } else if (type === 'matching') {
    if (!Array.isArray(section.pairs)) {
      return { valid: false, error: `"${path}.pairs" must be an array` };
    }
    if (section.pairs.length < 3) {
      return { valid: false, error: `"${path}.pairs" must contain at least 3 matching pairs (found ${section.pairs.length})` };
    }
    for (let j = 0; j < section.pairs.length; j++) {
      const pair = section.pairs[j];
      if (!pair || typeof pair !== 'object' || Array.isArray(pair)) {
        return { valid: false, error: `"${path}.pairs[${j}]" must be an object` };
      }
      if (typeof pair.left !== 'string' || !pair.left.trim()) {
        return { valid: false, error: `"${path}.pairs[${j}].left" must be a non-empty string` };
      }
      if (typeof pair.right !== 'string' || !pair.right.trim()) {
        return { valid: false, error: `"${path}.pairs[${j}].right" must be a non-empty string` };
      }
    }
  } else if (type === 'sorting') {
    if (!Array.isArray(section.items)) {
      return { valid: false, error: `"${path}.items" must be an array` };
    }
    if (section.items.length < 4) {
      return { valid: false, error: `"${path}.items" must contain at least 4 items to sort (found ${section.items.length})` };
    }
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `"${path}.items[${j}]" must be an object` };
      }
      if (typeof item.text !== 'string' || !item.text.trim()) {
        return { valid: false, error: `"${path}.items[${j}].text" must be a non-empty string` };
      }
      if (typeof item.correctOrder !== 'number' || !Number.isInteger(item.correctOrder)) {
        return { valid: false, error: `"${path}.items[${j}].correctOrder" must be an integer` };
      }
    }
  } else if (type === 'checklist') {
    if (!Array.isArray(section.items)) {
      return { valid: false, error: `"${path}.items" must be an array` };
    }
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { valid: false, error: `"${path}.items[${j}]" must be an object` };
      }
      if (typeof item.text !== 'string' || !item.text.trim()) {
        return { valid: false, error: `"${path}.items[${j}].text" must be a non-empty string` };
      }
      if (item.optional !== undefined && typeof item.optional !== 'boolean') {
        return { valid: false, error: `"${path}.items[${j}].optional" must be a boolean` };
      }
    }
  } else if (type === 'cloze') {
    if (typeof section.text !== 'string' || !section.text.trim()) {
      return { valid: false, error: `"${path}.text" must be a non-empty string` };
    }
    if (!Array.isArray(section.blanks)) {
      return { valid: false, error: `"${path}.blanks" must be an array` };
    }
    if (section.blanks.length < 4) {
      return { valid: false, error: `"${path}.blanks" must contain at least 4 cloze blanks (found ${section.blanks.length})` };
    }
    for (let j = 0; j < section.blanks.length; j++) {
      const blank = section.blanks[j];
      if (!blank || typeof blank !== 'object' || Array.isArray(blank)) {
        return { valid: false, error: `"${path}.blanks[${j}]" must be an object` };
      }
      if (typeof blank.id !== 'string' || !blank.id.trim()) {
        return { valid: false, error: `"${path}.blanks[${j}].id" must be a non-empty string` };
      }
      if (blank.options !== undefined) {
        if (!Array.isArray(blank.options)) {
          return { valid: false, error: `"${path}.blanks[${j}].options" must be an array of strings` };
        }
        for (let k = 0; k < blank.options.length; k++) {
          if (typeof blank.options[k] !== 'string') {
            return { valid: false, error: `"${path}.blanks[${j}].options[${k}]" must be a string` };
          }
        }
        if (blank.correctIndex !== undefined) {
          if (typeof blank.correctIndex !== 'number' || !Number.isInteger(blank.correctIndex) || blank.correctIndex < 0 || blank.correctIndex >= blank.options.length) {
            return { valid: false, error: `"${path}.blanks[${j}].correctIndex" must be a valid integer index within options range` };
          }
        }
      }
      if (blank.correctAnswer !== undefined && typeof blank.correctAnswer !== 'string') {
        return { valid: false, error: `"${path}.blanks[${j}].correctAnswer" must be a string` };
      }
      if (blank.hint !== undefined && typeof blank.hint !== 'string') {
        return { valid: false, error: `"${path}.blanks[${j}].hint" must be a string` };
      }
    }
  }

  return { valid: true };
}

export function validateLearningPage(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'JSON content must be an object' };
  }

  // 1. Validate required fields presence
  if (!data.page) {
    return { valid: false, error: 'Root object must contain a "page" metadata object' };
  }
  if (!data.learn) {
    return { valid: false, error: 'Root object must contain a "learn" sections array' };
  }
  if (!data.practice) {
    return { valid: false, error: 'Root object must contain a "practice" sections array' };
  }
  if (!data.exam) {
    return { valid: false, error: 'Root object must contain an "exam" sections array' };
  }

  // 2. Validate page metadata
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

  // 3. Validate learn array
  if (!Array.isArray(data.learn)) {
    return { valid: false, error: '"learn" property must be an array' };
  }
  for (let i = 0; i < data.learn.length; i++) {
    const res = validateSection(data.learn[i], `learn[${i}]`);
    if (!res.valid) {
      return res;
    }
  }

  // 4. Validate practice array
  if (!Array.isArray(data.practice)) {
    return { valid: false, error: '"practice" property must be an array' };
  }
  for (let i = 0; i < data.practice.length; i++) {
    const res = validateSection(data.practice[i], `practice[${i}]`);
    if (!res.valid) {
      return res;
    }
  }

  // 5. Validate exam array
  if (!Array.isArray(data.exam)) {
    return { valid: false, error: '"exam" property must be an array' };
  }
  for (let i = 0; i < data.exam.length; i++) {
    const res = validateSection(data.exam[i], `exam[${i}]`);
    if (!res.valid) {
      return res;
    }
  }

  return { valid: true };
}
