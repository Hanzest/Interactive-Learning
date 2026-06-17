import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import type { LearningPage } from '../../types/schema';
import { validateLearningPage } from '../../utils/validation';
import { useTranslation } from '../../hooks/useTranslation';

export default function FileUploadDropZone() {
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
          setError(t('uploadZone.errorInvalid', { filename: file.name, error: validation.error || '' }));
          return;
        }

        const ok = addPage(data, file.name);
        if (ok) {
          addToast(t('uploadZone.toastLoaded', { title: data.page?.title || 'Untitled' }), 'success', 2000);
        }
      } catch {
        setError(t('uploadZone.errorParse', { filename: file.name }));
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
    // Reset so the same files can be re-selected
    e.target.value = '';
  };

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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '32px 24px',
        border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-color)'}`,
        borderRadius: 12,
        background: dragging ? 'var(--accent-light)' : 'var(--bg-secondary)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        textAlign: 'center',
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
        width={32}
        height={32}
        style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p style={{ margin: 0, fontSize: 14, color: dragging ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: dragging ? 500 : 400 }}>
        {dragging ? t('uploadZone.dragDropActive') : t('uploadZone.dragDropPrompt')}
      </p>
      {error && <p style={{ margin: 0, fontSize: 13, color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}
