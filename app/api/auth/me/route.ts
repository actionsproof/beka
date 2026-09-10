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

    // Transform flat DB structure to nested preferences for frontend
    const transformedUser = {
      ...userWithoutPassword,
      preferences: {
        language: user.language,
        currency: user.currency,
        notifications: {
          email: user.emailNotifications,
          push: user.pushNotifications,
          sms: user.smsNotifications,
        },
        budgetLevel: user.budgetLevel,
        preferredActivities: user.preferredActivities,
      }
    }

    return NextResponse.json({
      success: true,
      user: transformedUser,
    })
  } catch (error) {
    console.error('[Auth Me] Error:', error)
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
}

export async function PATCH(request: Request) {
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

    // Get update data
    const body = await request.json()
    const { name, email, phone, bio, avatar, preferences } = body

    // Build update object - map nested preferences to flat DB columns
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    
    // Map nested preferences to flat columns
    if (preferences) {
      if (preferences.language !== undefined) updateData.language = preferences.language
      if (preferences.currency !== undefined) updateData.currency = preferences.currency
      if (preferences.budgetLevel !== undefined) updateData.budgetLevel = preferences.budgetLevel
      if (preferences.preferredActivities !== undefined) updateData.preferredActivities = preferences.preferredActivities
      
      // Handle nested notifications
      if (preferences.notifications) {
        if (preferences.notifications.email !== undefined) updateData.emailNotifications = preferences.notifications.email
        if (preferences.notifications.push !== undefined) updateData.pushNotifications = preferences.notifications.push
        if (preferences.notifications.sms !== undefined) updateData.smsNotifications = preferences.notifications.sms
      }
    }

    console.log('[Profile Update]', { userId, updateData })

    // Update user in database
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't send password hash
    const { passwordHash: _, ...userWithoutPassword } = updatedUser

    // Transform flat DB structure to nested preferences for frontend
    const transformedUser = {
      ...userWithoutPassword,
      preferences: {
        language: updatedUser.language,
        currency: updatedUser.currency,
        notifications: {
          email: updatedUser.emailNotifications,
          push: updatedUser.pushNotifications,
          sms: updatedUser.smsNotifications,
        },
        budgetLevel: updatedUser.budgetLevel,
        preferredActivities: updatedUser.preferredActivities,
      }
    }

    return NextResponse.json({
      success: true,
      user: transformedUser,
    })
  } catch (error) {
    console.error('[Profile Update] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
