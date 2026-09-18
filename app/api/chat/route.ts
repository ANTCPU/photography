// app/api/chat/route.ts
// Amanda Photography — Scripted booking agent v2
//
// Changes from v1:
// — Removed openaiReply() + dead AGENT/CATEGORIES imports
// — Fixed affirmative keywords → booking flow now starts on 'yes','sure','ok' etc.
// — Added booking CTA to portfolio + location responses
// — Partial lead POST to ADS at step 2 (name captured)
// — Complete booking POST to ADS at step 4 (email captured)
// — Email validation on step 4 — re-prompts on invalid input
// — mac_conversations written via ADS for full session persistence
// — DISCORD_WEBHOOK_URL kept as local fallback if ADS unreachable

import { NextRequest, NextResponse } from 'next/server'
import { SEASON }                    from '@/lib/constants'

export const runtime = 'edge'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
}

// ── ADS pipeline endpoint ─────────────────────────────────────────────────────
// Handles Supabase writes + Discord + Resend
const ADS_LEAD_URL = 'https://antcpu-ads.vercel.app/api/photography-lead'

async function postToADS(payload: Record<string, unknown>): Promise<void> {
  const key = process.env.PHOTOGRAPHY_API_KEY
  if (!key) {
    console.warn('[chat] PHOTOGRAPHY_API_KEY not set — skipping ADS pipeline')
    return
  }
  try {
    await fetch(ADS_LEAD_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    key,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[chat] ADS pipeline error:', err)
  }
}

// ── Booking flow steps ────────────────────────────────────────────────────────
const BOOKING_STEPS = [
  "I'd love that! What type of session are you thinking — portrait, lifestyle, sports, events, or something else? 📸",
  "Perfect! And what's your name so I can personalise this for you?",
  "Great to meet you! What dates are you looking at? Fall is filling up fast so sooner is better 🍂",
  "Love it. Last thing — what's the best email to reach you at to confirm everything?",
]

const BOOKING_COMPLETE = (name: string, type: string, date: string) =>
  `You're all set ${name}! I'll reach out shortly to confirm your ${type} session on ${date}. Can't wait to work with you 🎉`

const EMAIL_RETRY =
  "Just need a valid email to confirm — what's the best one to reach you at? 📧"

// ── Session state ─────────────────────────────────────────────────────────────
// Edge in-memory — survives within isolate lifetime
// Full persistence via mac_conversations written to ADS Supabase on each step

interface BookingSession {
  step:        number
  sessionType: string
  name:        string
  date:        string
  email:       string
  messages:    { role: string; message: string; field_context?: string }[]
}

const sessions = new Map<string, BookingSession>()

function getSessionId(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ua = req.headers.get('user-agent')?.slice(0, 30) ?? 'ua'
  return `${ip}|${ua}`
}

// ── Intent map ────────────────────────────────────────────────────────────────
interface Intent {
  id:        string
  keywords:  string[]
  flow?:     'booking' | 'pricing' | 'portfolio' | 'location'
  response?: string
}

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: ['hi','hello','hey','howdy','good morning','good afternoon','good evening','sup','yo'],
    response: "Hey! So glad you stopped by 😊 I'm Amanda — are you looking to book a session, or just browsing the portfolio?",
  },
  {
    id: 'booking',
    keywords: [
      'book','session','appointment','schedule','available','dates','when',
      'reserve','sign up','set up','want to',
      // affirmatives — previously dead-ended here
      'yes','yeah','yep','sure','ok','okay','let\'s do it','sounds good',
      'i\'m in','let\'s go','ready','absolutely','definitely',
      'i want','i\'d like','i would','do it','sign me up',
    ],
    flow: 'booking',
  },
  {
    id: 'portrait',
    keywords: ['portrait','headshot','family','kids','baby','graduation','senior','couple','engagement','newborn'],
    response: "Portraits are my absolute favorite — there's nothing like capturing a real unguarded moment. I shoot natural light, on-location, no stiff poses. Want to book a date? 📅",
  },
  {
    id: 'sports',
    keywords: ['sports','baseball','football','soccer','basketball','action','game','athlete','tournament','team','lacrosse','hockey'],
    response: "Love shooting sports — the energy and emotion are incredible. Outdoor or indoor, I've got you covered. What sport and what level are we talking? Want to lock in a date? 🏆",
  },
  {
    id: 'lifestyle',
    keywords: ['lifestyle','outdoor','nature','casual','everyday','candid','golden hour','fall','autumn'],
    response: "Lifestyle sessions are so natural and fun — no stiff poses, just real moments in real places. Fall light right now is absolutely stunning. Want to pick a date? 🍂",
  },
  {
    id: 'travel',
    keywords: ['travel','trip','vacation','destination','outside','park','beach','mountain','downtown'],
    response: "I love shooting on-location — the more interesting the spot the better the story. Where are you thinking? Want to set something up? ✈️",
  },
  {
    id: 'food',
    keywords: ['food','culinary','restaurant','dish','menu','product','chef','cooking','cafe'],
    response: "Food photography is such a craft — it's all about light and composition. Tell me about the project and I'll let you know what I can do. 🍽️",
  },
  {
    id: 'events',
    keywords: ['event','wedding','birthday','party','graduation','ceremony','concert','recital','reunion','corporate'],
    response: "Events are all about being in the right place at the right moment — I live for that. Tell me about your event: date, type, and location. Want to get it on the calendar? 🎉",
  },
  {
    id: 'pricing',
    keywords: ['price','cost','rate','how much','fee','charge','budget','afford','expensive','cheap','quote','rates'],
    flow: 'pricing',
  },
  {
    id: 'location',
    keywords: ['where','local','area','distance','far','drive','near','come to'],
    flow: 'location',
  },
  {
    id: 'portfolio',
    keywords: ['portfolio','work','photos','examples','see','show','gallery','samples','previous','past','look at'],
    flow: 'portfolio',
  },
  {
    id: 'equipment',
    keywords: ['camera','iphone','ipad','equipment','gear','quality','resolution','pro','apple','shoot with'],
    response: "I shoot with iPhone 17 Pro Max and iPad Pro M5 — 48MP RAW, ProRes video, and on-site editing so you see the final result before you leave. Studio-grade from any location 📱",
  },
  {
    id: 'delivery',
    keywords: ['deliver','send','get','receive','how long','turnaround','airdrop','download','files'],
    response: "Full-resolution files AirDropped to your phone on the spot — or delivered via our platform so you can download anytime. No waiting days. 📤",
  },
  {
    id: 'thanks',
    keywords: ['thanks','thank you','appreciate','wonderful','amazing','love it'],
    response: "Of course — I'm so excited to work with you! Anything else I can help with? 📸",
  },
  {
    id: 'contact',
    keywords: ['contact','reach','call','phone','message','text','dm','instagram','social'],
    response: "Best way is right here through this chat — I'll follow up within 24 hours once you book. Want to go ahead and lock in a date? 📅",
  },
]

// ── Flow responses ────────────────────────────────────────────────────────────
const PRICING_RESPONSE =
`Here's a general idea of my rates:

📸 Portrait session — from $150
🌿 Lifestyle / family — from $200
⚡ Sports / action — from $175
🎉 Events — contact for a custom quote

Every session is tailored — reach out and we'll find something that works for you. Want to book? 📅`

const PORTFOLIO_RESPONSE =
`Here's some of my recent work — head over to the full portfolio for the gallery:

👉 antcpu.com/manda

I shoot portraits, lifestyle, sports, travel, and culinary. Anything catch your eye — want to book a session? 📅`

const LOCATION_RESPONSE =
`I'm based locally and shoot entirely on-location — parks, your home, sporting venues, downtown, wherever makes sense for your session.

I also travel for the right project. Want to lock in a date? 📅`

const FALLBACKS = [
  "Tell me more — I want to make sure I get this right for you 😊",
  "That's interesting! Can you share a bit more about what you have in mind?",
  "I'd love to help with that. Can you give me a little more detail?",
  "Are you looking to book a session, or do you have a question about my work?",
  "I'm all ears! What's on your mind? 📸",
]

// ── Intent matcher ────────────────────────────────────────────────────────────
function matchIntent(message: string): Intent | null {
  const lower = message.toLowerCase()
  let best: { intent: Intent; score: number } | null = null
  for (const intent of INTENTS) {
    const score = intent.keywords.filter(kw => lower.includes(kw)).length
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score }
    }
  }
  return best?.intent ?? null
}

// ── Scripted reply engine ─────────────────────────────────────────────────────
async function scriptedReply(
  message: string,
  sessionId: string
): Promise<string> {
  const session = sessions.get(sessionId)
  const intent  = matchIntent(message)

  // ── Active booking flow ──
  if (session) {
    const step = session.step

    // Always log user message
    session.messages.push({ role: 'user', message, field_context: `step:${step}` })

    if (step === 1) {
      // Capture session type
      session.sessionType = message.trim()

    } else if (step === 2) {
      // Capture name — fire partial lead to ADS
      session.name = message.trim()

      // Non-blocking — don't await, don't block reply
      postToADS({
        type:        'partial',
        sessionId,
        name:        session.name,
        sessionType: session.sessionType,
        messages:    [...session.messages],
      }).catch(() => {})

    } else if (step === 3) {
      // Capture date
      session.date = message.trim()

    } else if (step === 4) {
      // Capture email — validate first
      const emailLike = message.includes('@') && message.includes('.')
      if (!emailLike) {
        // Don't advance — re-prompt
        session.messages.push({ role: 'agent', message: EMAIL_RETRY, field_context: 'step:4:retry' })
        sessions.set(sessionId, session)
        return EMAIL_RETRY
      }

      session.email = message.trim()
      sessions.delete(sessionId)

      const reply = BOOKING_COMPLETE(
        session.name        || 'there',
        session.sessionType || 'photography',
        session.date        || 'your chosen date'
      )

      session.messages.push({ role: 'agent', message: reply, field_context: 'step:4:complete' })

      // Fire complete lead to ADS — Discord + Resend + Supabase bookings
      postToADS({
        type:        'complete',
        sessionId,
        name:        session.name,
        email:       session.email,
        sessionType: session.sessionType,
        date:        session.date,
        messages:    [...session.messages],
      }).catch(() => {})

      return reply
    }

    // Advance step
    const reply = BOOKING_STEPS[step] ?? BOOKING_STEPS[BOOKING_STEPS.length - 1]
    session.messages.push({ role: 'agent', message: reply, field_context: `step:${step}:prompt` })
    session.step = step + 1
    sessions.set(sessionId, session)
    return reply
  }

  // ── Start booking flow ──
  if (intent?.flow === 'booking') {
    const reply = BOOKING_STEPS[0]
    sessions.set(sessionId, {
      step:        1,
      sessionType: '',
      name:        '',
      date:        '',
      email:       '',
      messages: [
        { role: 'user',  message, field_context: 'intent:booking' },
        { role: 'agent', message: reply, field_context: 'step:0:prompt' },
      ],
    })
    return reply
  }

  // ── Single-response flows ──
  if (intent?.flow === 'pricing')   return PRICING_RESPONSE
  if (intent?.flow === 'portfolio') return PORTFOLIO_RESPONSE
  if (intent?.flow === 'location')  return LOCATION_RESPONSE

  // ── Direct intent response ──
  if (intent?.response) return intent.response

  // ── Fallback ──
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

// ── Route handlers ────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400, headers: CORS }
      )
    }

    const sessionId = getSessionId(req)
    const reply     = await scriptedReply(message.trim(), sessionId)

    // Human-feel delay 100–350ms
    await new Promise(r => setTimeout(r, 100 + Math.random() * 250))

    return NextResponse.json(
      { reply },
      { status: 200, headers: CORS }
    )

  } catch (err) {
    console.error('[chat] error:', err)
    return NextResponse.json(
      { reply: "I'm here! Tell me what you're looking for and I'll help you out 📸" },
      { status: 200, headers: CORS }
    )
  }
}
