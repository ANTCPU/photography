// app/api/chat/route.ts
// Amanda Photography — AI chat endpoint
// Powers the public booking agent at antcpu.com/manda/agent/
// Uses AGENT config from lib/constants for system prompt + model settings

import { NextRequest, NextResponse } from 'next/server'
import { AGENT, SEASON, CATEGORIES } from '@/lib/constants'

export const runtime = 'edge'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
}

// Warm fallbacks — used when OpenAI is unavailable
// Rotate so repeat failures feel natural
const FALLBACKS = [
  "Fall light is absolutely magical right now — I'd love to capture that for you. What kind of session are you thinking?",
  "Thanks for reaching out! Tell me a bit about what you have in mind and we'll find the perfect time.",
  "I'm here! Whether it's portraits, sports, or lifestyle — let's make something beautiful. What are you looking for?",
  "Golden hour this time of year is just stunning. What type of session interests you most?",
  "I'd love to work with you this fall! Can you tell me a little about what you're envisioning?",
]

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message: string = body.message?.trim()
    const systemOverride: string | undefined = body.system

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400, headers: CORS }
      )
    }

    // Build live category context for the system prompt
    const liveCategories = CATEGORIES
      .filter(c => c.live)
      .map(c => c.label)
      .join(', ')

    const systemPrompt = systemOverride ?? `${AGENT.systemPrompt}
Current live portfolio categories: ${liveCategories}.
${SEASON.cta}`

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:      AGENT.model,
        max_tokens: AGENT.maxTokens,
        temperature: 0.75,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: message },
        ],
      }),
    })

    if (!openaiRes.ok) {
      console.error(`OpenAI error: ${openaiRes.status}`)
      throw new Error(`OpenAI ${openaiRes.status}`)
    }

    const data  = await openaiRes.json()
    const reply = data.choices?.[0]?.message?.content?.trim()

    if (!reply) throw new Error('Empty response from OpenAI')

    return NextResponse.json({ reply }, { status: 200, headers: CORS })

  } catch (err) {
    console.error('Chat route error:', err)
    // Always return 200 with a warm reply — never expose errors to clients
    const fallback = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    return NextResponse.json(
      { reply: fallback },
      { status: 200, headers: CORS }
    )
  }
}
