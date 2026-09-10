import { pgTable, text, timestamp, integer, jsonb, serial, varchar, boolean } from 'drizzle-orm/pg-core'

// Users table - Authentication & Profile
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(), // bcrypt hashed password
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  avatar: text('avatar'), // URL or base64
  bio: text('bio'),
  
  // Preferences
  language: varchar('language', { length: 10 }).notNull().default('en'),
  currency: varchar('currency', { length: 10 }).notNull().default('EUR'),
  
  // Notification settings
  emailNotifications: boolean('email_notifications').notNull().default(true),
  pushNotifications: boolean('push_notifications').notNull().default(true),
  smsNotifications: boolean('sms_notifications').notNull().default(false),
  
  // Travel preferences
  budgetLevel: varchar('budget_level', { length: 50 }).default('standard'), // economy, standard, premium, luxury
  preferredActivities: jsonb('preferred_activities').$type<string[]>().default([]),
  
  // Account status
  emailVerified: boolean('email_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
})

// Conversations table - AI Chat History
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  
  // Conversation metadata
  title: varchar('title', { length: 255 }), // Auto-generated from first message
  language: varchar('language', { length: 10 }).notNull().default('en'),
  
  // Messages stored as JSON array
  messages: jsonb('messages').$type<Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    result?: any
    attachments?: any[]
  }>>().notNull().default([]),
  
  // Context & Intent
  lastIntent: varchar('last_intent', { length: 100 }), // 'flight_search', 'hotel_search', etc.
  travelContext: jsonb('travel_context'), // Destination, dates, etc.
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Bookings table - Travel Reservations
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  conversationId: integer('conversation_id').references(() => conversations.id), // Link to chat that created this
  
  userEmail: varchar('user_email', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  
  // Booking type and details
  type: varchar('type', { length: 50 }).notNull(), // 'flight' or 'hotel'
  offerData: jsonb('offer_data').notNull(), // Full offer object (airline, route, price, etc.)
  
  // Passenger/Guest information
  passengerData: jsonb('passenger_data').notNull(), // {name, email, passport, phone, etc.}
  
  // Payment details
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripePaymentStatus: varchar('stripe_payment_status', { length: 50 }), // 'pending', 'succeeded', 'failed'
  totalAmount: integer('total_amount').notNull(), // Amount in cents
  currency: varchar('currency', { length: 10 }).notNull().default('EUR'),
  
  // Booking status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'confirmed', 'cancelled'
  
  // Provider details
  provider: varchar('provider', { length: 100 }),
  providerOfferId: text('provider_offer_id'),
  providerBookingRef: text('provider_booking_ref'), // Reference from Duffel/RouteStack after actual booking
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Affiliate clicks tracking (already exists, keeping it)
export const affiliateClicks = pgTable('affiliate_clicks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // Optional: track which user clicked
  provider: text('provider').notNull(),
  product: text('product'),
  searchParams: jsonb('search_params'),
  clickedAt: timestamp('clicked_at').defaultNow().notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert
export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
export type AffiliateClick = typeof affiliateClicks.$inferSelect
export type NewAffiliateClick = typeof affiliateClicks.$inferInsert
