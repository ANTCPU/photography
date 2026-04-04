'use client';

import { useCallback, useId } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { UploadItem } from '../types';

const ACCEPTED_EXTS = '.CR2,.NEF,.ARW,.DNG,.JPG,.JPEG,.TIFF,.RAF';

const STATUS_COLORS: Record<UploadItem['status'], string> = {
  done:      'var(--db-teal)',
  uploading: 'var(--db-blue)',
  queued:    'var(--db-text-dim)',
  error:     'var(--db-red)',
};

const STATUS_LABELS: Record<UploadItem['status'], string> = {
  done:      'done',
  uploading: 'uploading',
  queued:    'queued',
  error:     'error',
};

export default function UploadZone() {
  const { uploads, addUpload } = useDashboard();
  const inputId = useId();

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
      });
    },
    [addUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 20,
      }}
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        style={{
          background: 'var(--db-surface)',
          border: '1px dashed var(--db-border-accent)',
          borderRadius: 'var(--db-radius-lg)',
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,245,100,0.3)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--db-accent-dim2)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--db-border-accent)';
          (e.currentTarget as HTMLDivElement).style.background = 'var(--db-surface)';
        }}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_EXTS}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: 22, marginBottom: 8 }}>↑</div>
        <div style={{ fontSize: 12, color: 'var(--db-text-muted)' }}>
          Drop RAW files, JPEGs, or batch folders
        </div>
        <div
          style={{
            fontSize: 10,
            color: 'var(--db-text-dim)',
            marginTop: 3,
            fontFamily: 'var(--db-font-mono)',
          }}
        >
          Supported: .CR2 .NEF .ARW .DNG .JPG .TIFF
        </div>
      </div>

      {/* Queue */}
      <div
        style={{
          background: 'var(--db-surface)',
          border: '1px solid var(--db-border)',
          borderRadius: 'var(--db-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--db-border)',
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--db-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>In Progress</span>
          <span
            style={{
              fontFamily: 'var(--db-font-mono)',
              fontSize: 10,
              color: 'var(--db-text-dim)',
            }}
          >
            {uploads.length} files
          </span>
        </div>

        {uploads.slice(0, 5).map((item) => (
          <UploadRow key={item.id} item={item} />
        ))}

        {uploads.length === 0 && (
          <div
            style={{
              padding: '16px 14px',
              fontSize: 11,
              color: 'var(--db-text-dim)',
              textAlign: 'center',
            }}
          >
            No uploads queued
          </div>
        )}
      </div>
    </div>
  );
}

function UploadRow({ item }: { item: UploadItem }) {
  const color = STATUS_COLORS[item.status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      <span style={{ fontSize: 12, flexShrink: 0 }}>📷</span>

      <span
        style={{
          flex: 1,
          fontSize: 11,
          color: 'var(--db-text-muted)',
          fontFamily: 'var(--db-font-mono)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {item.filename}
      </span>

      {/* Progress bar */}
      <div
        style={{
          width: 80,
          height: 3,
          background: 'var(--db-surface3)',
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 2,
            background: color,
            width: `${item.status === 'done' ? 100 : item.status === 'queued' ? 0 : item.progress}%`,
            transition: 'width 0.3s',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 10,
          fontFamily: 'var(--db-font-mono)',
          color,
          flexShrink: 0,
          minWidth: 52,
          textAlign: 'right',
        }}
      >
        {item.status === 'uploading'
          ? `${item.progress}%`
          : STATUS_LABELS[item.status]}
      </span>
    </div>
  );
}
