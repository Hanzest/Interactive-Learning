import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const FEEDBACK_URL = 'https://forms.gle/Z9wA4h7m1RdMgHC48';
const RESPONSES_API =
  'https://script.google.com/macros/s/AKfycbyVOAXQf6JdJMll1Oba-wSXUyqT8gGxGJwtae_spd5KEdhuKE7PpKGrZnpY4USTolgy/exec';

/* ─────────────────────────────────────────────────────────────────────────────
   Module-level shared promise so every mounted instance subscribes to the
   SAME fetch, not each one independently. Previously a boolean `fetchAttempted`
   flag was used, which caused the second instance to skip the fetch and stay
   stuck at "Loading..." forever because only the first instance got setCount()
   called on it.
───────────────────────────────────────────────────────────────────────────── */
let sharedFetchPromise: Promise<number | null> | null = null;
let cachedResult: number | null = null;

/**
 * Parse the response count from whatever shape the Apps Script returns.
 * Handles: { count }, { responseCount }, { total }, { responses } (number or array)
 */
function extractCount(data: unknown): number | null {
  if (data === null || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  for (const key of ['count', 'responseCount', 'total', 'responses']) {
    const v = d[key];
    if (typeof v === 'number') return v;
    if (Array.isArray(v)) return v.length;
  }
  return null;
}

/**
 * Returns a shared Promise that resolves to the response count (or null on
 * error). Subsequent calls return the same pending/resolved Promise, so the
 * HTTP request is made exactly once per page session regardless of how many
 * FeedbackWidget instances are mounted.
 */
function getCount(): Promise<number | null> {
  // Already resolved — return immediately
  if (cachedResult !== null) return Promise.resolve(cachedResult);
  // Return the in-flight promise so all instances share one network request
  if (sharedFetchPromise) return sharedFetchPromise;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = setTimeout(() => controller?.abort(), 8000);

  sharedFetchPromise = fetch(RESPONSES_API, {
    method: 'GET',
    signal: controller?.signal ?? undefined,
  })
    .then((r) => {
      clearTimeout(timeoutId);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      const n = extractCount(data);
      cachedResult = n;
      return n;
    })
    .catch(() => {
      clearTimeout(timeoutId);
      // Reset so a retry is possible on next mount (e.g. HMR reload)
      sharedFetchPromise = null;
      return null;
    });

  return sharedFetchPromise;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */

interface FeedbackWidgetProps {
  /** 'welcome' = full card at bottom of WelcomePage; 'sidebar' = compact strip */
  variant: 'welcome' | 'sidebar';
}

export default function FeedbackWidget({ variant }: FeedbackWidgetProps) {
  const { t } = useTranslation();
  // Seed from cache so instances that mount AFTER resolution show count instantly
  const [count, setCount] = useState<number | null>(cachedResult);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Already have the answer from cache — no need to wait for a promise
    if (cachedResult !== null) {
      setCount(cachedResult);
      return;
    }

    let cancelled = false;

    getCount().then((n) => {
      if (cancelled) return;
      if (n !== null) {
        setCount(n);
      } else {
        setLoadError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Sidebar (compact) ── */
  if (variant === 'sidebar') {
    return (
      <div
        style={{
          padding: '0.625rem 0.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            💬 {t('feedback.sidebarTitle')}
          </span>

          {/* Show count or subtle loading indicator — hidden on error */}
          {!loadError && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {count !== null ? t('feedback.responses', { count }) : t('feedback.loading')}
            </span>
          )}
        </div>

        <a
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            width: '100%',
            padding: '0.4375rem 0.625rem',
            border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
            borderRadius: '0.5rem',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: '0.75rem',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent-light)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)';
          }}
        >
          {t('feedback.sidebarCta')}
        </a>
      </div>
    );
  }

  /* ── Welcome Page (full card) ── */
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '2rem auto 2rem',
        borderRadius: '1rem',
        border: '1px solid color-mix(in srgb, var(--accent) 25%, var(--border-color))',
        background: 'var(--bg-secondary)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            💬 {t('feedback.title')}
          </span>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {t('feedback.subtitle')}
          </span>
        </div>

        {/* Response count badge — only shown when count loaded successfully */}
        {count !== null && (
          <span
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.625rem',
              borderRadius: '2rem',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            }}
          >
            ✓ {t('feedback.responses', { count })}
          </span>
        )}

        {/* Loading pill — shown only while fetching */}
        {count === null && !loadError && (
          <span
            style={{
              flexShrink: 0,
              padding: '0.25rem 0.625rem',
              borderRadius: '2rem',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border-color)',
            }}
          >
            {t('feedback.loading')}
          </span>
        )}
      </div>

      {/* CTA button */}
      <a
        href={FEEDBACK_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
          padding: '0.625rem 1rem',
          borderRadius: '0.625rem',
          background: 'var(--accent)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.875rem',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.filter = 'brightness(1.1)';
          (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-sm)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.filter = '';
          (e.currentTarget as HTMLAnchorElement).style.transform = '';
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
        }}
      >
        {t('feedback.cta')}
      </a>
    </div>
  );
}
