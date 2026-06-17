# JSON Schema for Interactive Learning Pages

Each JSON file represents a **single learning page**. Upload one or more files via drag-and-drop to build your study session.

## Top-Level Structure

```jsonc
{
  "page": { /* page metadata - see below */ },
  "sections": [ /* array of content sections for Learn Mode - see types below */ ],
  "test": { /* optional test configuration for Practice/Exam Mode - see below */ }
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

### `test` Object

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | ❌ | Title for the practice/exam section |
| `subsections` | array | ✅ | Array of section objects (same types as `sections` below) rendered specifically in Practice and Exam modes |

### `sections` Array

Each section object in the `sections` array (or `test.subsections` array) requires at least:


| Field | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ | One of: `text`, `tabs`, `accordion`, `timeline`, `flashcards`, `quiz`, `fill-blank`, `matching`, `sorting`, `checklist`, `cloze` |
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

## Validation

All uploaded JSON files are validated against this schema before rendering. Errors are displayed in a red panel with field paths (e.g., `sections[2].content`).

To validate programmatically (Node.js):

```js
const { validateLearningPage } = require('./js/schema-validator.cjs');
const result = validateLearningPage(yourJsonObject);
console.log(result.valid ? '✅ Valid' : '❌ Invalid', result.errors);
```
