// app/studio/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Amanda Photography — Image Resize Studio
// Select platform + format, drop or browse an image, download resized WebP
// Calls /api/resize — auth via upload_token cookie (set on studio login)
// ─────────────────────────────────────────────────────────────────────────────
'use client'
import { useState } from 'react'

// ── Platform + format definitions ─────────────────────────────────────────────
// Mirrors SOCIAL_SIZES in lib/constants.ts — keep in sync if adding platforms
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', formats: [
    { name: 'Profile',    w: 320,  h: 320  },
    { name: 'Post Square',w: 1080, h: 1080 },
    { name: 'Post Vert',  w: 1080, h: 1350 },
    { name: 'Post Horiz', w: 1080, h: 566  },
    { name: 'Story/Reel', w: 1080, h: 1920 },
  ]},
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏', formats: [
    { name: 'Profile',    w: 400,  h: 400  },
    { name: 'Banner',     w: 1500, h: 500  },
    { name: 'Post Square',w: 1080, h: 1080 },
    { name: 'Post Vert',  w: 1080, h: 1350 },
    { name: 'Post Horiz', w: 1600, h: 900  },
    { name: 'Link Card',  w: 1200, h: 630  },
  ]},
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', formats: [
    { name: 'Profile',       w: 400,  h: 400 },
    { name: 'Cover',         w: 1584, h: 396 },
    { name: 'Company Cover', w: 1128, h: 191 },
    { name: 'Post Vert',     w: 1080, h: 1350},
    { name: 'Post Horiz',    w: 1080, h: 360 },
    { name: 'Link Image',    w: 1200, h: 627 },
  ]},
  { id: 'facebook', label: 'Facebook', icon: '👥', formats: [
    { name: 'Profile',    w: 320,  h: 320  },
    { name: 'Cover',      w: 851,  h: 315  },
    { name: 'Post Square',w: 1080, h: 1080 },
    { name: 'Post Vert',  w: 1080, h: 1350 },
    { name: 'Story',      w: 1080, h: 1920 },
    { name: 'Link Image', w: 1200, h: 630  },
  ]},
  { id: 'tiktok', label: 'TikTok', icon: '🎵', formats: [
    { name: 'Profile',    w: 200,  h: 200  },
    { name: 'Post/Story', w: 1080, h: 1920 },
  ]},
  { id: 'youtube', label: 'YouTube', icon: '▶️', formats: [
    { name: 'Profile',   w: 800,  h: 800  },
    { name: 'Banner',    w: 2560, h: 1440 },
    { name: 'Thumbnail', w: 1280, h: 720  },
  ]},
  { id: 'pinterest', label: 'Pinterest', icon: '📌', formats: [
    { name: 'Profile', w: 165,  h: 165  },
    { name: 'Cover',   w: 800,  h: 450  },
    { name: 'Pin',     w: 1000, h: 1500 },
  ]},
  { id: 'bluesky', label: 'Bluesky', icon: '🦋', formats: [
    { name: 'Profile',    w: 400,  h: 400 },
    { name: 'Cover',      w: 1500, h: 500 },
    { name: 'Link Image', w: 1200, h: 627 },
  ]},
]

export default function StudioPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram')
  const [selectedFormat,   setSelectedFormat]   = useState<string | null>(null)
  const [dragging,         setDragging]          = useState(false)
  const [imageUrl,         setImageUrl]          = useState<string | null>(null)

  const platform = PLATFORMS.find(p => p.id === selectedPlatform)!
  const format   = platform.formats.find(f => f.name === selectedFormat)

  // ── Load image from file ───────────────────────────────────────────────────
  function loadFile(file: File) {
    if (file && file.type.startsWith('image/')) {
      setImageUrl(URL.createObjectURL(file))
    }
  }

  // ── Resize + download ──────────────────────────────────────────────────────
  async function handleResize(e: React.MouseEvent<HTMLButtonElement>) {
    if (!imageUrl || !selectedFormat || !format) return
    const btn      = e.currentTarget
    const original = btn.textContent
    btn.textContent = 'resizing...'
    btn.disabled    = true

    try {
      const sourceBlob = await fetch(imageUrl).then(r => r.blob())
      const fd = new FormData()
      fd.append('file',   new File([sourceBlob], 'source.jpg', { type: sourceBlob.type }))
      fd.append('w',      String(format.w))
      fd.append('h',      String(format.h))
      fd.append('output', 'webp')
      fd.append('fit',    'cover')

      // credentials: include — sends upload_token cookie automatically
      const res = await fetch('/api/resize', {
        method:      'POST',
        credentials: 'include',
        body:        fd,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? 'Resize failed')
      }

      // Trigger browser download
      const resizedBlob = await res.blob()
      const url  = URL.createObjectURL(resizedBlob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `amanda_${selectedPlatform}_${selectedFormat.toLowerCase().replace(/[\s/]+/g, '_')}_${format.w}x${format.h}.webp`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      btn.textContent = `✓ Downloaded ${format.w}×${format.h}`
      setTimeout(() => { btn.textContent = original!; btn.disabled = false }, 2500)

    } catch (err: any) {
      console.error('[studio] resize error:', err)
      btn.textContent = `✕ ${err.message ?? 'Failed — try again'}`
      setTimeout(() => { btn.textContent = original!; btn.disabled = false }, 2500)
    }
  }

  return (
    <div style={s.root}>

      {/* Topbar */}
      <div style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>ANTCPU <span style={s.accent}>◆</span> STUDIO</span>
          <nav style={s.nav}>
            <a href="/dashboard" style={s.navLink}>← dashboard</a>
            <a href="/ai"        style={s.navLink}>ai tools</a>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.badge}>AI STUDIO</div>
          <h1 style={s.title}>Image Resize Engine</h1>
          <p style={s.sub}>
            Drop or browse an image. Select a platform and format.
            Sharp processes it server-side — downloads as optimised WebP.
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>

        {/* Left — Upload + Preview + Resize */}
        <div style={s.left}>
          <div style={s.panelLabel}>SOURCE IMAGE</div>

          {/* Drop zone — drag or click to browse */}
          <div
            style={{
              ...s.dropzone,
              borderColor: dragging
                ? '#c8f564'
                : imageUrl
                ? 'rgba(200,245,100,0.3)'
                : 'rgba(255,255,255,0.08)',
            }}
            onDragOver={(e)  => { e.preventDefault(); setDragging(true) }}
            onDragLeave={()  => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              loadFile(e.dataTransfer.files[0])
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Source" style={s.preview} />
            ) : (
              <div style={s.dropInner}>
                {/* Hidden file input — label triggers it on click */}
                <input
                  id="studioFileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) loadFile(file)
                  }}
                />
                <label htmlFor="studioFileInput" style={s.browseLabel}>
                  <div style={s.dropIcon}>⬆</div>
                  <div style={s.dropText}>Drop image here</div>
                  <div style={s.dropSub}>or click to browse · JPG, PNG, WEBP</div>
                </label>
              </div>
            )}
          </div>

          {/* Clear button */}
          {imageUrl && (
            <button
              onClick={() => { setImageUrl(null); setSelectedFormat(null) }}
              style={s.clearBtn}
            >
              ✕ Clear image
            </button>
          )}

          {/* Output spec + resize button — only shown when format is selected */}
          {format && (
            <div style={s.formatPreview}>
              <div style={s.panelLabel}>OUTPUT SPEC</div>
              <div style={s.specGrid}>
                <div style={s.specItem}>
                  <div style={s.specLabel}>PLATFORM</div>
                  <div style={s.specValue}>{platform.label}</div>
                </div>
                <div style={s.specItem}>
                  <div style={s.specLabel}>FORMAT</div>
                  <div style={s.specValue}>{format.name}</div>
                </div>
                <div style={s.specItem}>
                  <div style={s.specLabel}>WIDTH</div>
                  <div style={s.specValue}>{format.w}px</div>
                </div>
                <div style={s.specItem}>
                  <div style={s.specLabel}>HEIGHT</div>
                  <div style={s.specValue}>{format.h}px</div>
                </div>
                <div style={s.specItem}>
                  <div style={s.specLabel}>RATIO</div>
                  <div style={s.specValue}>{(format.w / format.h).toFixed(2)}:1</div>
                </div>
                <div style={s.specItem}>
                  <div style={s.specLabel}>OUTPUT</div>
                  <div style={s.specValue}>WebP</div>
                </div>
              </div>

              <button
                disabled={!imageUrl || !selectedFormat}
                onClick={handleResize}
                style={{
                  ...s.resizeBtn,
                  opacity: imageUrl && selectedFormat ? 1 : 0.4,
                  cursor:  imageUrl && selectedFormat ? 'pointer' : 'not-allowed',
                }}
              >
                {imageUrl && format
                  ? `✦ Resize for ${platform.label} — ${format.w}×${format.h}`
                  : 'Drop an image first'}
              </button>
            </div>
          )}
        </div>

        {/* Right — Platform + Format Selector */}
        <div style={s.right}>

          {/* Platform grid */}
          <div style={s.panelLabel}>PLATFORM</div>
          <div style={s.platformGrid}>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlatform(p.id); setSelectedFormat(null) }}
                style={{
                  ...s.platformBtn,
                  borderColor: selectedPlatform === p.id ? '#c8f564'              : 'rgba(255,255,255,0.06)',
                  background:  selectedPlatform === p.id ? 'rgba(200,245,100,0.08)' : '#12151c',
                  color:       selectedPlatform === p.id ? '#c8f564'              : '#7c8096',
                }}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={s.platformLabel}>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Format list */}
          <div style={{ ...s.panelLabel, marginTop: 16 }}>
            FORMAT — {platform.label.toUpperCase()}
          </div>
          <div style={s.formatList}>
            {platform.formats.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFormat(f.name)}
                style={{
                  ...s.formatRow,
                  borderColor: selectedFormat === f.name ? 'rgba(200,245,100,0.3)' : 'rgba(255,255,255,0.06)',
                  background:  selectedFormat === f.name ? 'rgba(200,245,100,0.06)' : '#12151c',
                }}
              >
                <span style={s.formatName}>{f.name}</span>
                <span style={s.formatDims}>{f.w} × {f.h}</span>
                <span style={s.formatRatio}>{(f.w / f.h).toFixed(2)}:1</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>Sharp · Node runtime · /api/resize</span>
          <a href="/dashboard" style={s.footerLink}>← back to dashboard</a>
        </div>
      </div>

    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  root:         { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },

  // Topbar
  topbar:       { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  topbarInner:  { maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:     { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:       { color: '#c8f564' },
  nav:          { display: 'flex', gap: 20 },
  navLink:      { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },

  // Hero
  hero:         { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 20px 32px' },
  heroInner:    { maxWidth: 1200, margin: '0 auto' },
  badge:        { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 },
  title:        { fontSize: 'clamp(24px, 4vw, 36px)' as any, fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 8 },
  sub:          { fontSize: 13, color: '#7c8096', lineHeight: 1.7, maxWidth: 500 },

  // Body layout
  body:         { maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' },
  left:         { display: 'flex', flexDirection: 'column', gap: 12 },
  right:        { display: 'flex', flexDirection: 'column', gap: 8 },
  panelLabel:   { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63', marginBottom: 8 },

  // Drop zone
  dropzone:     { border: '2px dashed', borderRadius: 12, minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s', overflow: 'hidden', background: '#12151c' },
  dropInner:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32 },
  browseLabel:  { cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  dropIcon:     { fontSize: 28, color: '#4a4f63' },
  dropText:     { fontSize: 13, fontWeight: 600, color: '#7c8096' },
  dropSub:      { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },
  preview:      { width: '100%', height: '100%', objectFit: 'contain' as const, maxHeight: 320 },
  clearBtn:     { background: 'none', border: '1px solid rgba(255,94,94,0.2)', color: '#ff5e5e', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer', alignSelf: 'flex-start' as const },

  // Format preview + resize
  formatPreview:{ background: '#12151c', border: '1px solid rgba(200,245,100,0.15)', borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  specGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  specItem:     { display: 'flex', flexDirection: 'column', gap: 2 },
  specLabel:    { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', letterSpacing: '0.1em' },
  specValue:    { fontSize: 12, fontWeight: 600, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  resizeBtn:    { width: '100%', background: '#c8f564', color: '#0b0d11', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.15s' },

  // Platform selector
  platformGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 },
  platformBtn:  { border: '1px solid', borderRadius: 8, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 0.15s', background: '#12151c' },
  platformLabel:{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" },

  // Format list
  formatList:   { display: 'flex', flexDirection: 'column', gap: 6 },
  formatRow:    { border: '1px solid', borderRadius: 8, padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s', background: '#12151c', textAlign: 'left' as const, width: '100%' },
  formatName:   { fontSize: 12, fontWeight: 500, color: '#e8eaf0' },
  formatDims:   { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096' },
  formatRatio:  { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },

  // Footer
  footer:       { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px', marginTop: 20 },
  footerInner:  { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  footerLink:   { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:          { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
