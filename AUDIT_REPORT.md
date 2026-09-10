# 🔍 BEKA PROJECT AUDIT REPORT

**Date:** 2026-09-08  
**Goal:** Transform BEKA into a real AI travel agent with `openai/gpt-oss-120b` and proper tool calling

---

## 📊 WHAT EXISTS (Current Implementation)

### ✅ 1. **Groq AI Connection**
**Status:** ✅ **WORKING** but using wrong model

**Current Setup:**
- File: `lib/ai/groq-client.ts`
- Model: `llama-3.3-70b-versatile` ❌ (Should be `openai/gpt-oss-120b`)
- Temperature: `0.8`
- API Key: Stored securely server-side ✅ (from .env.local)
- Method: JSON mode (not function calling)

**How it works:**
1. User sends message → `/api/ai/chat`
2. Backend calls `extractTravelIntent()` from `groq-client.ts`
3. Groq AI returns JSON with:
   - `intent` (flight_search, hotel_search, etc.)
   - `destination`, `checkIn`, `budget`, etc.
   - `needsMoreInfo` boolean
   - `responseMessage` (what AI says to user)
4. Backend searches travel APIs based on intent
5. Results sent back to UI

**Problem:**
- ❌ Not using function calling (manual JSON parsing)
- ❌ Wrong model (llama-3.3-70b instead of gpt-oss-120b)
- ❌ AI doesn't control when to call APIs (backend decides)
- ❌ Conversation history sent but not used optimally

---

### ✅ 2. **Real Travel API Integrations**

#### **Duffel (Flights) - LIVE ✅**
- File: `lib/travel/providers/duffel.ts`
- API Token: Configured in .env.local (DUFFEL_API_TOKEN)
- Status: **WORKING - Real flight searches**
- Returns: Real flight offers with pricing, airlines, routes

#### **RouteStack (Hotels/Flights) - LIVE ✅**
- File: `lib/travel/providers/routestack.ts`
- API Token: Configured in .env.local (ROUTESTACK_API_TOKEN)
- Status: **ENABLED** (not verified working)

#### **Wink (Hotels) - DISABLED ⚠️**
- Missing `CLIENT_SECRET`
- Currently disabled

#### **Booking.com (Hotels) - PARTIAL 🟡**
- File: `lib/travel/providers/booking-com.ts`
- Current: Returns **MOCK data** with affiliate links
- Missing: RapidAPI key for real hotel data
- Has: Affiliate tracking system

---

### ✅ 3. **Travel Search Flow**

**Current Architecture:**
```
User Message
    ↓
Frontend (app/page.tsx)
    ↓
/api/ai/chat (app/api/ai/chat/route.ts)
    ↓
Groq AI (lib/ai/groq-client.ts)
    ↓ Returns intent + extracted data
Backend decides to call:
    ├─ searchFlights() → Duffel API
    ├─ searchHotels() → RouteStack/Booking.com
    └─ searchActivities() → Mock only
    ↓
Results formatted and sent to UI
    ↓
User sees hotel/flight cards
```

**What's GOOD:**
- ✅ Real Duffel flights working
- ✅ API calls are server-side only (secure)
- ✅ Normalized response format
- ✅ Multi-provider system

**What's WRONG:**
- ❌ Backend makes all decisions (AI is just for intent detection)
- ❌ No tool calling - AI doesn't "choose" to search
- ❌ Mock data mixed with real data

---

### ❌ 4. **Mock/Fake Data Issues**

**Mock Data Locations:**
1. `lib/travel/mock-provider.ts` - Full mock provider
2. `lib/travel/providers/booking-com.ts` - Returns 3 fake hotels
3. `lib/user/mockData.ts` - Mock user profiles, bookings, payments

**Current Behavior:**
- If real API fails → fallback to mock ❌
- UI shows mock results as if they're real ❌
- User can't tell difference ❌

**Environment Control:**
- `MOCK_TRAVEL_PROVIDER=false` in `.env.local`
- But mock provider still registered in `lib/travel/registry.ts`

**Files to Clean:**
```
lib/travel/mock-provider.ts → DELETE or disable
lib/travel/providers/booking-com.ts → Remove mock hotels (lines 75-158)
lib/user/mockData.ts → Already not used in production
app/api/ai/chat/route.ts → Remove mock fallbacks (lines 59, 108)
```

---

### ❌ 5. **Function Calling (Tool Use)**

**Status:** ❌ **NOT IMPLEMENTED**

**Current:**
- No `tools` parameter in Groq API call
- No function definitions
- Backend hardcodes: "if intent === 'hotel_search' → call searchHotels()"

**Should Be:**
- AI has access to tools: `search_flights`, `search_hotels`, `get_details`, `create_booking`
- AI decides when to use tools based on conversation
- Backend executes tool calls and returns results to AI
- AI formats results naturally for user

---

### ✅ 6. **Error Handling**

**Current:**
- Tries real API
- Falls back to mock if enabled ❌
- Shows generic errors to user

**Should Be:**
- Try real API
- If fails: Tell user "Live search unavailable"
- Log technical error server-side
- Never show fake results

---

### ✅ 7. **Multilingual Support**

**Current:**
- System prompt mentions: "respond naturally in Arabic, English, Italian, French, German, Spanish"
- But implementation unclear
- No language detection
- No translation layer

**Missing:**
- Proper language detection from user message
- Response in user's language
- Travel results in user's language

---

## 📋 WHAT'S MISSING

### 1. **GPT-OSS-120B Model**
- Currently using: `llama-3.3-70b-versatile`
- Need: `openai/gpt-oss-120b`

### 2. **Function Calling (Tool Use)**
Need to implement:
```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_flights',
      description: 'Search for available flights between two airports',
      parameters: {
        type: 'object',
        properties: {
          origin: { type: 'string', description: 'Origin airport code or city' },
          destination: { type: 'string' },
          departureDate: { type: 'string', format: 'date' },
          returnDate: { type: 'string', format: 'date' },
          passengers: { type: 'number' },
          cabinClass: { type: 'string', enum: ['economy', 'business', 'first'] }
        },
        required: ['origin', 'destination', 'departureDate']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_hotels',
      // ... similar structure
    }
  }
]
```

### 3. **Tool Execution Loop**
```
User → AI
    ↓
AI: "I need to search_flights()"
    ↓
Backend: Executes search_flights()
    ↓
Backend: Returns results to AI
    ↓
AI: Formats results naturally
    ↓
User sees: "I found 5 flights for you..."
```

### 4. **Real Hotel Search**
- Need RapidAPI key
- Remove mock hotels from booking-com.ts
- Implement real Booking.com API search

### 5. **Activities/Tours**
- Currently mock only
- Need real provider (GetYourGuide, Viator)

### 6. **Clear Source Indicators**
UI should show:
- ✅ "Live results from Duffel"
- ❌ Never show fake results as real

---

## 🔧 WHAT WILL CHANGE

### **PHASE 1: Switch to GPT-OSS-120B with Function Calling**

**Files to modify:**
1. `lib/ai/groq-client.ts`
   - Change model to `openai/gpt-oss-120b`
   - Add function/tool definitions
   - Implement tool calling loop
   - Remove JSON mode

2. `app/api/ai/chat/route.ts`
   - Refactor to handle tool calls from AI
   - Remove hardcoded intent → API mapping
   - Let AI decide when to search

**New Flow:**
```
User: "Find me flights to Paris tomorrow"
    ↓
Backend → GPT-OSS-120B with tools
    ↓
AI: tool_call = search_flights({origin: "Current location", destination: "Paris", ...})
    ↓
Backend: Executes search_flights() → calls Duffel
    ↓
Backend → GPT-OSS-120B with tool results
    ↓
AI: "I found 3 flights from London to Paris tomorrow. Here are the best options..."
    ↓
User sees natural response + flight cards
```

---

### **PHASE 2: Remove All Mock Data from Production**

**Files to modify:**
1. `lib/travel/providers/booking-com.ts`
   - Delete lines 57-158 (mock hotels)
   - Return empty array if no RapidAPI key

2. `lib/travel/registry.ts`
   - Remove MockTravelProvider entirely
   - Or ensure it's never used in production

3. `app/api/ai/chat/route.ts`
   - Remove mock fallbacks (lines 59, 108, etc.)
   - Show clear error: "Live search temporarily unavailable"

4. `lib/travel/config.ts`
   - Ensure `mockEnabled = false` in production

---

### **PHASE 3: Normalize API Responses**

**Create:** `lib/travel/normalizer.ts`
```typescript
interface NormalizedOffer {
  type: 'flight' | 'hotel' | 'activity'
  id: string
  name: string
  price: { amount: number; currency: string }
  rating?: number
  image?: string
  location?: string
  provider: string
  bookingUrl?: string
  cancellationPolicy?: string
  details: Record<string, any>
}

export function normalizeFlight(duffelOffer): NormalizedOffer { ... }
export function normalizeHotel(routeStackOffer): NormalizedOffer { ... }
```

**Benefits:**
- UI doesn't need provider-specific logic
- Easy to add new providers
- Consistent data structure

---

### **PHASE 4: Improve Error Handling**

**Files to modify:**
1. `app/api/ai/chat/route.ts`
   ```typescript
   try {
     const results = await searchFlights(context)
     if (results.offers.length === 0) {
       return {
         message: "I couldn't find any available flights for those dates. Live search is currently limited. Would you like to try different dates?"
       }
     }
   } catch (error) {
     console.error('[Search Error]', error)
     return {
       message: "I'm having trouble searching flights right now. Please try again in a moment."
     }
   }
   ```

---

### **PHASE 5: Multilingual Support**

**Option 1: Let AI handle it**
- GPT-OSS-120B is multilingual
- System prompt: "Respond in the user's language"
- Detect language from first message

**Option 2: Explicit translation**
- Use separate translation API
- Translate user message → English → AI
- Translate AI response → user's language

**Recommendation:** Option 1 (simpler, AI handles it naturally)

---

## 🎯 IMPLEMENTATION PLAN

### **Step 1: Audit Verification** ✅ (This document)

### **Step 2: Switch AI Model + Add Function Calling**
**Time:** 2-3 hours

**Tasks:**
1. Update `groq-client.ts` to use `openai/gpt-oss-120b`
2. Define `search_flights` and `search_hotels` tools
3. Implement tool calling loop
4. Test with simple queries

**Success Criteria:**
- AI can call `search_flights()` tool
- Tool results returned to AI
- AI formats response naturally

---

### **Step 3: Remove Mock Data**
**Time:** 1 hour

**Tasks:**
1. Delete mock hotels from `booking-com.ts`
2. Remove mock fallbacks from `/api/ai/chat`
3. Ensure MockTravelProvider disabled in production
4. Test: Verify no fake results shown

**Success Criteria:**
- No mock data in production
- Clear error messages when APIs unavailable
- User knows when results are not available

---

### **Step 4: Test Full Flow**
**Time:** 2 hours

**Test Cases:**
1. "Find flights from London to Paris tomorrow"
   - Should call Duffel API
   - Show real flight results
   
2. "Find a hotel in Rome for 3 nights"
   - Should ask for check-in date
   - Search RouteStack (or say unavailable)
   - Never show fake results

3. "I want to go to Tokyo"
   - AI should ask clarifying questions
   - Use tools when enough info gathered

4. Error case: Disable Duffel token
   - Should show: "Live search unavailable"
   - Should NOT show fake results

---

### **Step 5: Add Real Hotel Search**
**Time:** 3 hours

**Tasks:**
1. Get RapidAPI key for Booking.com
2. Implement real hotel search in `booking-com.ts`
3. Test hotel searches
4. Verify affiliate links work

---

### **Step 6: Polish & Deploy**
**Time:** 2 hours

**Tasks:**
1. Add source indicators ("Live from Duffel")
2. Improve error messages
3. Test multilingual responses
4. Deploy to Vercel
5. Test production

---

## 📈 EXPECTED OUTCOMES

### **Before (Current):**
```
User: "Find hotel in Rome"
AI: Returns JSON intent
Backend: Calls API or returns mock
User: Sees results (can't tell if real or fake)
```

### **After (Goal):**
```
User: "Find hotel in Rome"
GPT-OSS-120B: "When would you like to check in?"
User: "Tomorrow for 3 nights"
GPT-OSS-120B: Calls search_hotels() tool
Backend: Executes real API call
GPT-OSS-120B: "I found 5 hotels in Rome. Here are the best ones for your dates..."
User: Sees REAL results with clear "Live from RouteStack" label
```

---

## ⚠️ CRITICAL NOTES

### **Do NOT Rebuild:**
- ✅ UI is good - keep it
- ✅ Authentication system - keep it
- ✅ Database schema - keep it
- ✅ Duffel integration - keep it
- ✅ Affiliate system - keep it

### **Only Change:**
- ❌ AI model (llama → gpt-oss-120b)
- ❌ Add function calling
- ❌ Remove mock data
- ❌ Improve error handling

---

## 📊 RISK ASSESSMENT

### **Low Risk:**
- Switching AI model (backward compatible)
- Removing mock data (improves honesty)
- Adding function calling (enhancement)

### **Medium Risk:**
- Refactoring `/api/ai/chat` (core functionality)
- Changing tool execution flow

### **Mitigation:**
- Test each change incrementally
- Keep backup of current code
- Test with real users before full deployment

---

## ✅ NEXT STEPS

**After approval, I will:**
1. Switch to `openai/gpt-oss-120b`
2. Implement function calling for `search_flights` and `search_hotels`
3. Remove all mock data from production flow
4. Test end-to-end
5. Deploy

**Estimated Total Time:** 8-10 hours of focused work

**Ready to proceed?** 🚀
