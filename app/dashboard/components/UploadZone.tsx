'use client'

import { useCallback, useId, useState, useEffect } from 'react'
import { useDashboard } from '../context/DashboardContext'
import type { UploadItem } from '../types'

// ── Categories API ────────────────────────────────────────────────────────────
const CATEGORIES_API = 'https://antcpu-ads.vercel.app/api/categories'

type Category = {
  slug:       string
  label:      string
  icon:       string
  group_name: string
  sort_order: number
}

type Grouped = Record<string, Category[]>

// ── File validation ───────────────────────────────────────────────────────────
const ACCEPTED_EXTS    = '.CR2,.NEF,.ARW,.DNG,.JPG,.JPEG,.PNG,.TIFF,.RAF,.WEBP,.HEIC,.HEIF'
const ACCEPTED_DISPLAY = ['CR2','NEF','ARW','DNG','JPG','PNG','TIFF','WEBP','HEIC','HEIF']
const ACCEPTED_EXT_LIST = ['cr2','nef','arw','dng','jpg','jpeg','png','tiff','raf','webp','heic','heif']
const MAX_FILE_MB = 50

const STATUS_COLORS: Record<string, string> = {
  done:      'var(--db-teal)',
  uploading: 'var(--db-blue)',
  queued:    'var(--db-text-dim)',
  error:     'var(--db-red)',
}

const STATUS_LABELS: Record<string, string> = {
  done:      '✓ done',
  uploading: '↑ uploading',
  queued:    '· queued',
  error:     '✕ error',
}

function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ACCEPTED_EXT_LIST.includes(ext)) {
    return `unsupported format — .${ext}`
  }
  const mb = file.size / (1024 * 1024)
  if (mb > MAX_FILE_MB) {
    return `file too large — ${mb.toFixed(1)} MB (max ${MAX_FILE_MB} MB)`
  }
  return null
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadZone() {
  const { uploads, addUpload, updateUpload, clearDone } = useDashboard()
  const inputId = useId()

  // ── Category state ──
  const [grouped,       setGrouped]       = useState<Grouped>({})
  const [catLoading,    setCatLoading]    = useState(true)
  const [category,      setCategory]      = useState('Portrait')
  const [customMode,    setCustomMode]    = useState(false)
  const [customValue,   setCustomValue]   = useState('')

  // ── Upload state ──
  const [dragOver,      setDragOver]      = useState(false)
  const [lastUploaded,  setLastUploaded]  = useState<string | null>(null)
  const [authError,     setAuthError]     = useState(false)

  // ── Fetch categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch(CATEGORIES_API)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.grouped) {
          setGrouped(data.grouped)
          // Set default to first category in first group
          const firstGroup = Object.values(data.grouped as Grouped)[0]
          if (firstGroup?.[0]) setCategory(firstGroup[0].label)
        }
      })
      .catch(() => {
        // Silent fail — fallback to manual entry
      })
      .finally(() => setCatLoading(false))
  }, [])

  // ── Active category label (custom or selected) ─────────────────────────────
  const activeCategory = customMode && customValue.trim()
    ? customValue.trim()
    : category

  // ── Upload logic ───────────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (file: File, itemId: string) => {
      setAuthError(false)

      const validationError = validateFile(file)
      if (validationError) {
        updateUpload(itemId, { status: 'error', progress: 0, errorMsg: validationError })
        return
      }

      updateUpload(itemId, { status: 'uploading', progress: 10 })

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', activeCategory)

        let progress = 10
        const ticker = setInterval(() => {
          progress = Math.min(progress + 15, 85)
          updateUpload(itemId, { progress })
        }, 400)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        clearInterval(ticker)

        if (res.ok) {
          updateUpload(itemId, { status: 'done', progress: 100 })
          setLastUploaded(file.name)
        } else {
          let msg = `${res.status}`
          try {
            const json = await res.json()
            if (json?.error) msg = `${res.status} — ${json.error}`
          } catch {}
          if (res.status === 401) setAuthError(true)
          updateUpload(itemId, { status: 'error', progress: 0, errorMsg: msg })
        }
      } catch {
        updateUpload(itemId, { status: 'error', progress: 0, errorMsg: 'network error — check connection' })
      }
    },
    [activeCategory, updateUpload]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      Array.from(files).forEach((file) => {
        const item: UploadItem = {
          id:       `u-${Date.now()}-${Math.random()}`,
          filename: file.name,
          status:   'queued',
          progress: 0,
        }
        addUpload(item)
        uploadFile(file, item.id)
      })
    },
    [addUpload, uploadFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleRetry = useCallback(
    (item: UploadItem) => {
      updateUpload(item.id, { status: 'queued', progress: 0, errorMsg: undefined })
    },
    [updateUpload]
  )

  const doneCount  = uploads.filter(u => u.status === 'done').length
  const errorCount = uploads.filter(u => u.status === 'error').length
  const totalCount = uploads.length

  return (
    <div style={s.root}>

      {/* ── Auth Error Banner ── */}
      {authError && (
        <div style={s.authBanner}>
          <span>🔐</span>
          <span>Upload blocked — not authenticated.</span>
          <a href="/login" style={s.authLink}>Sign in →</a>
        </div>
      )}

      {/* ── Category Selector ── */}
      <div style={s.categoryRow}>
        <span style={s.categoryLabel}>Category</span>

        <div style={s.categoryControls}>
          {/* Grouped dropdown */}
          <select
            value={customMode ? '__custom__' : category}
            onChange={e => {
              if (e.target.value === '__custom__') {
                setCustomMode(true)
                setCustomValue('')
              } else {
                setCustomMode(false)
                setCategory(e.target.value)
              }
            }}
            style={s.select}
            disabled={catLoading}
          >
            {catLoading && (
              <option value="">Loading…</option>
            )}
            {!catLoading && Object.entries(grouped).map(([group, cats]) => (
              <optgroup key={group} label={group}>
                {cats.map(c => (
                  <option key={c.slug} value={c.label}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="__custom__">＋ Custom…</option>
          </select>

          {/* Custom input — shown when custom selected */}
          {customMode && (
            <input
              type="text"
              placeholder="Type category name…"
              value={customValue}
              onChange={e => setCustomValue(e.target.value)}
              style={s.customInput}
              autoFocus
            />
          )}
        </div>

        {/* Active category indicator */}
        <span style={s.activeCat}>
          Uploading to <strong>{activeCategory}</strong>
        </span>
      </div>

      {/* ── Drop Zone ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById(inputId)?.click()}
        style={{
          ...s.dropzone,
          borderColor: dragOver ? '#c8f564' : 'rgba(255,255,255,0.1)',
          background:  dragOver ? 'rgba(200,245,100,0.04)' : 'var(--db-surface)',
          boxShadow:   dragOver ? '0 0 0 3px rgba(200,245,100,0.08)' : 'none',
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
        <div style={s.dropIcon}>{dragOver ? '⬇' : '⬆'}</div>
        <div style={s.dropTitle}>
          {dragOver ? 'Drop to upload' : 'Drop files here or click to browse'}
        </div>
        <div style={s.dropSub}>
          <span style={s.dropLimit}>max {MAX_FILE_MB} MB per file</span>
        </div>
        <div style={s.formatRow}>
          {ACCEPTED_DISPLAY.map((ext) => (
            <span key={ext} style={s.formatPill}>{ext}</span>
          ))}
        </div>
        {lastUploaded && (
          <div style={s.lastUploaded}>✓ Last: {lastUploaded}</div>
        )}
      </div>

      {/* ── Upload Queue ── */}
      <div style={s.queue}>
        <div style={s.queueHeader}>
          <span style={s.queueTitle}>Upload Queue</span>
          <div style={s.queueStats}>
            {totalCount > 0 && (
              <>
                <span style={{ fontSize: 10, color: 'var(--db-teal)',      fontFamily: 'var(--db-font-mono)' }}>✓ {doneCount}</span>
                {errorCount > 0 && (
                  <span style={{ fontSize: 10, color: 'var(--db-red)',     fontFamily: 'var(--db-font-mono)' }}>✕ {errorCount}</span>
                )}
                <span style={{ fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>/ {totalCount}</span>
              </>
            )}
            {doneCount > 0 && (
              <button onClick={clearDone} style={s.clearBtn}>clear done</button>
            )}
          </div>
        </div>

        {totalCount === 0 ? (
          <div style={s.emptyQueue}>
            <span style={s.emptyIcon}>📂</span>
            <span style={s.emptyText}>No uploads yet — drop files above</span>
          </div>
        ) : (
          <div style={s.queueList}>
            {uploads.slice(0, 8).map((item) => (
              <UploadRow key={item.id} item={item} onRetry={handleRetry} />
            ))}
            {uploads.length > 8 && (
              <div style={{ padding: '8px 14px', fontSize: 10, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' }}>
                +{uploads.length - 8} more
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Upload Row ────────────────────────────────────────────────────────────────
function UploadRow({ item, onRetry }: { item: UploadItem; onRetry: (item: UploadItem) => void }) {
  const color = STATUS_COLORS[item.status]
  return (
    <div style={s.uploadRow}>
      <div style={s.uploadLeft}>
        <div style={{ ...s.uploadDot, background: color }} />
        <div style={s.uploadNameCol}>
          <span style={s.uploadName}>{item.filename}</span>
          {item.status === 'error' && item.errorMsg && (
            <span style={s.uploadError}>{item.errorMsg}</span>
          )}
        </div>
      </div>
      <div style={s.uploadRight}>
        {item.status === 'uploading' && (
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: `${item.progress}%` }} />
          </div>
        )}
        {item.status === 'done' && (
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: '100%', background: 'var(--db-teal)' }} />
          </div>
        )}
        {item.status === 'error' && (
          <button onClick={() => onRetry(item)} style={s.retryBtn}>retry</button>
        )}
        <span style={{ ...s.uploadStatus, color }}>{STATUS_LABELS[item.status]}</span>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root:       { display: 'flex', flexDirection: 'column', gap: 12 },
  authBanner: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,94,94,0.08)', border: '1px solid rgba(255,94,94,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ff5e5e', fontFamily: 'var(--db-font-mono)' },
  authLink:   { marginLeft: 'auto', color: '#c8f564', textDecoration: 'none', fontSize: 11 },

  // Category
  categoryRow:      { display: 'flex', flexDirection: 'column', gap: 6 },
  categoryLabel:    { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', color: 'var(--db-text-dim)', textTransform: 'uppercase' },
  categoryControls: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  select:           { fontSize: 12, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 6, padding: '6px 10px', color: 'var(--db-text)', cursor: 'pointer', outline: 'none', minWidth: 180 },
  customInput:      { fontSize: 12, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface2)', border: '1px solid rgba(200,245,100,0.3)', borderRadius: 6, padding: '6px 10px', color: 'var(--db-accent)', outline: 'none', minWidth: 180 },
  activeCat:        { fontSize: 10, fontFamily: 'var(--db-font-mono)', color: 'var(--db-text-dim)' },

  // Dropzone
  dropzone:     { border: '2px dashed', borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minHeight: 180 },
  dropIcon:     { fontSize: 36, lineHeight: 1 },
  dropTitle:    { fontSize: 14, fontWeight: 600, color: 'var(--db-text)' },
  dropSub:      { fontSize: 12, color: 'var(--db-text-muted)' },
  dropLimit:    { color: 'var(--db-text-dim)', fontSize: 11 },
  formatRow:    { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 4 },
  formatPill:   { fontSize: 10, fontFamily: 'var(--db-font-mono)', background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 4, padding: '2px 7px', color: 'var(--db-text-dim)' },
  lastUploaded: { fontSize: 11, fontFamily: 'var(--db-font-mono)', color: 'var(--db-teal)', marginTop: 4 },

  // Queue
  queue:       { background: 'var(--db-surface2)', border: '1px solid var(--db-border)', borderRadius: 10, overflow: 'hidden' },
  queueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--db-border)' },
  queueTitle:  { fontSize: 10, fontFamily: 'var(--db-font-mono)', letterSpacing: '0.12em', color: 'var(--db-text-dim)', textTransform: 'uppercase' },
  queueStats:  { display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--db-font-mono)' },
  emptyQueue:  { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 14px' },
  emptyIcon:   { fontSize: 16 },
  emptyText:   { fontSize: 11, color: 'var(--db-text-dim)', fontFamily: 'var(--db-font-mono)' },
  queueList:   { display: 'flex', flexDirection: 'column' },

  // Upload rows
  uploadRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid var(--db-border)', gap: 12 },
  uploadLeft:   { display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' },
  uploadDot:    { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  uploadNameCol:{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' },
  uploadName:   { fontSize: 12, color: 'var(--db-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  uploadError:  { fontSize: 10, color: 'var(--db-red)', fontFamily: 'var(--db-font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  uploadRight:  { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  progressTrack:{ width: 60, height: 3, background: 'var(--db-surface3)', borderRadius: 2, overflow: 'hidden' },
  progressBar:  { height: '100%', background: 'var(--db-blue)', borderRadius: 2, transition: 'width 0.3s' },
  uploadStatus: { fontSize: 10, fontFamily: 'var(--db-font-mono)', whiteSpace: 'nowrap' },
  retryBtn:     { fontSize: 10, fontFamily: 'var(--db-font-mono)', background: 'rgba(255,94,94,0.1)', border: '1px solid rgba(255,94,94,0.3)', borderRadius: 4, padding: '2px 8px', color: 'var(--db-red)', cursor: 'pointer' },
  clearBtn:     { fontSize: 10, fontFamily: 'var(--db-font-mono)', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 4, padding: '2px 8px', color: 'var(--db-accent)', cursor: 'pointer' },
}
