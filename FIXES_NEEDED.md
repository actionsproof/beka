# BEKA Tours - Issues to Fix Tomorrow

## 🔴 CRITICAL ISSUES (Not Working)

### 1. Conversations Don't Persist on Refresh
**Problem:** User logs in, chats with AI, refreshes page → everything disappears

**What We Tried:**
- ✅ Added auto-save with useEffect (debounced 1 second)
- ✅ Fixed database schema mismatch (text vs content)
- ✅ Added conversation loading on page mount
- ⚠️ **STILL NOT WORKING**

**Likely Issues:**
- Database schema might not match (check `conversations` table structure)
- Auth token might be expiring/not persisting
- API transformation might have bugs
- Frontend state loading might have race conditions

**Files Involved:**
- `app/page.tsx` - Frontend conversation management
- `app/api/conversations/route.ts` - Save/load conversations API
- `lib/db/schema.ts` - Database schema (check messages field type)

**To Fix Tomorrow:**
1. Test API endpoints directly with Postman/curl
2. Check database to see if data is actually being saved
3. Verify JWT token persists across page refreshes
4. Add better error logging to see where it's failing
5. Consider simplifying the auto-save logic (might be too complex)

---

### 2. Past Conversations in Sidebar Don't Load
**Problem:** Clicking a past conversation in sidebar doesn't restore the chat

**What We Did:**
- Added onClick handler to load conversation messages + context
- Added active conversation highlighting

**Likely Issues:**
- Conversations list might be empty (not fetching correctly)
- Messages transformation might fail when loading
- State update might not trigger re-render

**To Fix Tomorrow:**
1. Console.log the conversations array to see what's loaded
2. Test clicking a conversation and check state updates
3. Verify the messages/context are in correct format

---

## 🟡 PARTIAL IMPLEMENTATION (Needs Testing)

### 3. Booking.com Hotel Search
**Status:** Code implemented but not tested with real data

**What We Did:**
- ✅ Created `lib/travel/providers/booking-com.ts` 
- ✅ Registered provider in registry
- ✅ Added mock hotels with affiliate deep links
- ✅ Updated HotelCard to open Booking.com in new tab
- ✅ Created `/api/affiliate/track` to track clicks

**Needs Tomorrow:**
1. Get RapidAPI key for real Booking.com data
2. Test with real hotel searches
3. Verify affiliate links work correctly (check if your affiliate ID is in URL)
4. Test click tracking in database

**RapidAPI Setup:**
- Sign up at https://rapidapi.com/apidojo/api/booking
- Get FREE API key
- Add to `.env.local`: `RAPIDAPI_KEY=your_key_here`

---

### 4. AI Conversation Rules
**Status:** Rules added but behavior needs verification

**What We Did:**
- ✅ AI MUST ask for check-in date before showing partner sites
- ✅ Required info: destination + check-in + nights
- ✅ Better conversation understanding
- ⚠️ **User reported: "AI is stupid, doesn't understand"**

**Likely Issues:**
- AI prompt might be too strict
- Groq model (llama-3.3-70b) might not be smart enough
- Temperature 0.8 might be too random
- Context/history not passing correctly

**To Fix Tomorrow:**
1. Test actual conversations with AI
2. Review AI responses and see where it fails
3. Consider switching back to better model if needed
4. Simplify the prompt instructions
5. Add more example conversations to guide AI

---

## 📋 WHAT'S WORKING

✅ **Authentication System:**
- Login/Signup pages
- JWT tokens with HTTP-only cookies
- Password hashing with bcrypt
- Protected API routes

✅ **Database:**
- Neon PostgreSQL connected
- Tables: users, conversations, bookings, affiliate_clicks
- Drizzle ORM working

✅ **Duffel Flights:**
- Real flight search API integration
- Displays flight results in chat
- Booking flow works

✅ **Affiliate System:**
- Multi-provider setup (Booking.com, Expedia, Agoda)
- Affiliate link generation
- Click tracking API endpoint

✅ **UI/UX:**
- Clean, modern interface
- Dark/light theme toggle
- Responsive design
- Sidebar with navigation

✅ **Deployment:**
- GitHub repo: https://github.com/actionsproof/beka
- Vercel auto-deployment
- Domain: beka.tours (connected)

---

## 🎯 PLAN FOR TOMORROW

### Priority 1: Fix Conversation Persistence (CRITICAL)
1. **Debug the save flow:**
   - Add console.logs everywhere
   - Test API endpoints manually
   - Check database directly

2. **Verify JWT auth:**
   - Confirm token persists on refresh
   - Check token expiration settings
   - Test /api/auth/me endpoint

3. **Simplify if needed:**
   - Remove auto-save useEffect if it's causing issues
   - Go back to manual save on each message
   - Make it work first, optimize later

### Priority 2: Test AI Conversations
1. **Test the full flow:**
   ```
   User: "Find me a hotel in Rome"
   AI: Should ask "When would you like to check in?"
   User: "tomorrow"
   AI: Should search and show hotels
   User: Click hotel → Opens Booking.com
   ```

2. **Fix AI if it's "stupid":**
   - Review actual AI responses
   - Adjust prompt/model if needed
   - Add better error handling

### Priority 3: Test Booking.com Integration
1. Get RapidAPI key
2. Test real hotel searches
3. Verify affiliate links have correct parameters
4. Test click tracking

### Priority 4: Polish & Test Everything
1. Test full user journey end-to-end
2. Fix any bugs discovered
3. Add better error messages
4. Improve loading states

---

## 🔧 DEBUGGING COMMANDS FOR TOMORROW

### Check if conversations are saved in database:
```sql
-- Connect to Neon database and run:
SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 5;
```

### Test API endpoints:
```bash
# Test save conversation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","messages":[{"role":"user","text":"Hello"}],"context":{}}'

# Test load conversations
curl http://localhost:3000/api/conversations
```

### Check browser console for errors:
- Open DevTools (F12)
- Go to Console tab
- Look for red errors
- Check Network tab for failed API calls

### Test auth token:
```javascript
// In browser console:
document.cookie
// Should see: auth-token=...
```

---

## 📝 NOTES

**Environment Variables Set:**
- ✅ DATABASE_URL (Neon PostgreSQL)
- ✅ JWT_SECRET
- ✅ GROQ_API_KEY
- ✅ DUFFEL_API_TOKEN
- ✅ STRIPE keys (live mode)
- ✅ Affiliate IDs (Booking.com, Agoda, Expedia)
- ⚠️ RAPIDAPI_KEY (not set yet - need to get)

**Latest Commits:**
1. `c44a7d3` - Fixed database schema mismatch
2. `cb5218d` - Auto-save with useEffect
3. `b5e03cd` - Conversation persistence attempt
4. `42903d2` - Booking.com provider + affiliate tracking
5. `32d6913` - AI rules: must ask check-in date

**Known Issues User Reported:**
1. ❌ Conversations don't save/persist
2. ❌ Past conversations don't load
3. ❌ AI is "stupid" and doesn't understand
4. ❌ Hotel search shows immediate affiliate links instead of results

---

## 💡 SUGGESTIONS FOR IMPROVEMENT

1. **Add Better Logging:**
   - Log every save attempt
   - Log every load attempt
   - Log API responses
   - Makes debugging much easier

2. **Add User Feedback:**
   - Show "Saving..." indicator
   - Show success/error toasts
   - Let user know what's happening

3. **Simplify First:**
   - Get basic save/load working
   - Then add auto-save
   - Then add debouncing
   - Build complexity gradually

4. **Test More:**
   - Test in incognito mode
   - Test after clearing cookies
   - Test with network throttling
   - Test error cases

---

## 📞 READY FOR TOMORROW

All code is committed and pushed to GitHub.
Vercel is auto-deploying (though some features broken).

**Main Goal Tomorrow:** 
Make conversations persist reliably - this is the foundation everything else builds on!

Good luck! 🚀
