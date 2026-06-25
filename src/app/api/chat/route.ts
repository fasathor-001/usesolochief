import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildContextPackage, buildSystemPrompt } from '@/lib/ai/context-builder'
import { getAIChatLimit } from '@/lib/plan-limits'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function monthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limit = getAIChatLimit(plan)

  // Enforce monthly quota — count this month's user messages
  if (limit !== Infinity) {
    const { count } = await supabase
      .from('ai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', monthStart())

    const used = count ?? 0
    if (used >= limit) {
      return NextResponse.json(
        {
          error: `You have used all ${limit} AI Chat messages for this month. Upgrade to Pro for unlimited access.`,
          quotaExceeded: true,
          used,
          limit,
        },
        { status: 429 },
      )
    }
  }

  const body = await request.json()
  const userMessage: string = body.message?.trim()
  if (!userMessage) {
    return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 })
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!workspace) {
    return new Response(JSON.stringify({ error: 'No workspace found' }), { status: 400 })
  }

  // Build context package (D-010 — loads before every AI call)
  const context = await buildContextPackage()
  const systemPrompt = buildSystemPrompt(context)

  // Load last 20 messages for conversation history
  const { data: history } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('user_id', user.id)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(20)

  const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = (
    (history ?? []).reverse() as { role: 'user' | 'assistant'; content: string }[]
  )

  conversationHistory.push({ role: 'user', content: userMessage })

  // Save user message immediately
  await supabase.from('ai_messages').insert({
    user_id: user.id,
    workspace_id: workspace.id,
    role: 'user',
    content: userMessage,
    model: 'claude-sonnet-4-6',
  })

  const encoder = new TextEncoder()
  let fullText = ''

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationHistory,
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullText += event.delta.text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
            )
          }
        }

        // Save assistant message after stream completes
        await supabase.from('ai_messages').insert({
          user_id: user.id,
          workspace_id: workspace.id,
          role: 'assistant',
          content: fullText,
          model: 'claude-sonnet-4-6',
          confidence: context.intelligence.adviceConfidence,
        })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
