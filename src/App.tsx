import React, { useRef, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useSwipeNavigation } from './hooks/useSwipeNavigation';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';
import ContentArea from './components/Layout/ContentArea';
import DashboardOverlay from './components/Overlays/DashboardOverlay';
import KeyboardShortcutsOverlay from './components/Overlays/KeyboardShortcutsOverlay';
import CreateJSONOverlay from './components/Overlays/CreateJSONOverlay';
import HelpGuideOverlay from './components/Overlays/HelpGuideOverlay';
import ContextMenu from './components/UI/ContextMenu';
import ToastContainer from './components/UI/ToastContainer';

/* ==========================================================================
   AppShell - inner component that uses hooks requiring AppContext
   ========================================================================== */

function AppShell() {
  const { state, nextPage, prevPage } = useAppContext();
  useKeyboardShortcuts();
  const scrollPositions = useRef<Record<number, number>>({});
  const mainRef = useRef<HTMLDivElement | null>(null);

  // Set up the swipe ref AND capture the underlying element into mainRef
  const swipeRef = useSwipeNavigation({
    threshold: 30,
    onSwipeLeft: nextPage,
    onSwipeRight: prevPage,
  });

  // Combine refs: sync swipeRef.current into mainRef
  const setMainRef = (el: HTMLDivElement | null) => {
    mainRef.current = el;
    (swipeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  };

  const prevPageIndexRef = useRef<number>(state.currentPageIndex);

  // Save/restore scroll position when navigating between pages
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    // Save scroll position of the previous page
    const prevIdx = prevPageIndexRef.current;
    if (prevIdx !== -1 && prevIdx !== state.currentPageIndex) {
      scrollPositions.current[prevIdx] = main.scrollTop;
    }

    // Restore saved scroll position for the new page (or scroll to top)
    const savedPos = scrollPositions.current[state.currentPageIndex];
    main.scrollTop = savedPos ?? 0;

    // Update the ref to the new page index
    prevPageIndexRef.current = state.currentPageIndex;
  }, [state.currentPageIndex]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      overflow: 'hidden',
    }}>
      <Header />

      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <Sidebar />

        <main
          ref={setMainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          <ContentArea />
        </main>
      </div>

      <Footer />

      {/* Overlays */}
      <DashboardOverlay />
      <KeyboardShortcutsOverlay />
      <CreateJSONOverlay />
      <HelpGuideOverlay />

      {/* Right-click Context Menu for sidebar items */}
      <ContextMenu />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}

/* ==========================================================================
   App - root component wrapping everything in AppProvider
   ========================================================================== */

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
