import { pgTable, text, timestamp, integer, jsonb, serial, varchar } from 'drizzle-orm/pg-core'

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // From Neon Auth
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

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert
