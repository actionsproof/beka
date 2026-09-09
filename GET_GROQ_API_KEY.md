# Get Your FREE Groq API Key 🚀

## Why Groq?
- ✅ **100% FREE** - No credit card required
- ✅ **SUPER FAST** - Fastest AI inference in the world
- ✅ **GPT-quality models** - Llama 3.3 70B (comparable to GPT-4)
- ✅ **Generous limits** - 30 requests/minute free tier
- ✅ **No billing surprises** - Completely free

## Step-by-Step Guide

### 1. Go to Groq Console
**URL**: https://console.groq.com/

### 2. Sign Up (FREE)
- Click **"Sign In"** or **"Get Started"**
- Use Google, GitHub, or Email
- **No credit card needed!**

### 3. Get API Key
1. After login, go to: https://console.groq.com/keys
2. Click **"Create API Key"**
3. Give it a name: "BEKA Travel App"
4. Click **"Submit"**
5. **Copy the API key** (starts with `gsk_...`)

### 4. Add to BEKA
Open your `.env.local` file and paste:
```env
GROQ_API_KEY=gsk_YOUR_ACTUAL_KEY_HERE
```

### 5. Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 6. Test It!
Open http://localhost:3000 and try:
- "flight to cairo tomorrow"
- "5 star hotel in rome for 4 nights under 600 euros"
- "i want to travel to dubai next week"

You should now get **REAL AI responses** instead of fake templates! 🎉

---

## What Changes?

### Before (Rule-Based):
```
User: "flight to cairo tomorrow"
BEKA: "What destination are you planning?" (fake, template)
```

### After (Real AI):
```
User: "flight to cairo tomorrow"
BEKA: "Let me search for flights to Cairo for tomorrow!" (understands naturally)
BEKA: Shows real flight results from Duffel/RouteStack
```

---

## Groq Models Available (All FREE!)

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| **openai/gpt-oss-120b** | ⚡️⚡️⚡️⚡️ | 🌟🌟🌟🌟🌟 | Travel chat (we use this!) |
| llama-3.3-70b-versatile | ⚡️⚡️⚡️ | 🌟🌟🌟🌟🌟 | General tasks |
| llama-3.1-8b-instant | ⚡️⚡️⚡️⚡️⚡️ | 🌟🌟🌟 | Simple queries |
| mixtral-8x7b-32768 | ⚡️⚡️⚡️⚡️ | 🌟🌟🌟🌟 | Long context |

We're using **OpenAI GPT-OSS-120B** - OpenAI's open-source model running on Groq's infrastructure. FREE and FAST!

---

## Rate Limits (Free Tier)

- **30 requests per minute** - More than enough for testing
- **14,400 requests per day** - Plenty for development
- **No token limits** - Use as much as you need

For production, you can upgrade to paid tier for higher limits.

---

## Troubleshooting

### "API key not configured"
- Make sure you pasted the key in `.env.local`
- Restart the dev server
- Key should start with `gsk_`

### "Rate limit exceeded"
- Free tier: 30 requests/minute
- Wait 60 seconds and try again
- Or upgrade to paid tier

### "Invalid API key"
- Generate a new key from console
- Make sure no extra spaces in `.env.local`

---

## Compare: Groq vs OpenAI

| Feature | Groq | OpenAI |
|---------|------|--------|
| **Cost** | FREE | $0.15-$30 per million tokens |
| **Speed** | 800+ tokens/sec | 50-100 tokens/sec |
| **Quality** | GPT-4 level | GPT-4 level |
| **Setup** | No credit card | Credit card required |
| **Best For** | Development & Testing | Production (if you have budget) |

---

## Next Steps

1. Get your Groq API key: https://console.groq.com/keys
2. Paste it in `.env.local`
3. Restart server: `npm run dev`
4. Test with natural language queries!

**Groq makes BEKA truly intelligent - for FREE!** 🚀
