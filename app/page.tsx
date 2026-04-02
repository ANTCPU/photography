// app/page.tsx
// Amanda Photography Platform — Root Page
// Maps all routes, surfaces platform status, entry point for dashboard + notify

"use client"

import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType =
  | "gallery_view"
  | "image_view"
  | "download_interest"
  | "print_inquiry"
  | "cta_click"
  | "hot_alert"
  | "referral"

type SiteEvent = {
  id: string
  type: EventType
  label: string
  meta: Record<string, string>
  timestamp: string
}

type PlatformStatus = {
  discordConnected: boolean
  totalEvents: number
  lastEvent: SiteEvent | null
  topCategory: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GALLERY_CATEGORIES = [
  "Portraits",
  "Nature", 
  "Urban",
  "Abstract",
  "Structure",
  "Life",
] as const

const EVENT_ICONS: Record<EventType, string> = {
  gallery_view:     "👁️",
  image_view:       "🖼️",
  download_interest:"💾",
  print_inquiry:    "🎨",
  cta_click:        "🔔",
  hot_alert:        "🔥",
  referral:         "🔗",
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AmandaPlatformHome() {
  const [status, setStatus] = useState<PlatformStatus | null>(null)
  const [recentEvents, setRecentEvents] = useState<SiteEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notifyTest, setNotifyTest] = useState("")

  // Load platform status on mount
  useEffect(() => {
    fetchStatus()
  }, [])

  async function fetchStatus() {
    try {
      const res = await fetch("/api/stats")
      const data = await res.json()
      setStatus(data.status)
      setRecentEvents(data.recentEvents ?? [])
    } catch {
      setStatus({
        discordConnected: false,
        totalEvents: 0,
        lastEvent: null,
        topCategory: null,
      })
    } finally {
      setLoading(false)
    }
  }

  // Test Discord webhook connection
  async function testNotify() {
    setNotifyTest("Sending...")
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cta_click",
          meta: { page: "platform-root", source: "connection-test" },
        }),
      })
      setNotifyTest(res.ok ? "✅ Discord connected!" : "❌ Notify failed")
    } catch {
      setNotifyTest("❌ Network error")
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-black text-white p-6 font-mono">

      {/* Header */}
      <header className="mb-8 border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          📸 Amanda Photography — Platform
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Vercel Backend · Discord Events · Dashboard
        </p>
      </header>

      {/* Platform Status */}
      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatusCard
          label="Discord"
          value={status?.discordConnected ? "Connected" : "Offline"}
          icon={status?.discordConnected ? "🟢" : "🔴"}
          loading={loading}
        />
        <StatusCard
          label="Total Events"
          value={status?.totalEvents?.toString() ?? "0"}
          icon="📊"
          loading={loading}
        />
        <StatusCard
          label="Top Category"
          value={status?.topCategory ?? "—"}
          icon="🏆"
          loading={loading}
        />
        <StatusCard
          label="Last Event"
          value={
            status?.lastEvent
              ? `${EVENT_ICONS[status.lastEvent.type]} ${status.lastEvent.label}`
              : "—"
          }
          icon="⚡"
          loading={loading}
        />
      </section>

      {/* Gallery Categories — Quick Reference */}
      <section className="mb-8">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-3">
          Gallery Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {GALLERY_CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* API Routes Map */}
      <section className="mb-8">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-3">
          API Routes
        </h2>
        <div className="space-y-2 text-sm">
          <RouteRow method="POST" path="/api/notify" desc="Send event to Discord + log to KV" />
          <RouteRow method="GET"  path="/api/stats"  desc="Read platform stats for dashboard" />
          <RouteRow method="GET"  path="/dashboard"  desc="Amanda dashboard UI (protected)" />
        </div>
      </section>

      {/* Recent Events Feed */}
      <section className="mb-8">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-3">
          Recent Events
        </h2>
        {recentEvents.length === 0 ? (
          <p className="text-zinc-600 text-sm">No events yet — waiting for site activity.</p>
        ) : (
          <ul className="space-y-2">
            {recentEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-3 text-sm bg-zinc-900 rounded px-3 py-2"
              >
                <span>{EVENT_ICONS[event.type]}</span>
                <span className="flex-1">{event.label}</span>
                <span className="text-zinc-500 text-xs">{event.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Discord Connection Test */}
      <section className="mb-8">
        <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-3">
          Connection Test
        </h2>
        <button
          onClick={testNotify}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm transition"
        >
          Ping Discord Webhook
        </button>
        {notifyTest && (
          <p className="mt-2 text-sm text-zinc-300">{notifyTest}</p>
        )}
      </section>

    </main>
  )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatusCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: string
  icon: string
  loading: boolean
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-semibold">
        {loading ? "..." : `${icon} ${value}`}
      </p>
    </div>
  )
}

function RouteRow({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST"
  path: string
  desc: string
}) {
  const color = method === "POST" ? "text-yellow-400" : "text-green-400"
  return (
    <div className="flex items-center gap-3 bg-zinc-900 rounded px-3 py-2">
      <span className={`text-xs font-bold w-10 ${color}`}>{method}</span>
      <span className="text-zinc-200 w-40">{path}</span>
      <span className="text-zinc-500 text-xs">{desc}</span>
    </div>
  )
}
