// app/dashboard/page.tsx
// Amanda Photography — Dashboard v1
// Simple first preview — event feed, category heat, discord status

"use client"

import { useEffect, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type SiteEvent = {
  id: string
  type: string
  label: string
  timestamp: string
}

type CategoryStat = {
  name: string
  views: number
}

type Stats = {
  totalEvents: number
  topCategory: string | null
  categoryBreakdown: CategoryStat[]
  recentEvents: SiteEvent[]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder — replace with /api/stats once built
    setTimeout(() => {
      setStats({
        totalEvents: 0,
        topCategory: null,
        categoryBreakdown: [
          { name: "Portraits",  views: 0 },
          { name: "Nature",     views: 0 },
          { name: "Urban",      views: 0 },
          { name: "Abstract",   views: 0 },
          { name: "Structure",  views: 0 },
          { name: "Life",       views: 0 },
        ],
        recentEvents: [],
      })
      setLoading(false)
    }, 600)
  }, [])

  const maxViews = Math.max(
    1,
    ...(stats?.categoryBreakdown.map((c) => c.views) ?? [1])
  )

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          📸 Amanda Photography
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          antcpu.com/manda · Live Dashboard
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        <StatBox label="Total Events"  value={loading ? "..." : String(stats?.totalEvents ?? 0)} />
        <StatBox label="Top Category"  value={loading ? "..." : stats?.topCategory ?? "—"} />
        <StatBox label="Discord"       value="Pending" />
        <StatBox label="Images Live"   value="6" />
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category Heatmap */}
        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-widest">
            Gallery Heat
          </h2>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" />
                ))
              : stats?.categoryBreakdown.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-300">{cat.name}</span>
                      <span className="text-zinc-500">{cat.views}</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-white transition-all duration-500"
                        style={{
                          width: `${(cat.views / maxViews) * 100}%`,
                          opacity: cat.views === 0 ? 0.15 : 1,
                        }}
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Event Feed */}
        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-widest">
            Live Feed
          </h2>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-zinc-800 rounded mb-2 animate-pulse" />
            ))
          ) : stats?.recentEvents.length ? (
            <ul className="space-y-2">
              {stats.recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex justify-between text-sm bg-zinc-800 rounded-lg px-3 py-2"
                >
                  <span className="text-zinc-300">{e.label}</span>
                  <span className="text-zinc-500 text-xs">{e.timestamp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-zinc-600 text-sm">No events yet</p>
              <p className="text-zinc-700 text-xs mt-1">
                Waiting for site activity
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 text-xs text-zinc-700 text-center">
        Amanda Platform · Built on Vercel · Events via Discord
      </div>

    </div>
  )
}

// ─── StatBox ──────────────────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold truncate">{value}</p>
    </div>
  )
}
