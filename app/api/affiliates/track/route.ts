import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { provider, searchParams, timestamp } = body

    // Create affiliate_clicks table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS affiliate_clicks (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        search_params JSONB,
        clicked_at TIMESTAMP DEFAULT NOW(),
        user_agent TEXT,
        ip_address TEXT
      )
    `)

    // Insert click tracking
    await db.execute(sql`
      INSERT INTO affiliate_clicks (provider, search_params, clicked_at, user_agent)
      VALUES (${provider}, ${JSON.stringify(searchParams)}, ${timestamp}, ${request.headers.get('user-agent')})
    `)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Affiliate Track] Error:', error)
    return NextResponse.json(
      { error: 'Failed to track affiliate click' },
      { status: 500 }
    )
  }
}
