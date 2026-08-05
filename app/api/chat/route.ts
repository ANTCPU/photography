// app/api/chat/route.ts
// Amanda Photography — Scripted booking agent
// Captures name + email + date + session type on booking completion
// Fires Discord notify on booking intent
// OpenAI-ready: when OPENAI_API_KEY is set, swap scriptedReply() for openaiReply()

import { NextRequest, NextResponse } from 'next/server'
import { AGENT, SEASON, CATEGORIES, API } from '@/lib/constants'

export const runtime = 'edge'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
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

// ── Booking session state ─────────────────────────────────────────────────────
// Edge runtime — in-memory per isolate, good enough for booking flow
// For persistence across restarts, swap with KV

interface BookingSession {
  step:        number
  sessionType: string
  name:        string
  date:        string
  email:       string
}

const sessions = new Map<string, BookingSession>()

function getSessionId(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ua = req.headers.get('user-agent')?.slice(0, 30) ?? 'ua'
  return `${ip}|${ua}`
}

// ── Intent map ────────────────────────────────────────────────────────────────

interface Intent {
  id:       string
  keywords: string[]
  flow?:    'booking' | 'pricing' | 'portfolio' | 'location'
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
    keywords: ['book','session','appointment','schedule','available','dates','when','reserve','sign up','set up','want to'],
    flow: 'booking',
  },
  {
    id: 'portrait',
    keywords: ['portrait','headshot','family','kids','baby','graduation','senior','couple','engagement','newborn'],
    response: "Portraits are my absolute favorite — there's nothing like capturing a real unguarded moment. I shoot natural light, on-location, no stiff poses. Want to talk dates? 📅",
  },
  {
    id: 'sports',
    keywords: ['sports','baseball','football','soccer','basketball','action','game','athlete','tournament','team','lacrosse','hockey'],
    response: "Love shooting sports — the energy and emotion are incredible. Outdoor or indoor, I've got you covered. What sport and what level are we talking? 🏆",
  },
  {
    id: 'lifestyle',
    keywords: ['lifestyle','outdoor','nature','casual','everyday','candid','golden hour','fall','autumn','family'],
    response: "Lifestyle sessions are so natural and fun — no stiff poses, just real moments in real places. Fall light right now is absolutely stunning. Want to pick a date? 🍂",
  },
  {
    id: 'travel',
    keywords: ['travel','trip','vacation','destination','outside','location','park','beach','mountain','downtown'],
    response: "I love shooting on-location — the more interesting the spot the better the story. Where are you thinking? ✈️",
  },
  {
    id: 'food',
    keywords: ['food','culinary','restaurant','dish','menu','product','chef','cooking','cafe'],
    response: "Food photography is such a craft — it's all about light and composition. Tell me about the project and I'll let you know what I can do. 🍽️",
  },
  {
    id: 'events',
    keywords: ['event','wedding','birthday','party','graduation','ceremony','concert','recital','reunion','corporate'],
    response: "Events are all about being in the right place at the right moment — I live for that. Tell me about your event: date, type, and location. 🎉",
  },
  {
    id: 'pricing',
    keywords: ['price','cost','rate','how much','fee','charge','budget','afford','expensive','cheap','quote','rates'],
    flow: 'pricing',
  },
  {
    id: 'location',
    keywords: ['where','location','travel','local','area','distance','far','drive','near','come to'],
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
    keywords: ['thanks','thank you','appreciate','perfect','great','awesome','sounds good','wonderful','amazing','love it'],
    response: "Of course — I'm so excited to work with you! Anything else I can help with? 📸",
  },
  {
    id: 'contact',
    keywords: ['contact','reach','call','email','phone','message','text','dm','instagram','social'],
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

Every session is tailored — reach out and we'll find something that works for you. Want to book?`

const PORTFOLIO_RESPONSE =
`Here's some of my recent work — head over to the full portfolio for the gallery:

👉 antcpu.com/manda

I shoot portraits, lifestyle, sports, travel, and culinary. What catches your eye?`

const LOCATION_RESPONSE =
`I'm based locally and shoot entirely on-location — parks, your home, sporting venues, downtown, wherever makes sense for your session.

I also travel for the right project. Where are you thinking? 📍`

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

// ── Discord notify on booking ─────────────────────────────────────────────────

async function notifyBooking(booking: BookingSession) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) return

  const embed = {
    title:       '📅 New Booking Request',
    color:       0xc8f564,
    fields: [
      { name: 'Name',         value: booking.name        || '—', inline: true  },
      { name: 'Session Type', value: booking.sessionType || '—', inline: true  },
      { name: 'Date',         value: booking.date        || '—', inline: true  },
      { name: 'Email',        value: booking.email       || '—', inline: false },
    ],
    footer: { text: `Amanda Photography · ${SEASON.label} · via agent` },
    timestamp: new Date().toISOString(),
  }

  try {
    await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ embeds: [embed] }),
    })
  } catch (err) {
    console.error('Discord notify failed:', err)
  }
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

    // Capture data from previous step's answer
    if (step === 1) {
      // They answered session type
      session.sessionType = message.trim()
    } else if (step === 2) {
      // They answered name
      session.name = message.trim()
    } else if (step === 3) {
      // They answered date
      session.date = message.trim()
    } else if (step === 4) {
      // They answered email — booking complete
      session.email = message.trim()
      sessions.delete(sessionId)

      // Fire Discord notification
      await notifyBooking(session)

      return BOOKING_COMPLETE(
        session.name || 'there',
        session.sessionType || 'photography',
        session.date || 'your chosen date'
      )
    }

    // Advance to next step
    session.step = step + 1
    sessions.set(sessionId, session)
    return BOOKING_STEPS[step] ?? BOOKING_STEPS[BOOKING_STEPS.length - 1]
  }

  // ── Start booking flow ──
  if (intent?.flow === 'booking') {
    sessions.set(sessionId, {
      step:        1,
      sessionType: '',
      name:        '',
      date:        '',
      email:       '',
    })
    return BOOKING_STEPS[0]
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

// ── OpenAI reply — swap in when key is available ──────────────────────────────
// To activate: set OPENAI_API_KEY in Vercel env vars
// Then replace `scriptedReply()` call below with `openaiReply()`

async function openaiReply(message: string): Promise<string> {
  const liveCategories = CATEGORIES
    .filter(c => c.live)
    .map(c => c.label)
    .join(', ')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       AGENT.model,
      max_tokens:  AGENT.maxTokens,
      temperature: 0.75,
      messages: [
        {
          role:    'system',
          content: `${AGENT.systemPrompt}\nLive categories: ${liveCategories}.\n${SEASON.cta}`,
        },
        { role: 'user', content: message },
      ],
    }),
  })

  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
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

    // ── Swap this line to activate OpenAI: ──
    // const reply = await openaiReply(message.trim())
    const reply = await scriptedReply(message.trim(), sessionId)

    // Small human-feel delay 100–350ms
    await new Promise(r => setTimeout(r, 100 + Math.random() * 250))

    return NextResponse.json(
      { reply },
      { status: 200, headers: CORS }
    )

  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json(
      { reply: "I'm here! Tell me what you're looking for and I'll help you out 📸" },
      { status: 200, headers: CORS }
    )
  }
}
