import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import DonationOverlay from '../Overlays/DonationOverlay';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer() {
  const {
    state,
    nextPage,
    prevPage,
    completedPercent,
  } = useAppContext();

  const { t } = useTranslation();

  const [showDonate, setShowDonate] = useState(false);

  const totalPages = state.pages.length;
  const currentIndex = state.currentPageIndex;
  const hasPages = totalPages > 0;

  // Current position (1-indexed)
  const position = hasPages ? currentIndex + 1 : 0;

  // Viewed count
  const viewedCount = state.viewedPages.length;

  return (
    <>
      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-color)',
          minHeight: '3.25rem',
          transition: 'background-color var(--transition-normal)',
          flexWrap: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {/* Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          {/* Previous */}
          <button
            onClick={prevPage}
            disabled={!hasPages || currentIndex <= 0}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: (!hasPages || currentIndex <= 0) ? 'not-allowed' : 'pointer',
              opacity: (!hasPages || currentIndex <= 0) ? 0.4 : 1,
              fontSize: '0.9rem',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            aria-label="Previous page"
            title={t('footer.prev')}
          >
            ◀
          </button>

          {/* Page position */}
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              minWidth: '2.5rem',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hasPages ? `${position}/${totalPages}` : '-'}
          </span>

          {/* Next */}
          <button
            onClick={nextPage}
            disabled={!hasPages || currentIndex >= totalPages - 1}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: (!hasPages || currentIndex >= totalPages - 1) ? 'not-allowed' : 'pointer',
              opacity: (!hasPages || currentIndex >= totalPages - 1) ? 0.4 : 1,
              fontSize: '0.9rem',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            aria-label="Next page"
            title={t('footer.next')}
          >
            ▶
          </button>
        </div>

        {/* Support/Donate button */}
        <button
          onClick={() => setShowDonate(true)}
          className="btn-base"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.375rem 0.625rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.08)',
            color: 'var(--error)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.75rem',
            transition: 'all 0.15s ease',
            flexShrink: 0,
            marginLeft: '0.25rem',
          }}
          title={t('footer.donateTitle')}
        >
          ❤️ {t('footer.donate')}
        </button>

        {/* Spacer to push progress bar/creator details to the right */}
        <div style={{ flex: 1 }} />

        {/* Creator Credit - hides globally on narrow screen via global.css .footer-creator */}
        <span className="footer-creator" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {t('welcomePage.createdBy')}{' '}
          <a
            href="https://github.com/Hanzest"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Mingsy Hồ
          </a>
        </span>

        {/* Progress bar and Viewed Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: '4rem' }}>
            {/* The progress bar line itself (hide/shrink on very small screens to fit 400px width) */}
            <div
              style={{
                width: '3.5rem',
                height: '0.375rem',
                borderRadius: '0.25rem',
                background: 'var(--bg-tertiary)',
                overflow: 'hidden',
                display: 'block',
              }}
              className="footer-progress-bar-track"
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: '0.25rem',
                  background: 'var(--accent)',
                  transition: 'width var(--transition-normal)',
                  width: `${completedPercent}%`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {completedPercent}%
            </span>
          </div>

          {/* Viewed count */}
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
            className="footer-viewed-count"
          >
            {viewedCount} {t('footer.viewed')}
          </span>
        </div>
      </footer>

      {showDonate && (
        <DonationOverlay onClose={() => setShowDonate(false)} />
      )}
    </>
  );
}
