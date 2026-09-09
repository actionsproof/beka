import { config } from 'dotenv'
import { execSync } from 'child_process'

// Load .env.local
config({ path: '.env.local' })

console.log('🔄 Pushing database schema to Neon...')
console.log(`📍 Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]}`)

try {
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: { ...process.env }
  })
  console.log('✅ Database schema pushed successfully!')
} catch (error) {
  console.error('❌ Failed to push schema')
  process.exit(1)
}
