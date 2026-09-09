import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function GET(request: Request) {
  try {
    // Get token from cookie
    const token = request.headers.get('cookie')?.split('auth-token=')[1]?.split(';')[0]

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't send password hash
    const { passwordHash: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('[Auth Me] Error:', error)
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
}
