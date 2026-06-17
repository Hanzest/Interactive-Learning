import React, { useRef } from 'react';
import type { TimelineSection as TimelineSectionType } from '../../types/schema';
import { renderMarkdown } from '../../utils/renderContent';

interface TimelineSectionProps {
  section: TimelineSectionType;
}

export default function TimelineSection({ section }: TimelineSectionProps) {
  const layout = section.layout || 'vertical';
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (layout === 'horizontal') {
    return (
      <div style={{
        padding: '1.5rem',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        marginBottom: '1.5rem',
      }}>
        {section.title && <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}>{section.title}</h2>}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          padding: '0.5rem 0',
        }}>
          {section.items.map((item, i) => (
            <div key={i} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '0.375rem',
              }}>{item.date}</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
              }}>{item.title}</div>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  fontSize: '0.875rem',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description) }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical layout (default)
  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
      marginBottom: '1.5rem',
    }}>
      {section.title && <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
      }}>{section.title}</h2>}
      <div style={{
        position: 'relative',
        paddingLeft: '2rem',
      }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '4px',
          bottom: '4px',
          width: '2px',
          backgroundColor: 'var(--border-color)',
        }} />
        {section.items.map((item, i) => (
          <div key={i} style={{
            position: 'relative',
            paddingBottom: '1.5rem',
            paddingLeft: '1rem',
          }}>
            <div style={{
              position: 'absolute',
              left: '-1.65rem',
              top: '4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              border: '2px solid var(--bg-primary)',
              zIndex: 1,
            }} />
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '0.25rem',
              }}>{item.date}</div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.375rem',
              }}>{item.title}</div>
              <div
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  fontSize: '0.875rem',
                }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
