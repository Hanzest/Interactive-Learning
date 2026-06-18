import React, { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './HelpGuideOverlay.module.css';

/* ============================================================================
   SVG Icon Components (inline — matches DarkModeToggle stroke style)
   ============================================================================ */

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <rect x="6" y="6" width="14" height="14" rx="2" opacity="0.7" />
      <rect x="4" y="4" width="14" height="14" rx="2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="16 7 12 3 8 7" />
      <polyline points="16 17 12 21 8 17" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

/* ============================================================================
   Visual mockup sub-components
   ============================================================================ */

/** Step 1: Interactive section types mini-grid */
function InteractiveTypesMockup() {
  const types = [
    { icon: <LayersIcon />, label: '3D Flashcards' },
    { icon: <LinkIcon />, label: 'Matching' },
    { icon: <DocIcon />, label: 'Cloze' },
    { icon: <SortIcon />, label: 'Sorting' },
    { icon: <PencilIcon />, label: 'Fill-blank' },
    { icon: <ChartIcon />, label: 'Quiz' },
  ];
  return (
    <div className={styles.typeGrid}>
      {types.map((t) => (
        <div key={t.label} className={styles.typeCard}>
          {t.icon}
          <span className={styles.typeLabel}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Step 2: Wizard button mockup — keeps colored sparkle emoji to match real sidebar */
function WizardButtonMockup() {
  return (
    <div className={styles.wizardBtn}>
      <span>✨</span> Create JSON with Prompt Wizard
    </div>
  );
}

/** Step 3: Mode switcher (left) + Upload icon (right), same row */
function UploadAndModesMockup() {
  const [selectedMode, setSelectedMode] = React.useState('learn');

  return (
    <div className={styles.uploadRow}>
      {/* Mode switcher — left side */}
      <div className={styles.mockModeSwitcher}>
        {(['learn', 'practice', 'exam'] as const).map((m) => {
          const isActive = selectedMode === m;
          const label = m.charAt(0).toUpperCase() + m.slice(1);
          return (
            <button
              key={m}
              className={isActive ? styles.mockModePillActive : styles.mockModePill}
              onClick={() => setSelectedMode(m)}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* Upload icon square — right side */}
      <div className={styles.uploadBtnSquare}>
        <UploadIcon />
      </div>
    </div>
  );
}

/** Step 4: Sidebar management mockup — matches real PageListItem style */
function SidebarMockup() {
  const pages = [
    { title: 'React Hooks', done: true },
    { title: 'Photosynthesis', done: false },
    { title: 'WW2 Timeline', done: false },
  ];

  return (
    <div className={styles.sidebarMockup}>
      <div className={styles.sidebarHeader}>
        <span className={styles.iconBtnSmall}><HamburgerIcon /></span>
        Pages · 3
      </div>
      {pages.map((p, i) => (
        <div key={i} className={`${styles.sidebarItem}${p.done ? ` ${styles.sidebarItemDone}` : ''}`}>
          <span className={styles.sidebarItemIcon}>
            {p.done ? (
              <span className={styles.completedBadge}>✓</span>
            ) : (
              <span className={styles.incompleteDot} />
            )}
          </span>
          <span className={styles.sidebarItemTitle}>{p.title}</span>
          <span className={styles.sidebarItemMenu}><DotsIcon /></span>
        </div>
      ))}
    </div>
  );
}

/** Step 5: Top bar controls mockup — matches Header/DarkModeToggle icon style */
function TopBarControlsMockup() {
  return (
    <div className={styles.topBarMockup}>
      <span className={styles.borderedIcon}><HamburgerIcon /></span>
      <span className={styles.topBarTitle}>
        <span>📚</span> Learn
      </span>
      <span className={styles.borderedIcon}><DashboardIcon /></span>
      <span className={styles.borderedIcon}><MoonIcon /></span>
      <span className={styles.langPill}>EN</span>
      <span className={styles.borderedIcon}><UploadIcon /></span>
    </div>
  );
}

/* ============================================================================
   Main Component
   ============================================================================ */

interface GuideSlide {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  Demo?: React.FC;
}

export default function HelpGuideOverlay() {
  const { state, toggleHelpGuide } = useAppContext();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < 4 ? prev + 1 : prev));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Keyboard navigation: ←/a = prev, →/d = next
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        goPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        goNext();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [goPrev, goNext]);

  if (!state.showHelpGuide) return null;

  const slides: GuideSlide[] = [
    {
      icon: <TargetIcon />,
      titleKey: 'helpGuide.step1Title',
      descKey: 'helpGuide.step1Desc',
      Demo: InteractiveTypesMockup,
    },
    {
      icon: <EditIcon />,
      titleKey: 'helpGuide.step2Title',
      descKey: 'helpGuide.step2Desc',
      Demo: WizardButtonMockup,
    },
    {
      icon: <UploadIcon />,
      titleKey: 'helpGuide.step3Title',
      descKey: 'helpGuide.step3Desc',
      Demo: UploadAndModesMockup,
    },
    {
      icon: <ListIcon />,
      titleKey: 'helpGuide.step4Title',
      descKey: 'helpGuide.step4Desc',
      Demo: SidebarMockup,
    },
    {
      icon: <GearIcon />,
      titleKey: 'helpGuide.step5Title',
      descKey: 'helpGuide.step5Desc',
      Demo: TopBarControlsMockup,
    },
  ];

  const slide = slides[currentSlide];
  const totalSlides = slides.length;
  const DemoComponent = slide.Demo;

  return (
    <div className={styles.overlay} onClick={toggleHelpGuide}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* -------- Header -------- */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <BookIcon /> {t('helpGuide.title')}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={toggleHelpGuide}
            aria-label={t('helpGuide.close')}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* -------- Slide Body -------- */}
        <div className={styles.body}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className={styles.iconBadge}>{slide.icon}</div>
            <h3 className={styles.slideTitle}>{t(slide.titleKey)}</h3>
          </div>

          <p className={styles.slideDesc}>{t(slide.descKey)}</p>

          {DemoComponent && (
            <div className={styles.visualDemo}>
              {currentSlide === 1 ? (
                <div className={styles.visualDemoCentered}>
                  <DemoComponent />
                </div>
              ) : (
                <DemoComponent />
              )}
            </div>
          )}
        </div>

        {/* -------- Footer: Navigation -------- */}
        <div className={styles.footer}>
          <button
            className={styles.navBtn}
            onClick={goPrev}
            disabled={currentSlide === 0}
            aria-label="Previous slide"
            type="button"
          >
            ←
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                style={{
                  backgroundColor: i === currentSlide ? 'var(--accent)' : 'var(--border-color)',
                }}
                className={styles.dot}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                type="button"
              />
            ))}
            <span className={styles.stepIndicator}>
              {currentSlide + 1}/{totalSlides}
            </span>
          </div>

          <button
            className={styles.navBtn}
            onClick={goNext}
            disabled={currentSlide === totalSlides - 1}
            aria-label="Next slide"
            type="button"
          >
            →
          </button>
        </div>

        {/* Esc hint */}
        <div className={styles.escHint}>
          {t('shortcuts.press')} <kbd>Esc</kbd> {t('shortcuts.toClose')}
        </div>
      </div>
    </div>
  );
}
