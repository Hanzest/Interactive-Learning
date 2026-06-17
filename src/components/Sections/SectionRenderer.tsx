import React from 'react';
import type { Section } from '../../types/schema';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import TextSection from './TextSection';
import TabsSection from './TabsSection';
import AccordionSection from './AccordionSection';
import TimelineSection from './TimelineSection';
import FlashcardsSection from './FlashcardsSection';
import QuizSection from './QuizSection';
import FillBlankSection from './FillBlankSection';
import MatchingSection from './MatchingSection';
import SortingSection from './SortingSection';
import ChecklistSection from './ChecklistSection';
import ClozeSection from './ClozeSection';

interface SectionRendererProps {
  section: Section;
  sectionIndex: number;
  forceSubmit?: boolean;
  onGraded?: (score: number, total: number) => void;
  isConfirmed?: boolean;
}

export default function SectionRenderer({
  section,
  sectionIndex,
  forceSubmit,
  onGraded,
  isConfirmed,
}: SectionRendererProps) {
  const { saveNote, getNote, state } = useAppContext();
  const { t } = useTranslation();
  const [showNoteEditor, setShowNoteEditor] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');

  const currentPageIndex = state.currentPageIndex;
  const savedNote = getNote(currentPageIndex, sectionIndex);

  React.useEffect(() => {
    setNoteText(savedNote || '');
  }, [savedNote]);

  const handleSaveNote = () => {
    saveNote(currentPageIndex, sectionIndex, noteText);
    setShowNoteEditor(false);
  };

  const renderSection = () => {
    switch (section.type) {
      case 'text':
        return <TextSection section={section} />;
      case 'tabs':
        return <TabsSection section={section} />;
      case 'accordion':
        return <AccordionSection section={section} />;
      case 'timeline':
        return <TimelineSection section={section} />;
      case 'flashcards':
        return <FlashcardsSection section={section} sectionIndex={sectionIndex} />;
      case 'quiz':
        return (
          <QuizSection
            section={section}
            sectionIndex={sectionIndex}
            forceSubmit={forceSubmit}
            onGraded={onGraded}
            isConfirmed={isConfirmed}
          />
        );
      case 'fill-blank':
        return (
          <FillBlankSection
            section={section}
            sectionIndex={sectionIndex}
            forceSubmit={forceSubmit}
            onGraded={onGraded}
            isConfirmed={isConfirmed}
          />
        );
      case 'matching':
        return (
          <MatchingSection
            section={section}
            sectionIndex={sectionIndex}
            forceSubmit={forceSubmit}
            onGraded={onGraded}
            isConfirmed={isConfirmed}
          />
        );
      case 'sorting':
        return (
          <SortingSection
            section={section}
            sectionIndex={sectionIndex}
            forceSubmit={forceSubmit}
            onGraded={onGraded}
            isConfirmed={isConfirmed}
          />
        );
      case 'checklist':
        return <ChecklistSection section={section} sectionIndex={sectionIndex} />;
      case 'cloze':
        return (
          <ClozeSection
            section={section}
            sectionIndex={sectionIndex}
            forceSubmit={forceSubmit}
            onGraded={onGraded}
            isConfirmed={isConfirmed}
          />
        );
      default:
        return <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('notes.unknownType')}</div>;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1.5rem',
      position: 'relative',
    }}>
      {/* Sleek section action row (completely separate from section card) */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        {/* Sticky Note Button & Editor */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNoteEditor(!showNoteEditor)}
            title={savedNote ? t('notes.editNoteTitle') : t('notes.addNoteTitle')}
            className="btn-base"
            style={{
              padding: '6px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'var(--transition-fast)',
            }}
          >
            <span>{savedNote ? '📝' : '📌'}</span>
            <span>{savedNote ? t('notes.editNote') : t('notes.addNote')}</span>
          </button>

          {showNoteEditor && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              width: '280px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              padding: '1rem',
              zIndex: 20,
            }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('notes.placeholder')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '0.5rem',
                }}
              />
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end',
              }}>
                <button
                  onClick={handleSaveNote}
                  style={{
                    padding: '0.375rem 0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {t('notes.save')}
                </button>
                <button
                  onClick={() => {
                    setShowNoteEditor(false);
                    setNoteText(savedNote || '');
                  }}
                  style={{
                    padding: '0.375rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                  }}
                >
                  {t('notes.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {renderSection()}
    </div>
  );
}
