import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { LearningPage } from '../../types/schema';
import { validateLearningPage } from '../../utils/validation';
import { useTranslation } from '../../hooks/useTranslation';

interface Props {
  variant?: 'full' | 'compact';
}

export default function FileUploadDropZone({ variant = 'full' }: Props) {
  const { addPage, addToast } = useAppContext();
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const data: LearningPage = JSON.parse(text);

        const validation = validateLearningPage(data);
        if (!validation.valid) {
          const errMsg = t('uploadZone.errorInvalid', { filename: file.name, error: validation.error || '' });
          console.error('[FileUpload] Validation failed:', errMsg);
          setError(errMsg);
          // Also show a toast for visibility outside the drop zone
          addToast(errMsg, 'error', 6000);
          return;
        }

        const ok = addPage(data, file.name);
        if (ok) {
          addToast(t('uploadZone.toastLoaded', { title: data.page?.title || 'Untitled' }), 'success', 2000);
        }
      } catch (e) {
        const errMsg = t('uploadZone.errorParse', { filename: file.name });
        console.error('[FileUpload] Parse error:', e);
        setError(errMsg);
      }
    },
    [addPage, addToast, t]
  );

  const processFiles = useCallback(
    async (files: FileList) => {
      const jsonFiles = Array.from(files).filter((f) => f.name.endsWith('.json'));
      if (jsonFiles.length === 0) {
        setError(t('uploadZone.errorSelectJson'));
        return;
      }
      for (const f of jsonFiles) {
        await processFile(f);
      }
    },
    [processFile, t]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      dragCounter.current = 0;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith('.json')
      );
      if (files.length === 0) {
        setError(t('uploadZone.errorDropJson'));
        return;
      }
      files.forEach(processFile);
    },
    [processFile, t]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    e.target.value = '';
  };

  const isCompact = variant === 'compact';

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-label={t('uploadZone.ariaLabel')}
      title={t('uploadZone.title')}
      style={{
        display: 'flex',
        flexDirection: isCompact ? undefined : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isCompact ? 0 : 12,
        width: isCompact ? 40 : undefined,
        height: isCompact ? 40 : undefined,
        padding: isCompact ? 0 : '32px 24px',
        border: `2px dashed ${dragging ? 'var(--accent)' : isCompact ? 'var(--text-muted)' : 'var(--border-color)'}`,
        borderRadius: isCompact ? 10 : 12,
        background: dragging ? 'var(--accent-light)' : isCompact ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        textAlign: isCompact ? undefined : 'center',
        flexShrink: isCompact ? 0 : undefined,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        width={isCompact ? 22 : 32}
        height={isCompact ? 22 : 32}
        style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {!isCompact && (
        <p style={{ margin: 0, fontSize: 14, color: dragging ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: dragging ? 500 : 400 }}>
          {dragging ? t('uploadZone.dragDropActive') : t('uploadZone.dragDropPrompt')}
        </p>
      )}
      {error && (
        <div style={{
          fontSize: isCompact ? 11 : 13,
          color: '#fff',
          textAlign: 'center',
          backgroundColor: 'rgba(220, 38, 38, 0.85)',
          padding: isCompact ? '3px 8px' : '8px 12px',
          borderRadius: 8,
          whiteSpace: isCompact ? 'nowrap' : 'normal',
          overflow: isCompact ? 'hidden' : undefined,
          textOverflow: isCompact ? 'ellipsis' : undefined,
          maxWidth: isCompact ? 200 : '100%',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
          ...(isCompact ? { position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)', zIndex: 10 } : { marginTop: 8, width: '100%' }),
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
