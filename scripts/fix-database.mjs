import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

console.log('🔄 Fixing database schema...')

// Drop tables in correct order (children first due to foreign keys)
await sql`DROP TABLE IF EXISTS affiliate_clicks CASCADE`
await sql`DROP TABLE IF EXISTS bookings CASCADE`
await sql`DROP TABLE IF EXISTS conversations CASCADE`
await sql`DROP TABLE IF EXISTS users CASCADE`

console.log('✅ Old tables dropped. Now run: node scripts/push-db.mjs')
