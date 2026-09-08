import { NextResponse } from 'next/server'
import { providerHealth } from '@/lib/travel/registry'
export async function GET() { return NextResponse.json({ generatedAt: new Date().toISOString(), providers: providerHealth() }) }
