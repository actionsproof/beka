import 'server-only'
import Groq from 'groq-sdk'

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  console.warn('[Groq] API key not configured. AI-powered chat will not be available.')
}

export const groq = apiKey ? new Groq({ apiKey }) : null

export const AI_ENABLED = Boolean(apiKey)

export interface TravelIntentResult {
  intent: 'flight_search' | 'hotel_search' | 'multi_search' | 'trip_planning' | 'general'
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  rooms?: number
  nights?: number
  budget?: number
  currency?: string
  hotelStars?: number
  needsMoreInfo: boolean
  missingFields: string[]
  responseMessage: string
}

export async function extractTravelIntent(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<TravelIntentResult> {
  if (!groq) {
    throw new Error('Groq is not configured')
  }

  const systemPrompt = `You are BEKA, an AI travel agent. Extract travel intent and details from conversations.

CRITICAL: Understand conversation context!

If conversation is about HOTELS and user says "tomorrow", that's CHECK-IN date, not flight date.
If conversation is about FLIGHTS and user says "tomorrow", that's DEPARTURE date.

Examples:
User: "5 star hotel in Rome for 4 nights under 600 euros"
Assistant: "To find the best 5-star hotel in Rome for 4 nights under €600, could you let me know your desired check-in date?"
User: "tomorrow"
→ Extract: intent="hotel_search", destination="Rome", hotelStars=5, nights=4, budget=600, currency="EUR", checkIn=tomorrow, checkOut=tomorrow+4days, needsMoreInfo=false

User: "flight to Cairo tomorrow"
Assistant: "Where are you flying from?"
User: "Milan"
→ Extract: intent="flight_search", origin="Milan", destination="Cairo", departureDate=tomorrow, needsMoreInfo=false

Respond ONLY with JSON (no markdown):
{
  "intent": "hotel_search",
  "destination": "Rome",
  "checkIn": "YYYY-MM-DD",
  "checkOut": "YYYY-MM-DD",
  "nights": 4,
  "budget": 600,
  "currency": "EUR",
  "hotelStars": 5,
  "needsMoreInfo": false,
  "missingFields": [],
  "responseMessage": "Let me search for 5-star hotels in Rome!"
}

Current date: ${new Date().toISOString().split('T')[0]}
Tomorrow: ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}

Rules:
- Use FULL conversation history
- "one way" only applies to flights
- For hotels: checkOut = checkIn + nights
- Search when you have enough info!`

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ]

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b', // OpenAI's open-source model on Groq!
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 500,
  })

  const result = JSON.parse(completion.choices[0].message.content || '{}')
  return result as TravelIntentResult
}
