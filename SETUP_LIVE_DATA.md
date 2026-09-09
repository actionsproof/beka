# Setting Up Live Data for BEKA Travel App 🚀

## Overview
BEKA currently uses **mock data** for development. This guide will help you connect **real live travel APIs** to get actual flights, hotels, and pricing.

## Current Status
- ✅ **UI/UX**: Fully functional with 7 languages
- ✅ **Mock Data**: Working for development/testing
- ⏸️ **Live APIs**: Not configured yet (need your credentials)

---

## 🔑 What You Need

The app supports **3 travel API providers**. You can enable one, two, or all three:

### 1. **Duffel** (Recommended for Flights)
- **What it does**: Flight bookings, hotel search
- **Sign up**: https://duffel.com/
- **Pricing**: Pay-per-booking model
- **Best for**: Flight inventory

**To get credentials**:
1. Go to https://duffel.com/ → Sign Up
2. Create an account
3. Go to Dashboard → API Keys
4. Create a new API key (Test or Live mode)
5. Copy the API token

### 2. **RouteStack** (Multi-Provider Aggregator)
- **What it does**: Aggregates multiple travel providers
- **Sign up**: https://www.routestack.com/
- **Best for**: Comprehensive travel search

**To get credentials**:
1. Sign up at https://www.routestack.com/
2. Access your dashboard
3. Navigate to API Settings
4. Generate API token
5. Copy the token

### 3. **Wink** (Hotels & Accommodations)
- **What it does**: Hotel inventory, booking management
- **Sign up**: https://www.wink.travel/
- **Pricing**: Subscription-based
- **Best for**: Hotel inventory

**To get credentials**:
1. Sign up at https://www.wink.travel/
2. Create an application in your dashboard
3. Get OAuth2 credentials (Client ID & Client Secret)
4. Copy both values

---

## 📝 Step-by-Step Setup

### Step 1: Create `.env.local` File

I've already created a template file called `.env.local` in your project root. Open it and fill in your credentials.

**Location**: `c:\Users\ragab\Desktop\beka tours\.env.local`

### Step 2: Fill in Your API Credentials

Open `.env.local` and update these sections based on which providers you have:

#### Option A: Enable Duffel (Flights)
```env
DUFFEL_ENABLED=true
DUFFEL_API_URL=https://api.duffel.com
DUFFEL_API_TOKEN=duffel_test_YOUR_ACTUAL_TOKEN_HERE
```

#### Option B: Enable RouteStack
```env
ROUTESTACK_ENABLED=true
ROUTESTACK_API_URL=https://api.routestack.com
ROUTESTACK_API_TOKEN=YOUR_ACTUAL_TOKEN_HERE
```

#### Option C: Enable Wink (Hotels)
```env
WINK_ENABLED=true
WINK_BOOKING_ENABLED=true
WINK_TOKEN_URL=https://api.wink.travel/oauth/token
WINK_CLIENT_ID=YOUR_CLIENT_ID_HERE
WINK_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

#### Enable Mock Fallback (Recommended during testing)
```env
MOCK_TRAVEL_PROVIDER=true
```
When `true`, if the live API fails or returns no results, mock data will be shown as fallback.

### Step 3: Restart Your Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The app will automatically load your new credentials.

---

## 🧪 Testing Live Data

### Test Flight Search:
1. Open http://localhost:3000
2. Type: "Find flights from Cairo to Rome"
3. You should see:
   - ✅ **Live data**: "I found X live flight options"
   - ⚠️ **Mock data**: "Here are development-only illustrative flights"
   - ❌ **No data**: "No configured flight provider returned results"

### Test Hotel Search:
1. Type: "Find a hotel in Rome for 4 nights"
2. You should see:
   - ✅ **Live data**: "I found X live hotel options"
   - ⚠️ **Mock data**: "Here are development-only illustrative stays"

### Check Data Source:
Open browser DevTools (F12) → Network tab → Look for requests to:
- `https://api.duffel.com` (Duffel)
- `https://api.routestack.com` (RouteStack)
- `https://api.wink.travel` (Wink)

---

## 📊 Which Provider Should I Use?

| Provider | Flights | Hotels | Activities | Best For |
|----------|---------|--------|------------|----------|
| **Duffel** | ✅ Excellent | ✅ Good | ❌ No | Flight-focused apps |
| **RouteStack** | ✅ Good | ✅ Good | ✅ Yes | All-in-one solution |
| **Wink** | ❌ No | ✅ Excellent | ❌ No | Hotel-focused apps |

**Recommendation**: 
- **Budget-friendly**: Start with Duffel (flights) + Wink (hotels)
- **Comprehensive**: Use RouteStack (all-in-one)
- **Best Coverage**: Enable all three (app will try each in order)

---

## 💰 Cost Considerations

### Free/Testing:
- **Duffel**: Free test mode with sandbox data
- **RouteStack**: Contact for trial
- **Wink**: Free tier available

### Production:
- **Duffel**: Pay per booking (commission-based)
- **RouteStack**: Monthly subscription
- **Wink**: Subscription-based pricing

---

## 🔧 Troubleshooting

### Issue: "No configured provider returned results"
**Solution**:
1. Check your API credentials in `.env.local`
2. Verify the provider is enabled (`DUFFEL_ENABLED=true`)
3. Check API token is valid (test in provider dashboard)
4. Restart dev server after changing `.env.local`

### Issue: Mock data still showing
**Possible causes**:
1. Provider not enabled in `.env.local`
2. Invalid API credentials
3. API rate limit reached
4. Network/firewall blocking API requests

**Check**:
```bash
# View logs in terminal where dev server is running
# Look for error messages like:
# "Duffel API error: 401 Unauthorized"
# "RouteStack connection failed"
```

### Issue: Authentication errors
**For Wink (OAuth2)**:
1. Verify Client ID and Secret are correct
2. Check token URL is: `https://api.wink.travel/oauth/token`
3. Ensure both credentials are from same application

---

## 🚀 Next Steps After Setup

Once live data is working:

### 1. Disable Mock Fallback (Optional)
When confident in your live APIs:
```env
MOCK_TRAVEL_PROVIDER=false
```

### 2. Add More Features
- **Booking**: Implement actual booking flow
- **Payment**: Integrate Stripe for payments
- **User Auth**: Add real user accounts (NextAuth.js)
- **Database**: Store bookings and user data

### 3. Production Deployment
- Use production API keys (not test keys)
- Set up proper error monitoring
- Add rate limiting
- Configure caching for API responses

---

## 📧 What to Send Me

To help you set up, please provide:

1. **Which provider(s) you signed up for**:
   - [ ] Duffel
   - [ ] RouteStack
   - [ ] Wink

2. **Your credentials** (send securely):
   ```
   DUFFEL_API_TOKEN=duffel_test_xxxxx
   ROUTESTACK_API_TOKEN=xxxxx
   WINK_CLIENT_ID=xxxxx
   WINK_CLIENT_SECRET=xxxxx
   ```

3. **Any error messages** you see when testing

---

## 🔒 Security Notes

- ✅ Never commit `.env.local` to Git (already in `.gitignore`)
- ✅ Use test/sandbox keys during development
- ✅ Rotate keys regularly in production
- ✅ Keep client secrets secure (never expose in frontend)

---

## 📚 Additional Resources

- **Duffel Docs**: https://duffel.com/docs/api
- **RouteStack Docs**: https://docs.routestack.com/
- **Wink Docs**: https://docs.wink.travel/
- **BEKA GitHub**: [Your repo URL]

---

**Questions?** Let me know which provider you want to start with and I'll help you set it up!
