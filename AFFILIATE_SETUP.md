# 💰 Affiliate Integration Guide

## ✅ What's Implemented

Your BEKA travel app now has **Booking.com affiliate integration** to earn commissions on hotel bookings!

### How It Works:
1. User searches for hotels (e.g., "Find me a hotel in Rome")
2. If no API results available → Show "Search Hotels on Booking.com" button
3. User clicks → Redirected to Booking.com with pre-filled search
4. User books → **You earn 25-40% commission!** 💵

---

## 🔧 Setup Instructions

### 1. Add to Vercel Environment Variables

Go to your Vercel project settings and add:

```env
BOOKING_COM_AFFILIATE_URL=https://www.dpbolvw.net/click-101869299-15735418
```

### 2. Features Included:

✅ **Deep linking** - Pre-fills city, dates, guests, rooms  
✅ **Click tracking** - Saves to database for analytics  
✅ **20+ major cities** - Cairo, Rome, Paris, New York, Dubai, etc.  
✅ **AI integration** - Automatically suggests affiliate when no API results  
✅ **Responsive UI** - Beautiful button component

---

## 🎯 Where Affiliate Links Appear

### 1. **AI Chat (Automatic)**
```
User: "Find me a hotel in Rome"
Bot: "I can help you find hotels in Rome! Click the button below..."
[Search Hotels on Booking.com →]
```

### 2. **Standalone Hotel Search Page**
Create a page at `/hotels` using the `<AffiliateHotelSearch />` component

---

## 📊 Track Your Commissions

All clicks are saved in your Neon database:

```sql
SELECT * FROM affiliate_clicks 
WHERE provider = 'booking.com' 
ORDER BY clicked_at DESC;
```

Columns:
- `provider` - "booking.com"
- `search_params` - JSON with city, dates, guests
- `clicked_at` - Timestamp
- `user_agent` - Browser info

---

## 💡 Add More Affiliate Partners

Ready to add cars, tours, and activities? Here's how:

### 🚗 **Car Rentals (Rentalcars.com)**
1. Sign up: https://www.rentalcars.com/Affiliates.do
2. Get your affiliate link
3. Add to `.env.local`: `RENTALCARS_AFFILIATE_URL=your_link`
4. Create `lib/affiliates/rentalcars.ts` (copy pattern from booking-com.ts)

### 🎫 **Tours & Activities (GetYourGuide)**
1. Sign up: https://partner.getyourguide.com/
2. Get your partner ID
3. Add to `.env.local`: `GETYOURGUIDE_PARTNER_ID=your_id`
4. Create `lib/affiliates/getyourguide.ts`

### ✈️ **Flights (Skyscanner)**
1. Sign up: https://partners.skyscanner.net/
2. Get API access
3. Implement similar to booking.com

---

## 🚀 Next Steps

### Option 1: **Add More Affiliate Programs**
- Cars: Rentalcars.com (10-15% commission)
- Tours: GetYourGuide (8% commission)
- Activities: Viator (8-10% commission)

### Option 2: **Custom Hotel Search Page**
Create `/app/hotels/page.tsx`:
```tsx
import AffiliateHotelSearch from '@/components/affiliate-hotel-search'

export default function HotelsPage() {
  return (
    <main className="min-h-screen p-8">
      <AffiliateHotelSearch />
    </main>
  )
}
```

### Option 3: **Analytics Dashboard**
Build a page to show:
- Total clicks per day/month
- Most searched destinations
- Conversion estimates

---

## 💰 Expected Earnings

**Booking.com Commission:** 25-40% per booking

Example:
- User books €200 hotel → You earn €50-€80
- 10 bookings/month → €500-€800/month 🎉

**GetYourGuide Commission:** 8% per booking

Example:
- User books €100 tour → You earn €8
- 20 bookings/month → €160/month

---

## 📝 Files Created

```
lib/affiliates/
  └── booking-com.ts              # Booking.com link generator

components/
  ├── affiliate-hotel-search.tsx  # Standalone hotel search form
  └── affiliate-link-button.tsx   # Reusable affiliate button

app/api/affiliates/
  └── track/route.ts              # Click tracking API
```

---

## ✅ Checklist

- [x] Booking.com affiliate link configured
- [x] Deep linking with search params
- [x] Click tracking to database
- [x] AI chat integration
- [ ] Add to Vercel environment variables
- [ ] Test on production
- [ ] Add car rental affiliates
- [ ] Add tour/activity affiliates
- [ ] Build analytics dashboard

---

## 🎉 You're Ready!

Deploy to Vercel and start earning commissions! Every hotel search without API results will show your Booking.com affiliate link.

**Questions?** Check the code in `lib/affiliates/booking-com.ts`
