# Content Creation Guidelines & Best Practices

This document outlines the pedagogical guidelines, best practices, and schema alignment for creating engaging, effective content for each of the 11 interactive learning components supported by the Interactive Learning platform.

---

## 🧠 Pedagogical Foundations

To maximize knowledge retention, structure your pages around three key cognitive science principles:
1. **Active Recall**: Test knowledge before presenting the answer (use *Flashcards*, *Quizzes*, *Matching*).
2. **Spaced Repetition**: Re-evaluate complex topics periodically to improve long-term retention.
3. **Scaffolding / Details-on-Demand**: Start with broad concepts and expose complexity progressively (use *Tabs*, *Accordions*).

---

## 🛠️ Component Guidelines & Best Practices

### 1. `text` (Content Blocks)
* **Best Used For**: Introductions, conceptual overviews, definitions, and theory-heavy explanations.
* **Best Practices**:
  - Keep paragraphs short (3–4 sentences max) to avoid reader fatigue.
  - Emphasize key terms using **bolding** or `inline code` styling.
  - Use clear headings and lists to make the content easily scannable.

### 2. `tabs` (Comparison Panels)
* **Best Used For**: Side-by-side comparisons, code snippet translations (e.g., Python vs. JavaScript), or multi-perspective analyses.
* **Best Practices**:
  - Keep tab labels concise (1–2 words).
  - Ensure the content in each tab is structured similarly to allow direct comparison.
  - Limit the number of tabs to 5 to avoid horizontal cluttering.

### 3. `accordion` (Expandable Details)
* **Best Used For**: FAQs, detailed code explanations, troubleshooting steps, or deep-dives into optional sub-topics.
* **Best Practices**:
  - Use clear questions or action-oriented statements as headings.
  - Hide dense or advanced background information under accordions to prevent cognitive overload for beginners.
  - Set `accordionBehavior` to `"exclusive"` when guiding a user through sequentially ordered items.

### 4. `timeline` (Chronological Processes)
* **Best Used For**: History of a technology, version milestones, step-by-step setup flows, or execution lifecycles.
* **Best Practices**:
  - Keep the `date` strings short and uniform (e.g., years, step numbers, or timestamps).
  - Use horizontal layouts for short steps (2–4 items) and vertical layouts for longer progressions.

### 5. `flashcards` (Terminology & Concepts)
* **Best Used For**: Vocabulary, syntax syntax, definitions, key formulas, or standard interview questions.
* **Best Practices**:
  - Keep the front prompt short and engaging (e.g., "What is the complexity of Quicksort?").
  - Do not put excessively long paragraphs on the back. The answer should be direct and clear.
  - Use Markdown lists or code blocks on the back to structure information.

### 6. `quiz` (Multiple Choice Assessment)
* **Best Used For**: Formative self-checks, concept verification, or diagnostic pre-tests.
* **Best Practices**:
  - Make sure the incorrect options (distractors) are realistic and reflect common learner misconceptions.
  - Provide a thorough, encouraging `explanation` for *why* the correct answer is right.
  - Use `optionExplanations` to give specific, targeted feedback when a student selects a particular wrong choice.

### 7. `fill-blank` (Exact Recall Exercises)
* **Best Used For**: Code syntax completion, exact vocabulary terms, mathematical variables, or numeric answers.
* **Best Practices**:
  - Provide only *one* clear blank (`___`) per sentence.
  - Ensure the correct answer is a singular, unambiguous word or number.
  - Enable `instantFeedback` for quick, low-stakes drills so users learn from immediate correction.

### 8. `matching` (Association Drills)
* **Best Used For**: Mapping terms to definitions, icons to descriptions, or functions to their respective output/behavior.
* **Best Practices**:
  - Keep the left column short (e.g., single words or symbols) and the right column slightly longer (descriptions/definitions).
  - Aim for 4 to 6 pairs. Fewer is trivial, while more than 7 makes the interactive lines messy and hard to read.

### 9. `sorting` (Sequential Ordering)
* **Best Used For**: Ordering code instructions, algorithmic steps (e.g., bubble sort phases), or hierarchy structures.
* **Best Practices**:
  - Keep the item texts short to fit in single-line draggable blocks.
  - Ensure there is a single logical path or standard procedure that determines the correct order.

### 10. `checklist` (Interactive Workflows)
* **Best Used For**: Setup checksheets, pre-deployment checklists, learning path requirements, or review lists.
* **Best Practices**:
  - Write items as action-oriented tasks (e.g., "Verify SSL cert is installed").
  - Mark optional elements with `"optional": true` to separate critical milestones from optional review steps.

### 11. `cloze` (Contextual Reading Comprehension)
* **Best Used For**: Code snippet scaffolding (cloze deletions), grammar/vocabulary drills, or passage comprehension.
* **Best Practices**:
  - Use drop-down options (`options`) for beginners and free-text inputs for advanced recall checks.
  - Add a helpful `hint` to guide the learner without directly giving away the solution.

---

## ⚠️ Content Formatting Warnings

- **Validity**: Ensure JSON files conform exactly to the JSON syntax (e.g., escape double quotes `\"` within strings).
- **Markdown**: Supports standard bold (`**`), italics (`*`), lists (`-`), tables, and code blocks (use three backticks).
- **Encoding**: Save all JSON files with UTF-8 encoding. Do not use em-dashes (`—`) or decorative unicode symbols where standard text suffices.
