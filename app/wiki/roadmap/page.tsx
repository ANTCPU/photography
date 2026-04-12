// app/wiki/roadmap/page.tsx
'use client'
import { useState } from 'react'

const nextItems = [
  { icon: '💬', label: 'Discord Server',      desc: 'Build out community hub',                  status: 'queued' },
  { icon: '🖼️', label: 'Wallpaper Downloads', desc: 'Free download section on main site',       status: 'queued' },
  { icon: '📬', label: 'Contact Form',         desc: 'antcpu.com/manda contact page',            status: 'queued' },
  { icon: '🗄️', label: 'Seed KV Assets',      desc: 'Populate search with real photo data',     status: 'queued' },
  { icon: '✦',  label: 'AI Studio',            desc: 'Image resize engine for social platforms', status: 'in progress' },
  { icon: '📦', label: 'Persistent Storage',   desc: 'Vercel Blob + KV metadata',               status: 'in progress' },
]

const milestones = [
  { version: 'v0.1', label: 'Upload & Store',          status: 'active',  items: ['Image uploader ✅', 'Discord distribution ✅', 'Search ✅', 'Persistent storage ⏳', 'Metadata ⏳'] },
  { version: 'v0.2', label: 'Enhance & Contextualize', status: 'planned', items: ['Auto-tag images', 'Add descriptions', 'AI Studio resize engine'] },
  { version: 'v0.3', label: 'Share via API',            status: 'planned', items: ['GET /api/image/{id}', 'External platform fetch'] },
  { version: 'v0.4', label: 'Dashboard &
