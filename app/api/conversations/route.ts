import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { conversations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as { userId: number; email: string }
  } catch {
    return null
  }
}

// GET /api/conversations - Fetch user's conversations
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch last 10 conversations for this user
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, user.userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(10)

    return NextResponse.json({ conversations: userConversations })
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST /api/conversations - Create or update conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, messages, context, conversationId } = body

    if (conversationId) {
      // Update existing conversation
      const [updated] = await db
        .update(conversations)
        .set({
          messages,
          context,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(conversations.id, conversationId))
        .returning()

      return NextResponse.json({ conversation: updated })
    } else {
      // Create new conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId: user.userId,
          title: title || 'New conversation',
          messages,
          context: context || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning()

      return NextResponse.json({ conversation: newConversation })
    }
  } catch (error) {
    console.error('Failed to save conversation:', error)
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 })
  }
}
