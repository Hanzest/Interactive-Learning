import type { AppState, AppAction } from '../types/state';
import type { LearningPage, LearningMode } from '../types/schema';
import { computeContentHash } from '../utils/contentHash';
import { storage } from '../utils/storage';

/** Ensure a page has _meta and a unique ID */
function ensureMeta(page: LearningPage): LearningPage {
  if (!page._meta) page._meta = {};
  if (!page._meta.id) {
    page._meta.id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
  return page;
}

export const initialState: AppState = {
  pages: [],
  currentPageIndex: -1,
  darkMode: false,
  isLoading: false,
  error: null,
  showShortcuts: false,
  showDashboard: false,
  showCreatePrompt: false,
  sidebarOpen: false,
  searchQuery: '',
  renamingIndex: null,
  contextMenu: null,
  pageHashes: {},
  viewedPages: [],
  quizScores: {},
  toasts: [],
  nextToastId: 0,
  pomodoroMode: 'focus',
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroSeconds: 0,
  pomodoroIsRunning: false,
  learningMode: storage.load<LearningMode>('learningMode', 'learn'),
  sectionAnswers: storage.load<Record<string, Record<number, any>>>('sectionAnswers', {}),
  examSubmittedPages: storage.load<Record<string, boolean>>('examSubmittedPages', {}),
  examTimeLeft: storage.load<Record<string, number>>('examTimeLeft', {}),
  examPaused: {},
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    /* ---- Page Management ---- */
    case 'ADD_PAGE': {
      const { page, hash } = action.payload;
      const contentHash = hash || computeContentHash(page);
      if (contentHash && state.pageHashes[contentHash]) {
        return state; // duplicate detected upstream
      }
      const newHashes = contentHash
        ? { ...state.pageHashes, [contentHash]: true }
        : state.pageHashes;
      const newPages = [...state.pages, ensureMeta(page)];
      return {
        ...state,
        pages: newPages,
        pageHashes: newHashes,
        currentPageIndex: state.currentPageIndex === -1 ? 0 : state.currentPageIndex,
        error: null,
      };
    }

    case 'REMOVE_PAGE': {
      const { index } = action.payload;
      if (index < 0 || index >= state.pages.length) return state;
      const removedPage = state.pages[index];
      // Strip _meta so hash matches the one computed on ADD_PAGE (which was computed
      // before ensureMeta injected _meta into the stored copy).
      const { _meta, ...pageContent } = removedPage;
      const removedHash = computeContentHash(pageContent);
      const newPages = state.pages.filter((_, i) => i !== index);
      const newHashes = { ...state.pageHashes };
      if (removedHash) delete newHashes[removedHash];

      let newIndex = state.currentPageIndex;
      if (newPages.length === 0) {
        newIndex = -1;
      } else if (state.currentPageIndex >= newPages.length) {
        newIndex = newPages.length - 1;
      } else if (index < state.currentPageIndex) {
        newIndex = state.currentPageIndex - 1;
      }

      return {
        ...state,
        pages: newPages,
        pageHashes: newHashes,
        currentPageIndex: newIndex,
      };
    }

    case 'REMOVE_ALL_PAGES': {
      return {
        ...state,
        pages: [],
        pageHashes: {},
        currentPageIndex: -1,
        viewedPages: [],
        quizScores: {},
      };
    }

    case 'RENAME_PAGE': {
      const { index, title } = action.payload;
      if (index < 0 || index >= state.pages.length) return state;
      const newPages = state.pages.map((p, i) => {
        if (i !== index) return p;
        const updated = { ...p };
        if (!updated.page) updated.page = {};
        updated.page = { ...updated.page, title: title.trim() };
        return updated;
      });
      return { ...state, pages: newPages };
    }

    case 'TOGGLE_PAGE_COMPLETE': {
      const { index } = action.payload;
      if (index < 0 || index >= state.pages.length) return state;
      const newPages = state.pages.map((p, i) => {
        if (i !== index) return p;
        const updated = { ...p, _meta: { ...p._meta } };
        updated._meta!.completed = !updated._meta!.completed;
        return updated;
      });
      return { ...state, pages: newPages };
    }

    case 'MOVE_PAGE': {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex < 0 || fromIndex >= state.pages.length) return state;
      if (toIndex < 0 || toIndex >= state.pages.length) return state;
      const newPages = [...state.pages];
      const [item] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, item);
      let newIndex = state.currentPageIndex;
      if (state.currentPageIndex === fromIndex) {
        newIndex = toIndex;
      }
      return { ...state, pages: newPages, currentPageIndex: newIndex };
    }

    /* ---- Navigation ---- */
    case 'GO_TO_PAGE': {
      const { index, closeSidebar } = action.payload;
      if (index < 0 || index >= state.pages.length) return state;
      const newViewed = state.viewedPages.includes(index)
        ? state.viewedPages
        : [...state.viewedPages, index];
      return {
        ...state,
        currentPageIndex: index,
        viewedPages: newViewed,
        sidebarOpen: closeSidebar ? false : state.sidebarOpen,
      };
    }

    case 'NEXT_PAGE': {
      const vis = getVisibleIndices(state);
      const cur = vis.indexOf(state.currentPageIndex);
      if (cur < vis.length - 1) {
        const nextIdx = vis[cur + 1];
        const newViewed = state.viewedPages.includes(nextIdx)
          ? state.viewedPages
          : [...state.viewedPages, nextIdx];
        return { ...state, currentPageIndex: nextIdx, viewedPages: newViewed };
      }
      return state;
    }

    case 'PREV_PAGE': {
      const vis = getVisibleIndices(state);
      const cur = vis.indexOf(state.currentPageIndex);
      if (cur > 0) {
        return { ...state, currentPageIndex: vis[cur - 1] };
      }
      return state;
    }

    case 'GO_TO_RANDOM_PAGE': {
      const vis = getVisibleIndices(state);
      if (vis.length === 0) return state;
      const unseen = vis.filter((i) => !state.viewedPages.includes(i));
      const pool = unseen.length > 0 ? unseen : vis;
      const idx = pool[Math.floor(Math.random() * pool.length)];
      const newViewed = state.viewedPages.includes(idx)
        ? state.viewedPages
        : [...state.viewedPages, idx];
      return { ...state, currentPageIndex: idx, viewedPages: newViewed };
    }

    /* ---- UI State ---- */
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'TOGGLE_DARK_MODE': {
      const newMode = !state.darkMode;
      storage.save('theme', newMode ? 'dark' : 'light');
      return { ...state, darkMode: newMode };
    }

    case 'SET_DARK_MODE': {
      storage.save('theme', action.payload ? 'dark' : 'light');
      return { ...state, darkMode: action.payload };
    }

    case 'SET_LEARNING_MODE': {
      storage.save('learningMode', action.payload);
      return { ...state, learningMode: action.payload };
    }

    case 'SAVE_SECTION_ANSWERS': {
      const { pageIndex, sectionIndex, answers } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      const pageAnswers = state.sectionAnswers[pageId] || {};
      const newAnswers = {
        ...state.sectionAnswers,
        [pageId]: {
          ...pageAnswers,
          [sectionIndex]: answers
        }
      };
      storage.save('sectionAnswers', newAnswers);
      return {
        ...state,
        sectionAnswers: newAnswers
      };
    }

    case 'SUBMIT_EXAM': {
      const { pageIndex } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      const newSubmitted = {
        ...state.examSubmittedPages,
        [pageId]: true
      };
      storage.save('examSubmittedPages', newSubmitted);
      return {
        ...state,
        examSubmittedPages: newSubmitted
      };
    }

    case 'RETRY_EXAM': {
      const { pageIndex } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      // Remove the submitted flag for this page
      const newSubmitted = { ...state.examSubmittedPages };
      delete newSubmitted[pageId];
      // Clear all section answers for this page
      const newAnswers = { ...state.sectionAnswers };
      delete newAnswers[pageId];
      // Reset the timer for this page
      const newTimeLeft = { ...state.examTimeLeft };
      delete newTimeLeft[pageId];
      const newPaused = { ...state.examPaused, [pageId]: true };
      storage.save('examSubmittedPages', newSubmitted);
      storage.save('sectionAnswers', newAnswers);
      storage.save('examTimeLeft', newTimeLeft);
      return {
        ...state,
        examSubmittedPages: newSubmitted,
        sectionAnswers: newAnswers,
        examTimeLeft: newTimeLeft,
        examPaused: newPaused,
      };
    }

    case 'UPDATE_EXAM_TIME_LEFT': {
      const { pageIndex, timeLeft } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      const newTimeLeft = {
        ...state.examTimeLeft,
        [pageId]: timeLeft
      };
      storage.save('examTimeLeft', newTimeLeft);
      return {
        ...state,
        examTimeLeft: newTimeLeft
      };
    }

    case 'TOGGLE_EXAM_PAUSE': {
      const { pageIndex } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      return {
        ...state,
        examPaused: {
          ...state.examPaused,
          [pageId]: !state.examPaused[pageId],
        },
      };
    }

    case 'SET_EXAM_PAUSE': {
      const { pageIndex, paused } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      return {
        ...state,
        examPaused: {
          ...state.examPaused,
          [pageId]: paused,
        },
      };
    }

    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts };

    case 'TOGGLE_DASHBOARD':
      return { ...state, showDashboard: !state.showDashboard };

    case 'TOGGLE_CREATE_PROMPT':
      return { ...state, showCreatePrompt: !state.showCreatePrompt };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_RENAMING_INDEX':
      return { ...state, renamingIndex: action.payload };

    case 'SET_CONTEXT_MENU':
      return { ...state, contextMenu: action.payload };

    /* ---- Sticky Notes ---- */
    case 'SAVE_NOTE': {
      const { pageIndex, sectionIndex, text } = action.payload;
      if (pageIndex < 0 || pageIndex >= state.pages.length) return state;
      const newPages = state.pages.map((p, i) => {
        if (i !== pageIndex) return p;
        const updated = { ...p, _meta: { ...p._meta } };
        if (!updated._meta!.notes) updated._meta!.notes = {};
        if (text.trim()) {
          updated._meta!.notes![sectionIndex] = text.trim();
        } else {
          delete updated._meta!.notes![sectionIndex];
        }
        return updated;
      });
      return { ...state, pages: newPages };
    }

    /* ---- Quiz Scores ---- */
    case 'RECORD_QUIZ_SCORE': {
      const { pageIndex, sectionIndex, correct, total } = action.payload;
      const pageId = state.pages[pageIndex]?._meta?.id || String(pageIndex);
      const key = `${pageId}-${sectionIndex}`;
      const newScores = { ...state.quizScores, [key]: { correct, total } };
      storage.save('quizScores', newScores);
      return { ...state, quizScores: newScores };
    }

    /* ---- Checklist ---- */
    case 'SAVE_CHECKLIST': {
      const { pageIndex, sectionIndex, checked } = action.payload;
      if (pageIndex < 0 || pageIndex >= state.pages.length) return state;
      const newPages = state.pages.map((p, i) => {
        if (i !== pageIndex) return p;
        const updated = { ...p, _meta: { ...p._meta } };
        if (!updated._meta!.checklist) updated._meta!.checklist = {};
        updated._meta!.checklist![sectionIndex] = { ...checked };
        return updated;
      });
      return { ...state, pages: newPages };
    }

    /* ---- Flashcards ---- */
    case 'SAVE_FLASHCARD_PROGRESS': {
      const { pageIndex, sectionIndex, cardIndex, known } = action.payload;
      if (pageIndex < 0 || pageIndex >= state.pages.length) return state;
      const newPages = state.pages.map((p, i) => {
        if (i !== pageIndex) return p;
        const updated = { ...p, _meta: { ...p._meta } };
        if (!updated._meta!.flashcardProgress) updated._meta!.flashcardProgress = {};
        if (!updated._meta!.flashcardProgress[sectionIndex]) updated._meta!.flashcardProgress[sectionIndex] = {};
        updated._meta!.flashcardProgress[sectionIndex][cardIndex] = { known };
        return updated;
      });
      return { ...state, pages: newPages };
    }

    /* ---- Toasts ---- */
    case 'ADD_TOAST': {
      const id = state.nextToastId;
      const { message, type, duration = 4000, undo = null } = action.payload;
      return {
        ...state,
        toasts: [...state.toasts, { id, message, type, duration, undo }],
        nextToastId: id + 1,
      };
    }

    case 'DISMISS_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    }

    case 'UNDO_TOAST': {
      const toast = state.toasts.find((t) => t.id === action.payload.id);
      if (toast && toast.undo) {
        toast.undo();
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    }

    /* ---- Session Restore ---- */
    case 'RESTORE_SESSION': {
      const { pages, hashes, currentPageIndex, viewedPages, quizScores, completedPages } = action.payload;
      const restoredPages = pages.map((p, idx) => {
        const updated = ensureMeta({ ...p });
        if (completedPages.includes(idx)) {
          if (!updated._meta) updated._meta = {};
          updated._meta.completed = true;
        }
        return updated;
      });

      // Migrate legacy numerical keys in sectionAnswers, examSubmittedPages, examTimeLeft
      const migratedAnswers: Record<string, Record<number, any>> = {};
      const migratedSubmitted: Record<string, boolean> = {};
      const migratedTimeLeft: Record<string, number> = {};
      const migratedScores: Record<string, { correct: number; total: number }> = {};

      restoredPages.forEach((page, idx) => {
        const pageId = page._meta!.id!; // guaranteed by ensureMeta
        
        // 1. sectionAnswers
        const oldAnswers = state.sectionAnswers[idx] || state.sectionAnswers[pageId];
        if (oldAnswers) {
          migratedAnswers[pageId] = oldAnswers;
        }

        // 2. examSubmittedPages
        const oldSubmitted = state.examSubmittedPages[idx] !== undefined ? state.examSubmittedPages[idx] : state.examSubmittedPages[pageId];
        if (oldSubmitted !== undefined) {
          migratedSubmitted[pageId] = oldSubmitted;
        }

        // 3. examTimeLeft
        const oldTimeLeft = state.examTimeLeft[idx] !== undefined ? state.examTimeLeft[idx] : state.examTimeLeft[pageId];
        if (oldTimeLeft !== undefined) {
          migratedTimeLeft[pageId] = oldTimeLeft;
        }
      });

      // 4. quizScores (keys look like `${pageIndex}-${sectionIndex}` or `${pageId}-${sectionIndex}`)
      const rawScores = quizScores || {};
      Object.entries(rawScores).forEach(([key, val]) => {
        const parts = key.split('-');
        if (parts.length === 2) {
          const [prefix, secIdx] = parts;
          const idxNum = Number(prefix);
          if (!isNaN(idxNum) && restoredPages[idxNum]) {
            const pageId = restoredPages[idxNum]._meta!.id!;
            migratedScores[`${pageId}-${secIdx}`] = val as any;
          } else {
            // Already a string key/pageId key, keep it
            migratedScores[key] = val as any;
          }
        }
      });

      // Clean up any remaining non-migrated items that might already be using the correct string IDs
      Object.entries(state.sectionAnswers).forEach(([key, val]) => {
        if (isNaN(Number(key)) && !migratedAnswers[key]) {
          migratedAnswers[key] = val;
        }
      });
      Object.entries(state.examSubmittedPages).forEach(([key, val]) => {
        if (isNaN(Number(key)) && !migratedSubmitted[key]) {
          migratedSubmitted[key] = val;
        }
      });
      Object.entries(state.examTimeLeft).forEach(([key, val]) => {
        if (isNaN(Number(key)) && !migratedTimeLeft[key]) {
          migratedTimeLeft[key] = val;
        }
      });

      // Save migrated data to localStorage
      storage.save('sectionAnswers', migratedAnswers);
      storage.save('examSubmittedPages', migratedSubmitted);
      storage.save('examTimeLeft', migratedTimeLeft);

      return {
        ...state,
        pages: restoredPages,
        pageHashes: hashes,
        currentPageIndex,
        viewedPages,
        sectionAnswers: migratedAnswers,
        examSubmittedPages: migratedSubmitted,
        examTimeLeft: migratedTimeLeft,
        quizScores: migratedScores,
      };
    }

    /* ---- Pomodoro ---- */
    case 'POMODORO_TICK': {
      const totalSec = state.pomodoroMode === 'focus'
        ? state.pomodoroFocusMinutes * 60
        : state.pomodoroBreakMinutes * 60;
      const newSec = state.pomodoroSeconds + 1;
      const isDone = newSec >= totalSec;
      return {
        ...state,
        pomodoroSeconds: isDone ? totalSec : newSec,
        pomodoroIsRunning: isDone ? false : state.pomodoroIsRunning,
      };
    }

    case 'POMODORO_START': {
      const totalSec = state.pomodoroMode === 'focus'
        ? state.pomodoroFocusMinutes * 60
        : state.pomodoroBreakMinutes * 60;
      const sec = state.pomodoroSeconds >= totalSec ? 0 : state.pomodoroSeconds;
      return { ...state, pomodoroIsRunning: true, pomodoroSeconds: sec };
    }

    case 'POMODORO_PAUSE':
      return { ...state, pomodoroIsRunning: false };

    case 'POMODORO_RESET':
      return { ...state, pomodoroSeconds: 0, pomodoroIsRunning: false };

    case 'POMODORO_SWITCH_MODE': {
      const newMode = state.pomodoroMode === 'focus' ? 'break' : 'focus';
      return {
        ...state,
        pomodoroMode: newMode,
        pomodoroSeconds: 0,
        pomodoroIsRunning: false,
      };
    }

    case 'POMODORO_SET_REMAINING': {
      const remaining = action.payload;
      const mode = state.pomodoroMode;
      let focusMins = state.pomodoroFocusMinutes;
      let breakMins = state.pomodoroBreakMinutes;
      
      if (mode === 'focus') {
        const totalSec = focusMins * 60;
        if (remaining > totalSec) {
          focusMins = Math.ceil(remaining / 60);
        }
        const newTotalSec = focusMins * 60;
        return {
          ...state,
          pomodoroFocusMinutes: focusMins,
          pomodoroSeconds: newTotalSec - remaining,
        };
      } else {
        const totalSec = breakMins * 60;
        if (remaining > totalSec) {
          breakMins = Math.ceil(remaining / 60);
        }
        const newTotalSec = breakMins * 60;
        return {
          ...state,
          pomodoroBreakMinutes: breakMins,
          pomodoroSeconds: newTotalSec - remaining,
        };
      }
    }

    case 'POMODORO_RESTORE':
      return {
        ...state,
        pomodoroMode: action.payload.mode,
        pomodoroFocusMinutes: action.payload.focusMinutes,
        pomodoroBreakMinutes: action.payload.breakMinutes,
        pomodoroSeconds: action.payload.seconds,
      };

    default:
      return state;
  }
}

/* ---- Helpers ---- */

function pageMatches(page: LearningPage, query: string): boolean {
  const pInfo = page.page || {};
  const title = (pInfo.title || '').toLowerCase();
  const description = (pInfo.description || '').toLowerCase();
  const tags = Array.isArray(pInfo.tags) ? pInfo.tags.join(' ').toLowerCase() : '';
  return title.indexOf(query) !== -1 ||
    description.indexOf(query) !== -1 ||
    tags.indexOf(query) !== -1;
}

export function getVisibleIndices(state: AppState): number[] {
  const q = state.searchQuery.trim().toLowerCase();
  if (!q) {
    return state.pages.map((_, i) => i);
  }
  return state.pages
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => pageMatches(p, q))
    .map(({ i }) => i);
}
