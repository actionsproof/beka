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
  toolCall?: {
    id: string
    name: string
    arguments: Record<string, any>
  }
}

// Tool definitions for function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_flights',
      description: 'Search for available flights between two locations. Use this when user wants to find flights.',
      parameters: {
        type: 'object',
        properties: {
          origin: {
            type: 'string',
            description: 'Origin airport code (e.g., LON, PAR) or city name. Extract from user message.',
          },
          destination: {
            type: 'string',
            description: 'Destination airport code or city name',
          },
          departureDate: {
            type: 'string',
            description: 'Departure date in YYYY-MM-DD format',
          },
          returnDate: {
            type: 'string',
            description: 'Return date in YYYY-MM-DD format (optional for one-way)',
          },
          passengers: {
            type: 'number',
            description: 'Number of passengers (default: 1)',
            default: 1,
          },
          cabinClass: {
            type: 'string',
            enum: ['economy', 'business', 'first'],
            description: 'Cabin class preference',
            default: 'economy',
          },
        },
        required: ['origin', 'destination', 'departureDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_hotels',
      description: 'Search for available hotels in a destination. Use this when user wants to find hotels or accommodations.',
      parameters: {
        type: 'object',
        properties: {
          destination: {
            type: 'string',
            description: 'City or location name',
          },
          checkIn: {
            type: 'string',
            description: 'Check-in date in YYYY-MM-DD format',
          },
          checkOut: {
            type: 'string',
            description: 'Check-out date in YYYY-MM-DD format',
          },
          guests: {
            type: 'number',
            description: 'Number of guests (default: 2)',
            default: 2,
          },
          rooms: {
            type: 'number',
            description: 'Number of rooms (default: 1)',
            default: 1,
          },
          budget: {
            type: 'number',
            description: 'Maximum budget in EUR (optional)',
          },
          stars: {
            type: 'number',
            description: 'Minimum star rating 1-5 (optional)',
            minimum: 1,
            maximum: 5,
          },
        },
        required: ['destination', 'checkIn', 'checkOut'],
      },
    },
  },
] as const

export async function extractTravelIntent(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<TravelIntentResult> {
  if (!groq) {
    throw new Error('Groq is not configured')
  }

  const systemPrompt = `You are BEKA, a friendly and helpful AI travel assistant. You're conversational, warm, and understand natural language perfectly.

You have access to tools to search for real flights and hotels. Use them when you have enough information.

CRITICAL RULES FOR HOTEL SEARCHES:
1. ALWAYS ask for check-in date if missing - NEVER suggest partner sites without it!
2. Required info for hotel search: destination + check-in date + nights (or checkout)
3. Optional but helpful: budget, star rating, guests, rooms
4. Only mark needsMoreInfo=false when you have destination AND check-in date!

PARTNER SITE RULE:
- Only show partner sites AFTER collecting: destination + check-in + nights
- NEVER suggest partners on first message - always ask for missing info first!

CONVERSATION UNDERSTANDING:
- Read the FULL conversation history to understand context
- When user says "tomorrow", "after tomorrow", "next week" - calculate the actual date
- When discussing hotels and user provides a date, that's CHECK-IN (not departure)
- When discussing flights and user provides a date, that's DEPARTURE
- If user says "ok", "do it", "yes", "sure" - they're ready to search IF you have all required info!

DATE CALCULATIONS:
Today: ${new Date().toISOString().split('T')[0]}
Tomorrow: ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}
After tomorrow: ${new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]}
Next week: ${new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}

EXAMPLE CONVERSATIONS:

Example 1 - Missing Check-in Date (MOST COMMON):
User: "5 star hotel in Rome for 4 nights under 600 euros"
→ Extract: {
  "intent": "hotel_search",
  "destination": "Rome",
  "nights": 4,
  "budget": 600,
  "currency": "EUR",
  "hotelStars": 5,
  "guests": 2,
  "rooms": 1,
  "needsMoreInfo": true,
  "missingFields": ["checkIn"],
  "responseMessage": "Perfect! A luxurious 5-star hotel in Rome for 4 nights under €600 sounds wonderful! When would you like to check in?"
}

Example 2 - User Provides Check-in:
User: "5 star hotel in Rome for 4 nights under 600 euros"
Assistant: "Perfect! A luxurious 5-star hotel in Rome for 4 nights under €600 sounds wonderful! When would you like to check in?"
User: "after tomorrow"
→ Extract: {
  "intent": "hotel_search",
  "destination": "Rome",
  "checkIn": "${new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]}",
  "checkOut": "${new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]}",
  "nights": 4,
  "budget": 600,
  "currency": "EUR",
  "hotelStars": 5,
  "guests": 2,
  "rooms": 1,
  "needsMoreInfo": false,
  "missingFields": [],
  "responseMessage": "Excellent! Searching for 5-star hotels in Rome from ${new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} to ${new Date(Date.now() + 6 * 86400000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} under €600..."
}

Example 3 - User Says "OK" but Missing Info:
Assistant: "When would you like to check in?"
User: "ok"
→ Extract: {
  "intent": "hotel_search",
  "needsMoreInfo": true,
  "missingFields": ["checkIn"],
  "responseMessage": "I'd love to help! Could you tell me your preferred check-in date?"
}

Example 4 - Flight Search:
User: "flight to Paris tomorrow"
Assistant: "Great choice! Where will you be flying from?"
User: "London"
→ Extract: {
  "intent": "flight_search",
  "origin": "London",
  "destination": "Paris",
  "departureDate": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}",
  "needsMoreInfo": false,
  "missingFields": [],
  "responseMessage": "Perfect! Searching for flights from London to Paris tomorrow..."
}

IMPORTANT RULES:
1. Hotels REQUIRE: destination + checkIn date (or both checkIn + checkOut)
2. If user confirms ("ok", "yes") but you're missing info → ask again politely
3. Default assumptions: guests=2, rooms=1 for hotels
4. Be conversational and friendly, not robotic
5. Calculate checkout = checkin + nights days
6. NEVER suggest partner sites without check-in date!

Respond ONLY with JSON (no markdown, no code blocks):`

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userMessage },
  ]

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b', // GPT-OSS 120B model
    messages,
    tools: tools as any,
    tool_choice: 'auto', // Let AI decide when to use tools
    temperature: 0.8,
    max_tokens: 600,
  })

  const responseMessage = completion.choices[0].message

  // Check if AI wants to use a tool
  if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
    const toolCall = responseMessage.tool_calls[0]
    const functionName = toolCall.function.name
    const functionArgs = JSON.parse(toolCall.function.arguments)

    // Return tool call information
    return {
      intent: functionName === 'search_flights' ? 'flight_search' : 'hotel_search',
      needsMoreInfo: false,
      missingFields: [],
      responseMessage: `Searching for ${functionName === 'search_flights' ? 'flights' : 'hotels'}...`,
      toolCall: {
        id: toolCall.id,
        name: functionName,
        arguments: functionArgs,
      },
      ...functionArgs, // Include all extracted parameters
    } as any
  }

  // No tool call - AI is asking for more info or responding conversationally
  // Fall back to JSON mode for compatibility
  const jsonCompletion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.8,
    max_tokens: 600,
  })

  const result = JSON.parse(jsonCompletion.choices[0].message.content || '{}')
  return result as TravelIntentResult
}
