// app/studio/page.tsx
'use client'
import { useState } from 'react'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', formats: [
    { name: 'Profile',     w: 320,  h: 320  },
    { name: 'Post Square', w: 1080, h: 1080 },
    { name: 'Post Vert',   w: 1080, h: 1350 },
    { name: 'Post Horiz',  w: 1080, h: 566  },
    { name: 'Story/Reel',  w: 1080, h: 1920 },
  ]},
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏', formats: [
    { name: 'Profile',     w: 400,  h: 400  },
    { name: 'Banner',      w: 1500, h: 500  },
    { name: 'Post Square', w: 1080, h: 1080 },
    { name: 'Post Vert',   w: 1080, h: 1350 },
    { name: 'Post Horiz',  w: 1600, h: 900  },
    { name: 'Link Card',   w: 1200, h: 630  },
  ]},
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', formats: [
    { name: 'Profile',      w: 400,  h: 400  },
    { name: 'Cover',        w: 1584, h: 396  },
    { name: 'Company Cover',w: 1128, h: 191  },
    { name: 'Post Vert',    w: 1080, h: 1350 },
    { name: 'Post Horiz',   w: 1080, h: 360  },
    { name: 'Link Image',   w: 1200, h: 627  },
  ]},
  { id: 'facebook', label: 'Facebook', icon: '👥', formats: [
    { name: 'Profile',     w: 320,  h: 320  },
    { name: 'Cover',       w: 851,  h: 315  },
    { name: 'Post Square', w: 1080, h: 1080 },
    { name: 'Post Vert',   w: 1080, h: 1350 },
    { name: 'Story',       w: 1080, h: 1920 },
    { name: 'Link Image',  w: 1200, h: 630  },
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
    { name: 'Profile',    w: 400,  h: 400  },
    { name: 'Cover',      w: 1500, h: 500  },
    { name: 'Link Image', w: 1200, h: 627  },
  ]},
]

export default function StudioPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram')
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const platform = PLATFORMS.find(p => p.id === selectedPlatform)!
  const format = platform.formats.find(f => f.name === selectedFormat)

  return (
    <div style={s.root}>

      {/* Topbar */}
      <header style={s.topbar}>
        <div style={s.topbarInner}>
          <span style={s.wordmark}>AMANDA<span style={s.accent}>/</span>STUDIO</span>
          <nav style={s.nav}>
            <a href="/dashboard" style={s.navLink}>← Dashboard</a>
            <a href="/wiki" style={s.navLink}>Wiki</a>
            <a href="/" style={s.navLink}>Home</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.badge}>AI STUDIO</span>
          <h1 style={s.title}>Image Resize Engine</h1>
          <p style={s.sub}>Upload any image. Select a platform and format. Get the perfect size — automatically.</p>
        </div>
      </div>

      <div style={s.body}>

        {/* Left — Upload + Preview */}
        <div style={s.left}>
          <div style={s.panelLabel}>SOURCE IMAGE</div>

          {/* Drop Zone */}
          <div
            style={{ ...s.dropzone, borderColor: dragging ? '#c8f564' : imageUrl ? 'rgba(200,245,100,0.3)' : 'rgba(255,255,255,0.08)' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              const file = e.dataTransfer.files[0]
              if (file && file.type.startsWith('image/')) {
                setImageUrl(URL.createObjectURL(file))
              }
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="Source" style={s.preview} />
            ) : (
              <div style={s.dropInner}>
                <span style={s.dropIcon}>⬆</span>
                <span style={s.dropText}>Drop image here</span>
                <span style={s.dropSub}>JPG, PNG, WEBP, RAW</span>
              </div>
            )}
          </div>

          {imageUrl && (
            <button onClick={() => { setImageUrl(null); setSelectedFormat(null) }} style={s.clearBtn}>
              ✕ Clear image
            </button>
          )}

          {/* Format Preview */}
          {format && (
            <div style={s.formatPreview}>
              <div style={s.panelLabel}>OUTPUT SPEC</div>
              <div style={s.specGrid}>
                <div style={s.specItem}><span style={s.specLabel}>Platform</span><span style={s.specValue}>{platform.label}</span></div>
                <div style={s.specItem}><span style={s.specLabel}>Format</span><span style={s.specValue}>{format.name}</span></div>
                <div style={s.specItem}><span style={s.specLabel}>Width</span><span style={s.specValue}>{format.w}px</span></div>
                <div style={s.specItem}><span style={s.specLabel}>Height</span><span style={s.specValue}>{format.h}px</span></div>
                <div style={s.specItem}><span style={s.specLabel}>Ratio</span><span style={s.specValue}>{(format.w / format.h).toFixed(2)}:1</span></div>
              </div>
              <button
  disabled={!imageUrl || !format}
  onClick={async () => {
    if (!imageUrl || !format) return
    const btn = document.activeElement as HTMLButtonElement
    btn.textContent = 'resizing...'
    btn.disabled = true
    try {
      const blob = await fetch(imageUrl).then(r => r.blob())
      const fd   = new FormData()
      fd.append('file',     new File([blob], 'source.jpg', { type: blob.type }))
      fd.append('platform', selectedPlatform)
      fd.append('format',   format.name.toLowerCase().replace(/\s+/g, ''))
      fd.append('w',        String(format.w))
      fd.append('h',        String(format.h))
      fd.append('output',   'webp')
      const res = await fetch('/api/resize', {
        method: 'POST',
        headers: { 'x-upload-token': process.env.NEXT_PUBLIC_UPLOAD_TOKEN ?? '' },
        body: fd,
      })
      if (!res.ok) throw new Error(await res.text())
      const resizedBlob = await res.blob()
      const url  = URL.createObjectURL(resizedBlob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `amanda_${selectedPlatform}_${format.name.toLowerCase().replace(/\s+/g,'_')}_${format.w}x${format.h}.webp`
      a.click()
      URL.revokeObjectURL(url)
      btn.textContent = `✦ Resize for ${platform.label}`
    } catch (e) {
      console.error(e)
      btn.textContent = '✕ Failed — try again'
    } finally {
      btn.disabled = !imageUrl || !format
    }
  }}
  style={s.resizeBtn}
>
  {imageUrl && format ? `✦ Resize for ${platform.label}` : 'Drop an image first'}
</button>
            </div>
          )}
        </div>

        {/* Right — Platform + Format Selector */}
        <div style={s.right}>

          {/* Platform Tabs */}
          <div style={s.panelLabel}>PLATFORM</div>
          <div style={s.platformGrid}>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedPlatform(p.id); setSelectedFormat(null) }}
                style={{ ...s.platformBtn, borderColor: selectedPlatform === p.id ? '#c8f564' : 'rgba(255,255,255,0.06)', background: selectedPlatform === p.id ? 'rgba(200,245,100,0.08)' : '#12151c', color: selectedPlatform === p.id ? '#c8f564' : '#7c8096' }}
              >
                <span>{p.icon}</span>
                <span style={s.platformLabel}>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Format List */}
          <div style={{ ...s.panelLabel, marginTop: 20 }}>FORMAT — {platform.label.toUpperCase()}</div>
          <div style={s.formatList}>
            {platform.formats.map((f) => (
              <button
                key={f.name}
                onClick={() => setSelectedFormat(f.name)}
                style={{ ...s.formatRow, borderColor: selectedFormat === f.name ? 'rgba(200,245,100,0.3)' : 'rgba(255,255,255,0.06)', background: selectedFormat === f.name ? 'rgba(200,245,100,0.06)' : '#12151c' }}
              >
                <span style={s.formatName}>{f.name}</span>
                <span style={s.formatDims}>{f.w} × {f.h}</span>
                <span style={s.formatRatio}>{(f.w / f.h).toFixed(2)}:1</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Coming Soon Banner */}
      <div style={s.comingBanner}>
        <span style={s.comingIcon}>⚙️</span>
        <div>
          <div style={s.comingTitle}>Resize engine coming next</div>
          <div style={s.comingSub}>Sharp-powered API route — <code style={s.code}>POST /api/resize</code> — will process and return the resized image at the selected dimensions.</div>
        </div>
      </div>

      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.dim}>AMANDA/PLATFORM · 2026</span>
          <a href="/dashboard" style={s.footerLink}>← Dashboard</a>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, any> = {
  root:          { minHeight: '100vh', background: '#0b0d11', color: '#e8eaf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
  topbar:        { borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,17,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' },
  topbarInner:   { maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wordmark:      { fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  accent:        { color: '#c8f564' },
  nav:           { display: 'flex', gap: 20 },
  navLink:       { color: '#7c8096', textDecoration: 'none', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  hero:          { borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 20px 32px' },
  heroInner:     { maxWidth: 1200, margin: '0 auto' },
  badge:         { display: 'inline-block', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#c8f564', background: 'rgba(200,245,100,0.08)', border: '1px solid rgba(200,245,100,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 },
  title:         { fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#e8eaf0', marginBottom: 8 },
  sub:           { fontSize: 13, color: '#7c8096', lineHeight: 1.7, maxWidth: 500 },
  body:          { maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' },
  left:          { display: 'flex', flexDirection: 'column', gap: 16 },
  right:         { display: 'flex', flexDirection: 'column', gap: 8 },
  panelLabel:    { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.15em', color: '#4a4f63', marginBottom: 8 },
  dropzone:      { border: '2px dashed', borderRadius: 12, minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s', cursor: 'pointer', overflow: 'hidden', background: '#12151c' },
  dropInner:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 32 },
  dropIcon:      { fontSize: 28, color: '#4a4f63' },
  dropText:      { fontSize: 13, fontWeight: 600, color: '#7c8096' },
  dropSub:       { fontSize: 11, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace" },
  preview:       { width: '100%', height: '100%', objectFit: 'contain', maxHeight: 320 },
  clearBtn:      { background: 'none', border: '1px solid rgba(255,94,94,0.2)', color: '#ff5e5e', borderRadius: 6, padding: '6px 12px', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer' },
  formatPreview: { background: '#12151c', border: '1px solid rgba(200,245,100,0.15)', borderRadius: 10, padding: '16px' },
  specGrid:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 },
  specItem:      { display: 'flex', flexDirection: 'column', gap: 2 },
  specLabel:     { fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63', letterSpacing: '0.1em' },
  specValue:     { fontSize: 12, fontWeight: 600, color: '#e8eaf0', fontFamily: "'IBM Plex Mono', monospace" },
  resizeBtn:     { width: '100%', background: '#c8f564', color: '#0b0d11', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  comingSoon:    { fontSize: 10, color: '#4a4f63', fontFamily: "'IBM Plex Mono', monospace", marginTop: 8, textAlign: 'center' as const },
  platformGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 },
  platformBtn:   { border: '1px solid', borderRadius: 8, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 0.15s', background: '#12151c' },
  platformLabel: { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" },
  formatList:    { display: 'flex', flexDirection: 'column', gap: 6 },
  formatRow:     { border: '1px solid', borderRadius: 8, padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s', background: '#12151c', textAlign: 'left' as const },
  formatName:    { fontSize: 12, fontWeight: 500, color: '#e8eaf0' },
  formatDims:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#7c8096' },
  formatRatio:   { fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
  comingBanner:  { maxWidth: 1200, margin: '0 auto 24px', padding: '0 20px' },
  comingIcon:    { fontSize: 20 },
  comingTitle:   { fontSize: 12, fontWeight: 600, color: '#e8eaf0', marginBottom: 4 },
  comingSub:     { fontSize: 11, color: '#7c8096', lineHeight: 1.6 },
  code:          { fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', fontSize: 11 },
  footer:        { borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
  footerInner:   { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between' },
  footerLink:    { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#c8f564', textDecoration: 'none' },
  dim:           { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: '#4a4f63' },
}
