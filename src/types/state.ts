import type { LearningPage, Toast, ThemeMode, LearningMode } from './schema';

/* ==========================================================================
   AppState - the complete application state
   ========================================================================== */

export interface AppState {
  // Pages
  pages: LearningPage[];
  currentPageIndex: number;

  // UI State
  showWelcomePage: boolean;
  darkMode: boolean;
  isLoading: boolean;
  error: string | null;
  showShortcuts: boolean;
  showDashboard: boolean;
  showCreatePrompt: boolean;
  showHelpGuide: boolean;
  sidebarOpen: boolean;
  searchQuery: string;
  renamingIndex: number | null;
  contextMenu: { index: number; x: number; y: number } | null;
  pageHashes: Record<string, boolean>;

  // Progress
  viewedPages: number[];
  quizScores: Record<string, { correct: number; total: number }>;

  // Toast notifications
  toasts: Toast[];
  nextToastId: number;

  // Pomodoro
  pomodoroMode: 'focus' | 'break';
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroSeconds: number;
  pomodoroIsRunning: boolean;
  learningMode: LearningMode;
  sectionAnswers: Record<string, Record<string, any>>;
  examSubmittedPages: Record<string, boolean>;
  examTimeLeft: Record<string, number>;
  examPaused: Record<string, boolean>;
  language: 'en' | 'vi';
}

/* ==========================================================================
   Actions - discriminated union for the reducer
   ========================================================================== */

export type AppAction =
  | { type: 'ADD_PAGE'; payload: { page: LearningPage; hash?: string } }
  | { type: 'REMOVE_PAGE'; payload: { index: number } }
  | { type: 'REMOVE_ALL_PAGES' }
  | { type: 'RENAME_PAGE'; payload: { index: number; title: string } }
  | { type: 'TOGGLE_PAGE_COMPLETE'; payload: { index: number } }
  | { type: 'MOVE_PAGE'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'GO_TO_PAGE'; payload: { index: number; closeSidebar?: boolean } }
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'GO_TO_RANDOM_PAGE' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'TOGGLE_SHORTCUTS' }
  | { type: 'TOGGLE_DASHBOARD' }
  | { type: 'TOGGLE_CREATE_PROMPT' }
  | { type: 'TOGGLE_HELP_GUIDE' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RENAMING_INDEX'; payload: number | null }
  | { type: 'SET_CONTEXT_MENU'; payload: { index: number; x: number; y: number } | null }
  | { type: 'SAVE_NOTE'; payload: { pageIndex: number; sectionIndex: number; text: string } }
  | { type: 'RECORD_QUIZ_SCORE'; payload: { pageIndex: number; sectionIndex: number; correct: number; total: number } }
  | { type: 'SAVE_CHECKLIST'; payload: { pageIndex: number; sectionIndex: number; checked: Record<number, boolean> } }
  | { type: 'SAVE_FLASHCARD_PROGRESS'; payload: { pageIndex: number; sectionIndex: number; cardIndex: number; known: boolean } }
  | { type: 'ADD_TOAST'; payload: { message: string; type: 'success' | 'error' | 'warning' | 'info'; duration?: number; undo?: (() => void) | null } }
  | { type: 'DISMISS_TOAST'; payload: { id: number } }
  | { type: 'UNDO_TOAST'; payload: { id: number } }
  | { type: 'RESTORE_SESSION'; payload: { pages: LearningPage[]; hashes: Record<string, boolean>; currentPageIndex: number; viewedPages: number[]; quizScores: Record<string, { correct: number; total: number }>; completedPages: number[] } }
  | { type: 'POMODORO_TICK' }
  | { type: 'POMODORO_START' }
  | { type: 'POMODORO_PAUSE' }
  | { type: 'POMODORO_RESET' }
  | { type: 'POMODORO_SWITCH_MODE' }
  | { type: 'POMODORO_SET_REMAINING'; payload: number }
  | { type: 'POMODORO_RESTORE'; payload: { mode: 'focus' | 'break'; focusMinutes: number; breakMinutes: number; seconds: number } }
  | { type: 'SET_LEARNING_MODE'; payload: LearningMode }
  | { type: 'SAVE_SECTION_ANSWERS'; payload: { pageIndex: number; sectionIndex: number; answers: any } }
  | { type: 'SUBMIT_EXAM'; payload: { pageIndex: number } }
  | { type: 'RETRY_EXAM'; payload: { pageIndex: number } }
  | { type: 'UPDATE_EXAM_TIME_LEFT'; payload: { pageIndex: number; timeLeft: number } }
  | { type: 'TOGGLE_EXAM_PAUSE'; payload: { pageIndex: number } }
  | { type: 'SET_EXAM_PAUSE'; payload: { pageIndex: number; paused: boolean } }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'vi' }
  | { type: 'SET_SHOW_WELCOME_PAGE'; payload: boolean };

/* ==========================================================================
   Derived / Computed State (not stored, computed from state)
   ========================================================================== */

export interface AppDerivedState {
  visibleIndices: number[];
  visibleCount: number;
  currentPage: LearningPage | null;
  completedCount: number;
  completedPercent: number;
  isCurrentPageVisible: boolean;
}
