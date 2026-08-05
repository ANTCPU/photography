'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState }    from 'react'
import { useDashboard }           from '../context/DashboardContext'
import { PLACEHOLDERS }           from '@/lib/constants'

interface NavItem {
  id:      string
  label:   string
  icon:    string
  badge?:  number
  section: 'core' | 'antcoin' | 'system'
  route?:  string
}

const NAV_ITEMS: NavItem[] = [
  // Core — all have real routes
  { id: 'overview',  label: 'Overview',  icon: '⬡', section: 'core',    route: '/dashboard'        },
  { id: 'portfolio', label: 'Portfolio', icon: '◻', section: 'core',    route: '/dashboard/assets' },
  { id: 'uploads',   label: 'Uploads',   icon: '↑', section: 'core',    route: '/dashboard'        },
  { id: 'analytics', label: 'Analytics', icon: '∿', section: 'core',    route: '/dashboard'        },
  { id: 'vault',     label: 'Vault',     icon: '🔒', section: 'core',    route: '/dashboard/vault'  },
  // Antcoin — coming soon
  { id: 'wallet',    label: 'Wallet',    icon: '◈', section: 'antcoin' },
  { id: 'sales',     label: 'Sales',     icon: '◇', section: 'antcoin' },
  { id: 'licensing', label: 'Licensing', icon: '≋', section: 'antcoin' },
  // System — coming soon
  { id: 'settings',  label: 'Settings',  icon: '⚙', section: 'system'  },
  { id: 'deploy',    label: 'Deploy',    icon: '▷', section: 'system'  },
]

const SECTION_LABELS: Record<string, string> = {
  core:    'Core',
  antcoin: 'Antcoin',
  system:  'System',
}

// Map routes → section id for active state sync
const ROUTE_TO_ID: Record<string, string> = {
  '/dashboard':        'overview',
  '/dashboard/assets': 'portfolio',
  '/dashboard/vault':  'vault',
}

export default function Sidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    activeSection,
    setActiveSection,
    metrics,
  } = useDashboard()

  const router   = useRouter()
  const pathname = usePathname()

  const [isMobile,    setIsMobile]    = useState(false)
  const [loggingOut,  setLoggingOut]  = useState(false)
  const [liveBalance, setLiveBalance] = useState(metrics?.antcoin?.balance ?? 0)
  const [liveDelta,   setLiveDelta]   = useState(0)

  // Live-tick Antcoin balance
  useEffect(() => {
    const id = setInterval(() => {
      setLiveBalance(prev => {
        const delta = (Math.random() - 0.4) * 0.8
        setLiveDelta(delta)
        return parseFloat((prev + delta).toFixed(2))
      })
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setSidebarCollapsed(mobile)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarCollapsed])

  // Sync active section with current URL on load + navigation
  useEffect(() => {
    const matched = ROUTE_TO_ID[pathname]
    if (matched) setActiveSection(matched)
  }, [pathname, setActiveSection])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' })
    router.push('/login')
  }

  function handleNavClick(item: NavItem) {
    setActiveSection(item.id)
    if (item.route) router.push(item.route)
    if (isMobile) setSidebarCollapsed(true)
  }

  const grouped = (Object.keys(SECTION_LABELS) as NavItem['section'][]).map(sec => ({
    key:   sec,
    label: SECTION_LABELS[sec],
    items: NAV_ITEMS.filter(n => n.section === sec),
  }))

  const w = sidebarCollapsed ? 56 : 200

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div
          onClick={() => setSidebarCollapsed(true)}
          style={{
            position: 'fixed', inset: 0, top: 52,
            background: 'rgba(0,0,0,0.6)', zIndex: 19,
          }}
        />
      )}

      <aside style={{
        width:     isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
        minWidth:  isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
        maxWidth:  isMobile ? (sidebarCollapsed ? 0 : '100vw') : w,
        background:    'var(--db-surface)',
        borderRight:   '1px solid var(--db-border)',
        display:       'flex',
        flexDirection: 'column',
        height:        '100vh',
        position:      isMobile ? 'fixed' : 'sticky',
        top:           isMobile ? 52 : 0,
        left:          0,
        transition:    'width 0.25s, min-width 0.25s',
        overflow:      'hidden',
        zIndex:        20,
      }}>

        {/* ── Profile ── */}
        <div style={{
          padding:       sidebarCollapsed ? '16px 0' : '16px 14px',
          borderBottom:  '1px solid var(--db-border)',
          display:       'flex',
          flexDirection: sidebarCollapsed ? 'column' : 'row',
          alignItems:    'center',
          gap:           10,
        }}>
          <img
            src={PLACEHOLDERS.profile}
            alt="Amanda"
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              objectFit:    'cover',
              flexShrink:   0,
              border:       '1px solid rgba(200,245,100,0.25)',
            }}
          />
          {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize:     12,
                fontWeight:   600,
                color:        'var(--db-text)',
                whiteSpace:   'nowrap',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
              }}>
                Amanda
              </div>
              <div style={{
                fontSize:   10,
                fontFamily: 'var(--db-font-mono)',
                color:      'var(--db-text-dim)',
                whiteSpace: 'nowrap',
              }}>
                @antcpu
              </div>
            </div>
          )}
          {/* Single toggle button — expand or collapse */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              marginLeft: sidebarCollapsed ? undefined : 'auto',
              background: 'none',
              border:     'none',
              color:      'var(--db-text-dim)',
              cursor:     'pointer',
              fontSize:   14,
              padding:    '2px 4px',
              lineHeight: 1,
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {grouped.map(({ key, label, items }) => (
            <div key={key} style={{ marginBottom: 4 }}>
              {!sidebarCollapsed && (
                <div style={{
                  fontSize:      9,
                  fontFamily:    'var(--db-font-mono)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color:         'var(--db-text-dim)',
                  padding:       '8px 14px 4px',
                }}>
                  {label}
                </div>
              )}
              {items.map(item => {
                const active      = activeSection === item.id
                const isComingSoon = !item.route

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    title={sidebarCollapsed ? item.label : undefined}
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      gap:            10,
                      padding:        sidebarCollapsed ? '9px 0' : '9px 14px',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      background:     active ? 'rgba(200,245,100,0.07)' : 'none',
                      border:         'none',
                      borderLeft:     active
                        ? '2px solid #c8f564'
                        : '2px solid transparent',
                      cursor:     'pointer',
                      transition: 'background 0.15s',
                      opacity:    isComingSoon ? 0.4 : 1,
                    }}
                  >
                    <span style={{
                      fontSize:   14,
                      lineHeight: 1,
                      color:      active ? 'var(--db-accent)' : 'var(--db-text-dim)',
                      fontFamily: 'var(--db-font-mono)',
                    }}>
                      {item.icon}
                    </span>

                    {!sidebarCollapsed && (
                      <span style={{
                        fontSize:   12,
                        color:      active ? 'var(--db-text)' : 'var(--db-text-muted)',
                        fontWeight: active ? 600 : 400,
                        flex:       1,
                        textAlign:  'left',
                      }}>
                        {item.label}
                      </span>
                    )}

                    {/* Badge — upload count */}
                    {!sidebarCollapsed && item.badge && !isComingSoon && (
                      <span style={{
                        fontSize:     9,
                        fontFamily:   'var(--db-font-mono)',
                        background:   'rgba(200,245,100,0.12)',
                        color:        'var(--db-accent)',
                        border:       '1px solid rgba(200,245,100,0.2)',
                        borderRadius: 10,
                        padding:      '1px 6px',
                      }}>
                        {item.badge}
                      </span>
                    )}

                    {/* Coming soon badge */}
                    {!sidebarCollapsed && isComingSoon && (
                      <span style={{
                        fontSize:     8,
                        fontFamily:   'var(--db-font-mono)',
                        color:        'var(--db-text-dim)',
                        border:       '1px solid var(--db-border)',
                        borderRadius: 3,
                        padding:      '1px 4px',
                      }}>
                        soon
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Antcoin Widget ── */}
        {!sidebarCollapsed && (
          <div style={{
            borderTop: '1px solid var(--db-border)',
            padding:   '12px 14px',
          }}>
            <div style={{
              fontSize:      9,
              fontFamily:    'var(--db-font-mono)',
              letterSpacing: '0.12em',
              color:         'var(--db-text-dim)',
              textTransform: 'uppercase',
              marginBottom:  6,
              display:       'flex',
              alignItems:    'center',
              gap:           6,
            }}>
              <LiveDot />
              Antcoin
            </div>
            <div style={{
              fontSize:      18,
              fontWeight:    700,
              color:         'var(--db-text)',
              fontFamily:    'var(--db-font-mono)',
              letterSpacing: '-0.02em',
            }}>
              {liveBalance.toFixed(2)}
              <span style={{
                fontSize:   10,
                color:      'var(--db-text-dim)',
                marginLeft: 4,
              }}>
                ANT
              </span>
            </div>
            <div style={{
              fontSize:   10,
              fontFamily: 'var(--db-font-mono)',
              color:      liveDelta >= 0 ? 'var(--db-teal)' : 'var(--db-red)',
              marginTop:  2,
            }}>
              {liveDelta >= 0 ? '+' : ''}{liveDelta.toFixed(2)} live
            </div>
          </div>
        )}

        {/* ── Sign Out ── */}
        {!sidebarCollapsed && (
          <div style={{
            borderTop: '1px solid var(--db-border)',
            padding:   '12px 14px',
          }}>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                width:      '100%',
                background: 'none',
                border:     '1px solid var(--db-border)',
                borderRadius: 6,
                padding:    '8px 10px',
                color:      'var(--db-red)',
                cursor:     'pointer',
                fontSize:   11,
                fontFamily: 'var(--db-font-mono)',
                textAlign:  'left',
                transition: 'border-color 0.15s',
              }}
            >
              {loggingOut ? '···' : '← sign out'}
            </button>
          </div>
        )}

      </aside>
    </>
  )
}

function LiveDot() {
  return (
    <span style={{
      display:      'inline-block',
      width:        5,
      height:       5,
      borderRadius: '50%',
      background:   'var(--db-teal)',
      boxShadow:    '0 0 4px var(--db-teal)',
    }} />
  )
}
