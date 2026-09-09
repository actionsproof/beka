# 💰 Booking.com Complete Affiliate Integration

## ✅ What's Implemented

Your BEKA travel app now has **complete Booking.com affiliate integration** to earn commissions on ALL travel products!

### 🎯 Products Available:
- ✈️ **Flights** - Earn commission on flight bookings
- 🏨 **Hotels** - 25-40% commission
- 🚗 **Car Rentals** - 10-15% commission  
- 🚕 **Airport Taxis** - Commission on transfers
- 🎫 **Tours & Attractions** - 8-12% commission

### How It Works:
1. User searches for any travel product (e.g., "Find me a hotel in Rome" or "Find flights to Paris")
2. If no API results available → Show "Search on Booking.com" button
3. User clicks → Redirected to Booking.com with pre-filled search
4. User books → **You earn commission!** 💵

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

**Hotels:**
```
User: "Find me a hotel in Rome"
Bot: "I can help you find hotels in Rome! Click below..."
[🏨 Search Hotels on Booking.com →]
```

**Flights:**
```
User: "Find flights from Cairo to Paris"
Bot: "Check out flights on Booking.com..."
[✈️ Search Flights on Booking.com →]
```

**Cars:**
```
User: "I need to rent a car in Rome"
Bot: "Browse car rentals on Booking.com..."
[🚗 Search Car Rentals on Booking.com →]
```

**Tours & Attractions:**
```
User: "What can I do in Rome?"
Bot: "Check out tours and attractions..."
[🎫 Browse Tours & Attractions →]
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

## 💡 Add More Affiliate Partners (Future)

While Booking.com covers most products, you can add specialized partners:

### 🎫 **GetYourGuide** (Better for Tours)
1. Sign up: https://partner.getyourguide.com/
2. Higher commission than Booking.com for tours (8-12%)
3. Better tour selection

### ✈️ **Skyscanner** (Alternative Flights)
1. Sign up: https://partners.skyscanner.net/
2. Compare more airlines
3. Often cheaper flights

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

**ONE BOOKING.COM LINK = ALL PRODUCTS!**

### Commission Rates:
- 🏨 **Hotels:** 25-40% per booking
- ✈️ **Flights:** 1-3% per booking
- 🚗 **Car Rentals:** 10-15% per booking
- 🎫 **Tours & Attractions:** 8-12% per booking
- 🚕 **Airport Taxis:** 5-10% per booking

### Monthly Potential (Example):
- 10 hotel bookings @ €200 avg = **€500-€800**
- 5 flight bookings @ €400 avg = **€20-€60**
- 3 car rentals @ €150 avg = **€45-€68**
- 15 tour bookings @ €80 avg = **€96-€144**

**Total: €661-€1,072/month from ONE affiliate link!** 🎉

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
