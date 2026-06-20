import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { MIN_CONSTRAINTS } from '../../utils/validation';

type PromptMode = 'fast' | 'tailored';

type ContextType = 'Exam' | 'Academic' | 'Professional/Working' | 'Daily Life' | 'Strategic';
type DepthType = 'Low' | 'Medium' | 'High';

const contextExplanations: Record<ContextType, string> = {
  Exam: 'Optimized for exam prep: focuses on core testing points, high-frequency definitions, common exam traps, and knowledge gaps that frequently appear in assessments.',
  Academic: 'Focused on academic rigor: covers theoretical foundations, conceptual frameworks, research paradigms, historical evolution, and scholarly debates.',
  'Professional/Working': 'Practical and application-oriented: covers real-world scenarios, industry-standard workflows, professional decision-making, troubleshooting methods, and common anti-patterns.',
  'Daily Life': 'Casual and general understanding: covers everyday applications, practical know-how, common terminology, relatable analogies, and real-life problem-solving situations.',
  Strategic: 'High-level overview and systems thinking: covers strategic frameworks, system interdependencies, long-term roadmaps, competitive landscapes, and high-level decision models.',
};

const depthExplanations: Record<DepthType, string> = {
  Low: 'A brief, high-level overview of the main topics. Best for a quick read, basic introduction, or a fast refresher.',
  Medium: 'A balanced approach with core concepts, simple illustrations, and moderate detail. Suitable for most learners.',
  High: 'An exhaustive deep-dive covering advanced mechanics, edge cases, underlying principles, nuanced exceptions, and comprehensive mastery-level knowledge. Best for full competency.',
};

const s = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(6px)',
    animation: 'fadeIn 200ms ease',
    padding: '1rem',
  } as React.CSSProperties,
  card: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    borderRadius: 16,
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: 480,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    animation: 'slideUp 250ms ease',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '1.25rem',
    cursor: 'pointer',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    transition: 'background var(--transition-fast), color var(--transition-fast)',
  } as React.CSSProperties,
  body: {
    padding: '1.5rem',
    overflowY: 'auto' as const,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.25rem',
  } as React.CSSProperties,
  tabsContainer: {
    display: 'flex',
    borderRadius: 8,
    background: 'var(--bg-tertiary)',
    padding: 4,
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  tabButton: (active: boolean) => ({
    flex: 1,
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: 6,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    background: active ? 'var(--bg-primary)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,
  stepIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 0.5rem',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  stepDot: (active: boolean, completed: boolean) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: active ? 'var(--accent)' : completed ? 'var(--accent-light)' : 'var(--bg-tertiary)',
    color: active ? '#fff' : completed ? 'var(--accent)' : 'var(--text-muted)',
    border: active ? '2px solid var(--accent)' : '2px solid var(--border-color)',
    transition: 'all 0.2s ease',
  }) as React.CSSProperties,
  stepLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginTop: 4,
    textAlign: 'center' as const,
  } as React.CSSProperties,
  stepConnector: {
    flex: 1,
    height: 2,
    background: 'var(--border-color)',
    margin: '0 8px',
  } as React.CSSProperties,
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
    display: 'block',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  } as React.CSSProperties,
  selectWrapper: {
    position: 'relative' as const,
    width: '100%',
  } as React.CSSProperties,
  selectButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    textAlign: 'left' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    outline: 'none',
  } as React.CSSProperties,
  dropdownMenu: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    marginTop: 4,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
  } as React.CSSProperties,
  dropdownItem: (selected: boolean) => ({
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    background: selected ? 'var(--accent-light)' : 'transparent',
    color: selected ? 'var(--accent)' : 'var(--text-primary)',
    display: 'block',
    width: '100%',
    border: 'none',
    textAlign: 'left' as const,
    transition: 'background 0.15s ease',
  }) as React.CSSProperties,
  explanationCard: {
    padding: '1rem',
    background: 'var(--bg-tertiary)',
    borderRadius: 8,
    borderLeft: '4px solid var(--accent)',
    fontSize: '0.8125rem',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    height: 120,
    padding: '0.75rem 1rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
    outline: 'none',
    resize: 'none' as const,
  } as React.CSSProperties,
  footer: {
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,
  btnBack: {
    padding: '0.625rem 1.25rem',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  btnNext: (disabled: boolean) => ({
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: 8,
    background: disabled ? 'var(--border-color)' : 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,
  modelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    width: '100%',
  } as React.CSSProperties,
  modelButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: 6,
  } as React.CSSProperties,
};

export default function CreateJSONOverlay() {
  const { state, toggleCreatePrompt, addToast } = useAppContext();
  const { t, language } = useTranslation();

  const [mode, setMode] = useState<PromptMode>('fast');
  const [step, setStep] = useState<number>(1);
  const [topic, setTopic] = useState<string>('');
  const [outputLang, setOutputLang] = useState<string>('English');
  const [context, setContext] = useState<ContextType>('Academic');
  const [depth, setDepth] = useState<DepthType>('Medium');
  const [avoidComponents, setAvoidComponents] = useState<string[]>([]);

  const [dropdownContextOpen, setDropdownContextOpen] = useState(false);
  const [dropdownDepthOpen, setDropdownDepthOpen] = useState(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const isMouseDownOnBackdrop = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      isMouseDownOnBackdrop.current = true;
    } else {
      isMouseDownOnBackdrop.current = false;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isMouseDownOnBackdrop.current && e.target === backdropRef.current) {
      toggleCreatePrompt();
    }
    isMouseDownOnBackdrop.current = false;
  };

  useEffect(() => {
    if (state.showCreatePrompt) {
      setStep(1);
      setTopic('');
      setOutputLang(language === 'vi' ? 'Tiếng Việt' : 'English');
      setAvoidComponents([]);
    }
  }, [state.showCreatePrompt, language]);

  if (!state.showCreatePrompt) return null;

  // Handle step flow
  const handleNext = () => {
    if (mode === 'fast') {
      if (step === 1) setStep(5);
    } else {
      if (step < 5) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (mode === 'fast') {
      if (step === 5) setStep(1);
    } else {
      if (step > 1) setStep(step - 1);
    }
  };

  // Generate prompt text
  const generatePrompt = (): string => {
    let prompt = `You are a professional educational content creator and expert JSON formatter.
Create educational content in json format for this topic: "${topic}".
`;

    if (mode === 'tailored') {
      prompt += `
Tailor the content to the following specifications:
- Target Context: ${context} (${contextExplanations[context]})
- Content Depth: ${depth} (${depthExplanations[depth]})
`;
      if (avoidComponents.length > 0) {
        prompt += `- Avoided graded components: DO NOT generate any sections of type: ${avoidComponents.join(', ')}. These components must not exist in practice and exam arrays.
`;
      }
    } else {
      prompt += `
Keep the content concise, engaging, and suitable for a general audience.
`;
    }

    prompt += `
**Core Educational Design Principles:**
- Cognitive Load Theory: Ensure that the 'learn' section sequences information logically from simple to complex. Break down complex concepts into digestible micro-learning chunks (using text, tabs, or accordions).
- Pedagogical Intent for UI Elements:
  Flashcards: Use ONLY for factual reinforcement, active recall of definitions, or formula memorization. Do NOT use them to explain complex concepts.
  Quiz/Fill-blank/Cloze: Use for conceptual checking, misconception refutation, and application of knowledge. Ensure distractors (wrong options) in quizzes represent common learner misconceptions.
  Sorting/Timeline: Use strictly for procedural knowledge, chronological events, or step-by-step algorithms.
  Matching: Use for linking terms with definitions, causes with effects, or problems with specific tools.
- Scaffolding & Differentiation: The difficulty must increment progressively from 'learn' (conceptualization) to 'practice' (guided application) and 'exam' (independent evaluation under constraints).
- Elaborative Feedback: In all 'quiz' sections, the 'Explanation' and 'optionExplanations' must not just state what is right, but briefly explain *why* the wrong options are incorrect based on common mistakes.
- Present the scope (what content will be covered) and deliverables (what the learner can do after the lesson) at the second section in "learn" array.
- All content in "practice" and "exam" must be covered in "learn" array. But the "practice" and "exam" sections should not duplicate the content of the
"learn" section.
`;

    if (mode === 'tailored' && avoidComponents.length > 0) {
      prompt += `
**Avoided Components Constraint:**
- Do NOT generate or include any of these section types: ${avoidComponents.join(', ')}.
- These types are strictly forbidden in this request.
`;
    }

    prompt += `**Format constraints**
- Only a valid JSON object matching the schema below. Do not add any conversational text before or after the JSON.
Ensure the JSON is fully compliant, with no syntax errors, no trailing commas, and valid Markdown in string fields.
- Not starting content with '>' or '*' as bullet point, use '-'.

JSON Schema structure:
{
  "page": {
    "title": "A short, engaging title for the page",
    "description": "A brief summary of what the user will learn",
    "tags": ["tag1", "tag2"],
    "icon": "Optional emoji icon"
  },
  "learn": [
    // Array of interactive study/learning sections (e.g. text, tabs, accordion, timeline, flashcards, checklist, quiz, etc.).
    // Vary the section types to make the learning experience engaging.
  ],
  "practice": [
    // Array of interactive practice sections containing a separate set of practice questions.
    // Allowed interactive question types: ${['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'].filter(c => !avoidComponents.includes(c)).join(', ')}.
  ],
  "exam": [
    // Array of interactive exam sections containing a separate set of exam questions.
    // Allowed interactive question types: ${['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'].filter(c => !avoidComponents.includes(c)).join(', ')}.
  ]
}

**Required fields**
- page: required
- learn: required
- practice: required
- exam: required

Available Section Types (you MUST format them exactly like this):

1. Text Section:
{
  "type": "text",
  "title": "Section Title",
  "content": "Rich markdown content. Supports **bold**, *italic*, \`code\`, and lists."
}

2. Tabs Section:
{
  "type": "tabs",
  "title": "Section Title",
  "tabs": [
    { "label": "Tab Title 1", "content": "Markdown content for tab 1" },
    { "label": "Tab Title 2", "content": "Markdown content for tab 2" }
  ]
}

3. Accordion Section:
{
  "type": "accordion",
  "title": "Section Title",
  "accordionBehavior": "multiple", // or "exclusive"
  "items": [
    { "heading": "Question/Heading 1", "content": "Answer/Content 1" },
    { "heading": "Question/Heading 2", "content": "Answer/Content 2" }
  ]
}

4. Timeline Section:
{
  "type": "timeline",
  "title": "Section Title",
  "layout": "vertical", // or "horizontal"
  "items": [
    { "date": "1995", "title": "Created", "description": "Details about creation" },
    { "date": "2015", "title": "Updated", "description": "Details about update" }
  ]
}

5. Flashcards Section:
{
  "type": "flashcards",
  "title": "Key Vocabulary",
  "cards": [
    { "front": "Term 1", "back": "Definition 1" },
    { "front": "Term 2", "back": "Definition 2" }
  ]
}

6. Quiz Section:
{
  "type": "quiz",
  "title": "Concept Check",
  "questions": [
    {
      "question": "Question 1 text?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 1, // 0-based index of correct option
      "Explanation": "Why Option B is correct",
      "optionExplanations": ["Incorrect explanation", "Correct explanation", "Incorrect explanation"] // optional, matching options length
    },
    {
      "question": "Question 2 text?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "Explanation": "Why Option A is correct"
    },
    {
      "question": "Question 3 text?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 2,
      "Explanation": "Why Option C is correct"
    },
    {
      "question": "Question 4 text?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 1,
      "Explanation": "Why Option B is correct"
    },
    {
      "question": "Question 5 text?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "Explanation": "Why Option A is correct"
    }
  ]
}

7. Fill-blank Section:
{
  "type": "fill-blank",
  "title": "Complete the Sentences",
  "instantFeedback": true, // or false
  "sentences": [
    { "text": "The sun ___ in the east.", "answer": "rises" },
    { "text": "Water boils at ___ degrees Celsius.", "answer": "100" },
    { "text": "Earth has ___ natural satellite.", "answer": "one" },
    { "text": "Light travels in a ___ line.", "answer": "straight" },
    { "text": "The moon orbits the ___.", "answer": "earth" }
  ]
}

8. Matching Section:
{
  "type": "matching",
  "title": "Match the Pairs",
  "pairs": [
    { "left": "Item Left 1", "right": "Matching Item Right 1" },
    { "left": "Item Left 2", "right": "Matching Item Right 2" },
    { "left": "Item Left 3", "right": "Matching Item Right 3" },
    { "left": "Item Left 4", "right": "Matching Item Right 4" },
    { "left": "Item Left 5", "right": "Matching Item Right 5" }
  ]
}

9. Sorting Section:
{
  "type": "sorting",
  "title": "Order the Steps",
  "items": [
    { "text": "Step 1", "correctOrder": 0 },
    { "text": "Step 2", "correctOrder": 1 },
    { "text": "Step 3", "correctOrder": 2 },
    { "text": "Step 4", "correctOrder": 3 },
    { "text": "Step 5", "correctOrder": 4 }
  ]
}

10. Checklist Section:
{
  "type": "checklist",
  "title": "Required Steps",
  "items": [
    { "text": "Essential step", "optional": false },
    { "text": "Extra credit step", "optional": true }
  ]
}

11. Cloze Section:
{
  "type": "cloze",
  "title": "Fill the Paragraph",
  "text": "The quick brown {{animal1}} jumps over the lazy {{animal2}}. The sky is {{color}}, the grass is {{green}}, and fire is {{red}}.",
  "blanks": [
    { "id": "animal1", "options": ["fox", "bear"], "correctIndex": 0, "correctAnswer": "fox", "hint": "Orange-furred wild canine" },
    { "id": "animal2", "options": ["cat", "dog"], "correctIndex": 1, "correctAnswer": "dog", "hint": "Man's best friend" },
    { "id": "color", "options": ["blue", "red"], "correctIndex": 0, "correctAnswer": "blue", "hint": "Color of a clear daytime sky" },
    { "id": "green", "options": ["green", "yellow"], "correctIndex": 0, "correctAnswer": "green", "hint": "Standard color of healthy grass" },
    { "id": "red", "options": ["red", "purple"], "correctIndex": 0, "correctAnswer": "red", "hint": "Color of fire" }
  ]
}

**Minimum limit constraints**
- quiz: >= ${MIN_CONSTRAINTS.quiz} questions
- fill-blank: >= ${MIN_CONSTRAINTS.fillBlank} sentences
- matching: >= ${MIN_CONSTRAINTS.matching} matching pairs
- sorting: >= ${MIN_CONSTRAINTS.sorting} items to sort
- cloze: >= ${MIN_CONSTRAINTS.cloze} blanks
- learn array: >= ${MIN_CONSTRAINTS.learnSections} sections
- practice array: >= ${MIN_CONSTRAINTS.practiceSections} sections
- exam array: >= ${MIN_CONSTRAINTS.examSections} sections

Generate the JSON file for the topic "${topic}". The json value of every string key must be in ${outputLang || 'English'}. Make sure the response is wrapped only in a \`\`\`json ... \`\`\` block.`;

    return prompt;
  };

  const copyToClipboard = async () => {
    try {
      const p = generatePrompt();
      await navigator.clipboard.writeText(p);
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenChatbot = async (provider: string, url: string) => {
    const success = await copyToClipboard();
    if (success) {
      addToast(t('promptWizard.toastOpening', { provider }), 'success', 3000);
    } else {
      addToast(t('promptWizard.toastOpeningSimple', { provider }), 'info', 2000);
    }
    window.open(url, '_blank');
  };

  const renderSteps = () => {
    if (mode === 'fast') {
      return (
        <div style={s.stepIndicator}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={s.stepDot(step === 1, step > 1)}>1</div>
            <span style={s.stepLabel}>{t('promptWizard.stepTopic')}</span>
          </div>
          <div style={s.stepConnector} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={s.stepDot(step === 5, false)}>2</div>
            <span style={s.stepLabel}>{t('promptWizard.stepReady')}</span>
          </div>
        </div>
      );
    }

    return (
      <div style={s.stepIndicator}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.stepDot(step === 1, step > 1)}>1</div>
          <span style={s.stepLabel}>{t('promptWizard.stepTopic')}</span>
        </div>
        <div style={s.stepConnector} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.stepDot(step === 2, step > 2)}>2</div>
          <span style={s.stepLabel}>{t('promptWizard.stepContext')}</span>
        </div>
        <div style={s.stepConnector} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.stepDot(step === 3, step > 3)}>3</div>
          <span style={s.stepLabel}>{t('promptWizard.stepDepth')}</span>
        </div>
        <div style={s.stepConnector} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.stepDot(step === 4, step > 4)}>4</div>
          <span style={s.stepLabel}>{t('promptWizard.stepAvoid')}</span>
        </div>
        <div style={s.stepConnector} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={s.stepDot(step === 5, false)}>5</div>
          <span style={s.stepLabel}>{t('promptWizard.stepReady')}</span>
        </div>
      </div>
    );
  };

  const isNextDisabled = () => {
    if (step === 1 && !topic.trim()) return true;
    return false;
  };

  return (
    <div
      ref={backdropRef}
      style={s.overlay}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div style={s.card} onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <h2 style={s.title}>✨ {t('promptWizard.title')}</h2>
          <button style={s.closeBtn} onClick={toggleCreatePrompt} aria-label="Close wizard">
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={s.body}>
          {/* Fast/Tailored Mode Selector at the top (only editable in step 1) */}
          {step === 1 && (
            <div style={s.tabsContainer}>
              <button
                type="button"
                style={s.tabButton(mode === 'fast')}
                onClick={() => setMode('fast')}
              >
                {t('promptWizard.fastPrompt')}
              </button>
              <button
                type="button"
                style={s.tabButton(mode === 'tailored')}
                onClick={() => setMode('tailored')}
              >
                {t('promptWizard.tailoredPrompt')}
              </button>
            </div>
          )}

          {/* Steps Visualizer */}
          {renderSteps()}

          {/* Step 1: Topic and Language */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label} htmlFor="topic-input">
                  {t('promptWizard.questionTopic')}
                </label>
                <input
                  id="topic-input"
                  style={s.input}
                  type="text"
                  placeholder={t('promptWizard.placeholderTopic')}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topic.trim()) {
                      handleNext();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={s.label} htmlFor="language-input">
                  {t('promptWizard.questionLanguage')}
                </label>
                <input
                  id="language-input"
                  style={s.input}
                  type="text"
                  placeholder={t('promptWizard.placeholderLanguage')}
                  value={outputLang}
                  onChange={(e) => setOutputLang(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topic.trim()) {
                      handleNext();
                    }
                  }}
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                {t('promptWizard.descTopic')}
              </p>
            </div>
          )}

          {/* Step 2: Target Context */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label}>{t('promptWizard.labelContext')}</label>
                <div style={s.selectWrapper}>
                  <button
                    type="button"
                    style={s.selectButton}
                    onClick={() => setDropdownContextOpen(!dropdownContextOpen)}
                  >
                    <span>{t(`promptWizard.contexts.${context}`)}</span>
                    <span>▼</span>
                  </button>
                  {dropdownContextOpen && (
                    <div style={s.dropdownMenu}>
                      {(['Exam', 'Academic', 'Professional/Working', 'Daily Life', 'Strategic'] as ContextType[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          style={s.dropdownItem(context === opt)}
                          onClick={() => {
                            setContext(opt);
                            setDropdownContextOpen(false);
                          }}
                        >
                          {t(`promptWizard.contexts.${opt}`)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Explanation */}
              <div style={s.explanationCard}>
                <strong>💡 {t('promptWizard.explanation')}</strong>
                <p style={{ margin: '4px 0 0 0' }}>{t(`promptWizard.contextExplanations.${context}`)}</p>
              </div>
            </div>
          )}

          {/* Step 3: Content Depth */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label}>{t('promptWizard.labelDepth')}</label>
                <div style={s.selectWrapper}>
                  <button
                    type="button"
                    style={s.selectButton}
                    onClick={() => setDropdownDepthOpen(!dropdownDepthOpen)}
                  >
                    <span>{t(`promptWizard.depths.${depth}`)}</span>
                    <span>▼</span>
                  </button>
                  {dropdownDepthOpen && (
                    <div style={s.dropdownMenu}>
                      {(['Low', 'Medium', 'High'] as DepthType[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          style={s.dropdownItem(depth === opt)}
                          onClick={() => {
                            setDepth(opt);
                            setDropdownDepthOpen(false);
                          }}
                        >
                          {t(`promptWizard.depths.${opt}`)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Explanation */}
              <div style={s.explanationCard}>
                <strong>💡 {t('promptWizard.explanation')}</strong>
                <p style={{ margin: '4px 0 0 0' }}>{t(`promptWizard.depthExplanations.${depth}`)}</p>
              </div>
            </div>
          )}

          {/* Step 4: Avoid Graded Components */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label}>{t('promptWizard.avoidStep.question')}</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {t('promptWizard.avoidStep.description')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {(['quiz', 'fill-blank', 'matching', 'sorting', 'cloze'] as const).map((comp) => {
                    const isAvoided = avoidComponents.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          if (isAvoided) {
                            setAvoidComponents(avoidComponents.filter((c) => c !== comp));
                          } else {
                            if (avoidComponents.length < 4) {
                              setAvoidComponents([...avoidComponents, comp]);
                            } else {
                              addToast(t('promptWizard.avoidStep.limitWarning'), 'warning', 3000);
                            }
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 8,
                          border: isAvoided ? '1px solid var(--error, #ef4444)' : '1px solid var(--border-color)',
                          background: isAvoided ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                          color: isAvoided ? 'var(--text-muted)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left' as const,
                          transition: 'all 0.15s ease',
                          outline: 'none',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              textDecoration: isAvoided ? 'line-through' : 'none',
                              fontWeight: isAvoided ? 500 : 600,
                              opacity: isAvoided ? 0.6 : 1,
                            }}
                          >
                            {t(`promptWizard.avoidStep.components.${comp}`)}
                          </span>
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: isAvoided ? 'rgba(239, 68, 68, 0.1)' : 'var(--accent-light)',
                            color: isAvoided ? 'var(--error, #ef4444)' : 'var(--accent)',
                            border: isAvoided ? '1px solid var(--error, #ef4444)' : 'none',
                          }}
                        >
                          {isAvoided ? t('promptWizard.avoidStep.avoidLabel') : t('promptWizard.avoidStep.allowLabel')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Ready & AI Model Redirection */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={s.label}>{t('promptWizard.labelPrompt')}</label>
                <textarea
                  style={s.textarea}
                  readOnly
                  value={generatePrompt()}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={async () => {
                    const success = await copyToClipboard();
                    if (success) {
                      addToast(t('promptWizard.toastCopied'), 'success', 2000);
                    } else {
                      addToast(t('promptWizard.toastCopyFailed'), 'error', 2000);
                    }
                  }}
                  style={{
                    padding: '0.75rem',
                    border: 'none',
                    borderRadius: 8,
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: '0.9375rem',
                  }}
                >
                  📋 {t('promptWizard.btnCopy')}
                </button>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0' }}>
                  {t('promptWizard.descChatbot')}
                </div>

                <div style={s.modelGrid}>
                  <button
                    type="button"
                    style={s.modelButton}
                    onClick={() => handleOpenChatbot('Claude', 'https://claude.ai/')}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🤖</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Claude</span>
                  </button>

                  <button
                    type="button"
                    style={s.modelButton}
                    onClick={() => handleOpenChatbot('Gemini', 'https://gemini.google.com/')}
                  >
                    <span style={{ fontSize: '1.25rem' }}>✨</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini</span>
                  </button>

                  <button
                    type="button"
                    style={s.modelButton}
                    onClick={() => handleOpenChatbot('ChatGPT', 'https://chatgpt.com/')}
                  >
                    <span style={{ fontSize: '1.25rem' }}>💬</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ChatGPT</span>
                  </button>

                  <button
                    type="button"
                    style={s.modelButton}
                    onClick={() => handleOpenChatbot('Deepseek', 'https://chat.deepseek.com/')}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🐋</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Deepseek</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer — persistent across all steps */}
          <div
            style={{
              marginTop: 'auto',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: t('promptWizard.disclaimer') }} />
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          {step > 1 ? (
            <button type="button" style={s.btnBack} onClick={handleBack}>
              ◀ {t('promptWizard.btnBack')}
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              style={s.btnNext(isNextDisabled())}
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              {t('promptWizard.btnNext')} ▶
            </button>
          ) : (
            <button type="button" style={s.btnBack} onClick={toggleCreatePrompt}>
              {t('promptWizard.btnClose')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
