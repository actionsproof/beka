# Testing API Connection Checklist ✅

## Quick Test Steps

### 1. Check Environment Variables Loaded
Open your browser DevTools (F12) and run in Console:
```javascript
// This won't show secret keys (they're server-side only)
// But you can check if the app detects enabled providers
```

### 2. Test API Endpoint Directly
Open: http://localhost:3000/api/ai/chat

Make a POST request:
```bash
# Using curl (PowerShell)
curl -X POST http://localhost:3000/api/ai/chat `
  -H "Content-Type: application/json" `
  -d '{"message": "Find flights from Cairo to Rome"}'
```

**Expected Response**:
```json
{
  "intent": "flight_search",
  "context": {
    "origin": "Cairo",
    "destination": "Rome"
  },
  "source": "live",  // ✅ or "mock" // ⚠️
  "message": "I found 5 live flight options.",
  "result": {
    "kind": "flights",
    "offers": [...]
  }
}
```

### 3. Check Source Field
- **"live"** ✅ = Real API data
- **"mock"** ⚠️ = Fallback mock data (API failed or not configured)
- **"unavailable"** ❌ = No data source available

### 4. Check Provider Errors
If `providerErrors` array is present in response:
```json
{
  "providerErrors": [
    {
      "provider": "duffel",
      "error": "Authentication failed"
    }
  ]
}
```

This tells you which provider failed and why.

---

## Common Error Messages

### ❌ "Authentication failed" / 401 Unauthorized
**Problem**: Invalid API token
**Fix**: 
1. Double-check your API token in `.env.local`
2. Make sure there are no extra spaces
3. Verify token is still valid in provider dashboard

### ❌ "CORS error" / Network failed
**Problem**: Browser blocking request
**Fix**: 
- This shouldn't happen (API calls are server-side)
- If it does, check if you're calling API from frontend directly

### ❌ "Rate limit exceeded"
**Problem**: Too many requests to API
**Fix**:
- Wait a few minutes
- Upgrade your API plan
- Implement caching

### ❌ "No results found"
**Problem**: Valid request but no matching flights/hotels
**Fix**:
- Try different search terms
- Check if test mode has limited inventory
- Mock fallback will show if enabled

---

## Debug Mode

Enable detailed logging:

1. **Update `.env.local`**:
```env
BEKA_DEBUG=true
```

2. **Restart server**:
```bash
npm run dev
```

3. **Check terminal logs**:
You'll see detailed API request/response logs:
```
[BEKA] Searching flights via Duffel...
[BEKA] Duffel request: POST https://api.duffel.com/air/offers
[BEKA] Duffel response: 200 OK (5 offers)
```

---

## Test Each Provider Individually

### Test Duffel:
```env
DUFFEL_ENABLED=true
ROUTESTACK_ENABLED=false
WINK_ENABLED=false
```

### Test RouteStack:
```env
DUFFEL_ENABLED=false
ROUTESTACK_ENABLED=true
WINK_ENABLED=false
```

### Test Wink:
```env
DUFFEL_ENABLED=false
ROUTESTACK_ENABLED=false
WINK_ENABLED=true
```

This helps isolate which provider is working or having issues.

---

## Check Server Logs

When you run `npm run dev`, watch the terminal for:

### ✅ Success:
```
✓ Duffel API connected
✓ Found 12 flight offers from Cairo to Rome
```

### ⚠️ Warning:
```
⚠ Duffel API returned 0 results, using mock fallback
```

### ❌ Error:
```
✗ Duffel API error: 401 Unauthorized
✗ Check your DUFFEL_API_TOKEN in .env.local
```

---

## API Response Time

Normal response times:
- **Mock data**: < 100ms (instant)
- **Live API**: 1-5 seconds (depends on provider)
- **Timeout**: 8 seconds (configurable via `BEKA_PROVIDER_TIMEOUT_MS`)

If requests take longer than 8 seconds, they'll timeout and fall back to mock data (if enabled).

---

## Verify API Keys Format

### Duffel Token:
```
duffel_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- Should start with `duffel_test_` (test mode)
- Or `duffel_live_` (production)

### Wink Client ID & Secret:
```
Client ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- UUID format for Client ID
- Long alphanumeric string for Secret

---

## Contact Support

If still having issues:

1. **Take screenshots** of:
   - Your `.env.local` (hide sensitive parts)
   - Terminal error messages
   - Browser console errors
   - API response in Network tab

2. **Gather info**:
   - Which provider (Duffel/RouteStack/Wink)
   - Error message
   - When it started happening

3. **Check provider status**:
   - Duffel: https://status.duffel.com/
   - Your provider's status page

---

**Ready to test?** 
1. Fill in `.env.local` with your credentials
2. Run `npm run dev`
3. Try a search: "Find flights from Cairo to Rome"
4. Check if you see "live" or "mock" in the response!
