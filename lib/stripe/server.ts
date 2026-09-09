import 'server-only'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Check if using organization key
const isOrgKey = process.env.STRIPE_SECRET_KEY.startsWith('sk_org_')

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// For organization keys, you need the account ID
// Get it from: https://dashboard.stripe.com/settings/account
export const STRIPE_ACCOUNT_ID = process.env.STRIPE_ACCOUNT_ID || null

if (isOrgKey && !STRIPE_ACCOUNT_ID) {
  console.warn('⚠️  Using organization API key without STRIPE_ACCOUNT_ID. Add it to .env.local')
}
