'use client';

import { useCallback, useId, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { UploadItem } from '../types';
import { CATEGORY_LABELS, DEFAULT_CATEGORY } from '@/lib/categories';

const ACCEPTED_EXTS = '.CR2,.NEF,.ARW,.DNG,.JPG,.JPEG,.TIFF,.RAF';

const STATUS_COLORS: Record<string, string> = {
  done:      'var(--db-teal)',
  uploading: 'var(--db-blue)',
  queued:    'var(--db-text-dim)',
  error:     'var(--db-red)',
};

const STATUS_LABELS: Record<string, string> = {
  done:      'done',
  uploading: 'uploading',
  queued:    'queued',
  error:     'error',
};

export default function UploadZone() {
  const { uploads, addUpload, updateUpload } = useDashboard();
  const inputId = useId();
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File, itemId: string) => {
      // Mark as uploading
      updateUpload(itemId, { status: 'uploading', progress: 10 });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        // Simulate progress ticks while fetch runs
        let progress = 10;
        const ticker = setInterval(() => {
          progress = Math.min(progress + 15, 85);
          updateUpload(itemId, { progress });
        }, 400);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(ticker);

        if (res.ok) {
          updateUpload(itemId, { status: 'done', progress: 100 });
        } else {
          updateUpload(itemId, { status: 'error', progress: 0 });
        }
      } catch {
        updateUpload(itemId, { status: 'error', progress: 0 });
      }
    },
    [category, updateUpload]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        const item: UploadItem = {
          id: `u-${Date.now()}-${Math.random()}`,
          filename: file.name,
          status: 'queued',
          progress: 0,
        };
        addUpload(item);
        // Start upload immediately
        uploadFile(file, item.id);
      });
    },
    [addUpload, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Category selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--db-font-mono)',
          color: 'var(--db-text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            background: 'var(--db-surface2)',
            border: '1px solid var(--db-border)',
            borderRadius: 6,
            color: 'var(--db-text)',
            fontFamily: 'var(--db-font-mono)',
            fontSize: 11,
            padding: '4px 10px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        style={{
          background: dragOver ? 'var(--db-accent-dim2)' : 'var(--db-surface)',
          border: `1px dashed ${dragOver ? 'rgba(200,245,100,0.5)' : 'var(--db-border-accent)'}`,
          borderRadius: 'var(--db-radius-lg)',
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!dragOver) {
            e.currentTarget.style.borderColor = 'rgba(200,245,100,0.3)';
            e.currentTarget.style.background = 'var(--db-accent-dim2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!dragOver) {
            e.currentTarget.style.borderColor = 'var(--db-border-accent)';
            e.currentTarget.style.background = 'var(--db-surface)';
          }
        }}
      >
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_EXTS}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{
          fontSize: 24,
          color: 'var(--db-accent)',
          marginBottom: 8,
        }}>
          ↑
        </div>
        <div style={{
          fontSize: 12,
          color: 'var(--db-text-muted)',
          marginBottom: 4,
        }}>
          Drop RAW files, JPEGs, or batch folders
        </div>
        <div style={{
          fontSize: 10,
          color: 'var(--db-text-dim)',
          fontFamily: 'var(--db-font-mono)',
        }}>
          Supported: .CR2 .NEF .ARW .DNG .JPG .TIFF
        </div>
      </div>

      {/* Queue */}
      <div style={{
        background: 'var(--db-surface2)',
        border: '1px solid var(--db-border)',
        borderRadius: 'var(--db-radius)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid var(--db-border)',
        }}>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--db-font-mono)',
            color: 'var(--db-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Upload Queue
          </span>
          <span style={{
            fontSize: 10,
            fontFamily: 'var(--db-font-mono)',
            color: uploads.filter(u => u.status === 'done').length > 0
              ? 'var(--db-teal)'
              : 'var(--db-text-dim)',
          }}>
            {uploads.filter(u => u.status === 'done').length}/{uploads.length} done
          </span>
        </div>

        {uploads.length === 0 ? (
          <div style={{
            padding: '14px 12px',
            fontSize: 11,
            color: 'var(--db-text-dim)',
            fontFamily: 'var(--db-font-mono)',
          }}>
            No uploads queued
          </div>
        ) : (
          uploads.slice(0, 6).map((item) => (
            <UploadRow key={item.id} item={item} />
          ))
        )}
      </div>

    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadRow({ item }: { item: UploadItem }) {
  const color = STATUS_COLORS[item.status];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      borderBottom: '1px solid var(--db-border)',
    }}>
      {/* Icon */}
      <span style={{ fontSize: 14, flexShrink: 0 }}>📷</span>

      {/* Filename */}
      <span style={{
        flex: 1,
        fontSize: 11,
        color: 'var(--db-text)',
        fontFamily: 'var(--db-font-mono)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {item.filename}
      </span>

      {/* Progress bar */}
      {item.status === 'uploading' && (
        <div style={{
          width: 60,
          height: 3,
          background: 'var(--db-surface3)',
          borderRadius: 2,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            width: `${item.progress}%`,
            height: '100%',
            background: 'var(--db-blue)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}

      {/* Status label */}
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--db-font-mono)',
        color,
        flexShrink: 0,
      }}>
        {item.status === 'uploading'
          ? `${item.progress}%`
          : STATUS_LABELS[item.status]}
      </span>
    </div>
  );
}
