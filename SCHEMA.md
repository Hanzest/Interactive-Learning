# JSON Schema for Interactive Learning Pages

Each JSON file represents a **single learning page**. Upload one or more files via drag-and-drop to build your study session.

## Top-Level Structure

```jsonc
{
  "page": { /* page metadata - see below */ },
  "learn": [ /* array of content sections for Learn Mode - see types below */ ],
  "practice": [ /* array of content sections for Practice Mode - see types below */ ],
  "exam": [ /* array of content sections for Exam Mode - see types below */ ]
}
```

## Common Rules

- Use 100% valid Markdown for text content
- Do not use em-dash, emojis or any non-standard unicode characters

### `page` Object

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ✅ | Page title (displayed in sidebar + header) |
| `description` | string | ❌ | Short summary of the page |
| `tags` | string[] | ❌ | Filterable tags for search |
| `icon` | string | ❌ | Optional emoji icon |

### `learn`, `practice`, and `exam` Arrays

Each section object inside the `learn`, `practice`, or `exam` arrays requires at least:

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ | One of: `text`, `tabs`, `accordion`, `timeline`, `flashcards`, `quiz`, `fill-blank`, `matching`, `sorting`, `checklist`, `cloze`, `true-false`, `short-answer`, `categorize` |
| `title` | string | ✅ | Section heading displayed above the content |

Plus **type-specific fields** as described below.

---

## Section Types

### 1. `text` - Simple content block

```json
{
  "type": "text",
  "title": "Introduction",
  "content": "This is **bold** and *italic* text with `code`."
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `content` | string | ✅ | Text content. Supports **bold**, *italic*, `code`, [links](url), and line breaks. |

---

### 2. `tabs` - Tabbed content viewer

```json
{
  "type": "tabs",
  "title": "Data Types",
  "tabs": [
    { "label": "Strings", "content": "Text data enclosed in quotes." },
    { "label": "Numbers", "content": "Integers and floating point." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `tabs` | array | ✅ | Array of tab objects |
| `tabs[].label` | string | ✅ | Tab button label |
| `tabs[].content` | string | ✅ | Tab panel content (supports markdown-like formatting) |

---

### 3. `accordion` - Expandable sections

```json
{
  "type": "accordion",
  "title": "FAQ",
  "items": [
    { "heading": "What is X?", "content": "X is a concept that..." },
    { "heading": "How does Y work?", "content": "Y works by..." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | array | ✅ | Array of accordion items |
| `items[].heading` | string | ✅ | Clickable heading text |
| `items[].content` | string | ✅ | Expandable content (supports formatting) |
| `accordionBehavior` | string | ❌ | `'exclusive'` or `'multiple'` (default `'multiple'`). Controls whether multiple items can be open at once. |

---

### 4. `timeline` - Chronological display

```json
{
  "type": "timeline",
  "title": "History of JavaScript",
  "items": [
    { "date": "1995", "title": "Created", "description": "Brendan Eich created JS in 10 days." },
    { "date": "2015", "title": "ES6", "description": "Major update with classes, modules, etc." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | array | ✅ | Array of timeline events |
| `items[].date` | string | ✅ | Date or year label (displayed prominently) |
| `items[].title` | string | ✅ | Event title |
| `items[].description` | string | ✅ | Event details (supports formatting) |
| `layout` | string | ❌ | `'vertical'` or `'horizontal'` (default `'vertical'`). Controls the display orientation. |

---

### 5. `flashcards` - Interactive card deck

```json
{
  "type": "flashcards",
  "title": "Key Terms",
  "cards": [
    { "front": "What is a closure?", "back": "A function that retains access to its outer scope." },
    { "front": "What is hoisting?", "back": "Variable and function declarations are moved to the top." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `cards` | array | ✅ | Array of flashcard objects |
| `cards[].front` | string | ✅ | Question or term (shown first) |
| `cards[].back` | string | ✅ | Answer or definition (revealed on click) |

---

### 6. `quiz` - Multiple choice assessment

```json
{
  "type": "quiz",
  "title": "Test Yourself",
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["3", "4", "5"],
      "correctIndex": 1,
      "explanation": "2+2 equals 4, which is basic arithmetic."
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `questions` | array | ✅ | Array of question objects |
| `questions[].question` | string | ✅ | The question text |
| `questions[].options` | string[] | ✅ | Array of answer options |
| `questions[].correctIndex` | integer | ❌ | Index of correct option (0-based). Default: no pre-set answer. |
| `questions[].explanation` | string | ✅ | Shown after submission to explain the correct answer |
| `questions[].optionExplanations` | string[] | ❌ | Per-option explanations (length must match `options`). After submission, shows each option's specific explanation. |

---

### 7. `fill-blank` - Fill in the blanks

```json
{
  "type": "fill-blank",
  "title": "Complete the Sentences",
  "sentences": [
    { "text": "The sun ___ in the east.", "answer": "rises" },
    { "text": "Water boils at ___ degrees Celsius.", "answer": "100" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sentences` | array | ✅ | Array of fill-in-the-blank sentences |
| `sentences[].text` | string | ✅ | Sentence with `___` (3+ underscores) marking the blank |
| `sentences[].answer` | string | ✅ | The correct answer (case-insensitive comparison) |
| `instantFeedback` | boolean | ❌ | When `true`, shows correct/incorrect feedback immediately after each blank is filled (default `false`). |

---

### 8. `matching` - Match left-right pairs

```json
{
  "type": "matching",
  "title": "Match the Terms",
  "pairs": [
    { "left": "Variable", "right": "A named container for storing data." },
    { "left": "Function", "right": "A reusable block of code." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `pairs` | array | ✅ | Array of matching pair objects |
| `pairs[].left` | string | ✅ | Left-side item (term or concept) |
| `pairs[].right` | string | ✅ | Right-side item (definition or match) |

---

### 9. `sorting` - Order items correctly

```json
{
  "type": "sorting",
  "title": "Order the Steps",
  "items": [
    { "text": "Plan the project", "correctOrder": 1 },
    { "text": "Write the code", "correctOrder": 2 },
    { "text": "Test the application", "correctOrder": 3 }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | array | ✅ | Array of sortable items |
| `items[].text` | string | ✅ | Display text for the item |
| `items[].correctOrder` | integer | ✅ | The correct position (0-based index) of this item in the sorted sequence |

---

### 10. `checklist` - Interactive checklist

```json
{
  "type": "checklist",
  "title": "Before Deployment",
  "items": [
    { "text": "All tests pass", "optional": false },
    { "text": "Documentation updated", "optional": true }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `items` | array | ✅ | Array of checklist items |
| `items[].text` | string | ✅ | Item description |
| `items[].optional` | boolean | ❌ | When `true`, the item is marked as optional (default `false`) |

---

### 11. `cloze` - Cloze deletion (fill-in-text)

```json
{
  "type": "cloze",
  "title": "Complete the Passage",
  "text": "The {{verb}} is a part of speech that describes an action.",
  "blanks": [
    { "id": "verb", "options": ["noun", "verb", "adjective"], "correctIndex": 1, "correctAnswer": "verb", "hint": "It describes an action or state." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | ✅ | The passage text with `{{id}}` placeholders marking blank locations |
| `blanks` | array | ✅ | Array of blank definitions |
| `blanks[].id` | string | ✅ | Identifier matching the `{{id}}` placeholder in `text` |
| `blanks[].options` | string[] | ❌ | Array of answer options for multiple-choice style (omit for free-text input) |
| `blanks[].correctIndex` | integer | ❌ | Index of the correct option in `options` (0-based). Required if `options` is provided. |
| `blanks[].correctAnswer` | string | ❌ | The correct answer text (for free-text blanks or as display text) |
| `blanks[].hint` | string | ❌ | Optional hint shown to the user when they need help |

---

## Full Example

See [`test/fixtures/valid-full.json`](./test/fixtures/valid-full.json) for a complete example covering all 11 section types.

---

### 12. `true-false` - True or False with explanation

```json
{
  "type": "true-false",
  "title": "Fact Check",
  "statements": [
    {
      "statement": "JavaScript is a statically typed language.",
      "isTrue": false,
      "explanation": "JavaScript is dynamically typed. TypeScript adds optional static typing."
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `statements` | array | ✅ | Array of statement objects (minimum 3) |
| `statements[].statement` | string | ✅ | The claim to evaluate |
| `statements[].isTrue` | boolean | ✅ | Whether the statement is correct |
| `statements[].explanation` | string | ✅ | Shown after answer - explains why it is true or false |

---

### 13. `short-answer` - Open-Ended Response with Self-Assessment

```json
{
  "type": "short-answer",
  "title": "In Your Own Words",
  "questions": [
    {
      "prompt": "In 2-3 sentences, explain what a closure is in JavaScript.",
      "sampleAnswer": "A closure is a function that retains access to variables from its outer scope...",
      "keyPoints": ["retains outer scope access", "outer function has returned"],
      "hint": "Think about what happens to variables after a function finishes."
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `questions` | array | ✅ | Array of question objects (minimum 1) |
| `questions[].prompt` | string | ✅ | The open-ended question |
| `questions[].sampleAnswer` | string | ✅ | Model answer revealed after the learner submits |
| `questions[].keyPoints` | string[] | ❌ | Bullet checklist of key ideas for self-grading |
| `questions[].hint` | string | ❌ | Optional hint shown to the user |

---

### 14. `categorize` - Drag-to-Category Classification

```json
{
  "type": "categorize",
  "title": "Classify the Concepts",
  "categories": [
    { "id": "compiled", "label": "Compiled Languages" },
    { "id": "interpreted", "label": "Interpreted Languages" }
  ],
  "items": [
    { "id": "c", "text": "C", "categoryId": "compiled", "explanation": "C is compiled to machine code." },
    { "id": "python", "text": "Python", "categoryId": "interpreted", "explanation": "Python is interpreted at runtime." },
    { "id": "rust", "text": "Rust", "categoryId": "compiled", "explanation": "Rust compiles to native machine code." }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `categories` | array | ✅ | Target category buckets (minimum 2) |
| `categories[].id` | string | ✅ | Unique category identifier |
| `categories[].label` | string | ✅ | Display label for the category |
| `items` | array | ✅ | Items to classify (minimum 3) |
| `items[].id` | string | ✅ | Unique item identifier |
| `items[].text` | string | ✅ | Display text for the item |
| `items[].categoryId` | string | ✅ | Must match a defined category `id` |
| `items[].explanation` | string | ❌ | Shown after submission to explain the correct category |

## Validation

All uploaded JSON files are validated against this schema before rendering. Errors are displayed in a red panel with field paths (e.g., `learn[2].content`).

The validator enforces:
1. **Required Fields**: Every uploaded JSON file must contain a `page` object, and `learn`, `practice`, and `exam` arrays.
2. **Item Count Constraints**:
    - `quiz` sections: Must contain at least **3 questions**
    - `fill-blank` sections: Must contain at least **5 sentences**
    - `matching` sections: Must contain at least **4 pairs**
    - `sorting` sections: Must contain at least **4 items**
    - `cloze` sections: Must contain at least **5 blanks**
    - `true-false` sections: Must contain at least **3 statements**
    - `short-answer` sections: Must contain at least **1 question**
    - `categorize` sections: Must contain at least **3 items** and **2 categories**
