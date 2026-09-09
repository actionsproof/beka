# 🚀 How to Add More Affiliate Partners

Your app now supports **multiple affiliate partners** with automatic prioritization!

## ✅ Currently Configured:
- ✅ **Booking.com** (Priority 1) - Hotels, flights, cars, tours

## 📝 **How to Add Your Expedia/Hotels.com/Others:**

### Step 1: Get Your Affiliate Links

#### **Expedia:**
1. Sign up: https://welcome.expediapartnercentral.com/
2. Get your affiliate link
3. Copy it (looks like: `https://www.expedia.com/...?AFFID=xxx`)

#### **Hotels.com:**
1. Sign up: https://welcome.expediapartnercentral.com/ (same as Expedia)
2. Get Hotels.com specific link
3. Copy it

#### **Agoda:**
1. Sign up: https://partners.agoda.com/
2. Get your partner ID
3. Generate tracking link

#### **Rentalcars.com:**
1. Sign up: https://www.rentalcars.com/Affiliates.do
2. Get affiliate link
3. Copy it

#### **GetYourGuide:**
1. Sign up: https://partner.getyourguide.com/
2. Get partner URL
3. Copy it

#### **Viator:**
1. Sign up: https://www.viator.com/partner
2. Get affiliate link
3. Copy it

---

### Step 2: Add to `.env.local`

Replace the placeholder URLs:

```env
# Expedia - Hotels, flights, cars, packages
EXPEDIA_AFFILIATE_URL=https://www.expedia.com/...?AFFID=YOUR_ID

# Hotels.com - Hotel specialist
HOTELS_COM_AFFILIATE_URL=https://www.hotels.com/...?AFFID=YOUR_ID

# Agoda - Strong in Asia
AGODA_AFFILIATE_URL=https://www.agoda.com/...?cid=YOUR_ID

# Rentalcars.com - Car specialist
RENTALCARS_AFFILIATE_URL=https://www.rentalcars.com/...?affiliateCode=YOUR_CODE

# GetYourGuide - Tours specialist
GETYOURGUIDE_AFFILIATE_URL=https://www.getyourguide.com/...?partner_id=YOUR_ID

# Viator - Premium tours
VIATOR_AFFILIATE_URL=https://www.viator.com/...?pid=YOUR_ID
```

---

### Step 3: Add to Vercel

Go to Vercel → Your Project → Settings → Environment Variables

Add each one you configured in `.env.local`

---

### Step 4: Restart & Deploy

```bash
# Local testing
npm run dev

# Deploy to Vercel (auto-deploys on git push)
git add .env.local
# Note: .env.local is gitignored, so manually add vars to Vercel
```

---

## 🎯 **How Priority Works:**

The system automatically chooses the **best partner** for each product:

### Hotels:
1. **Booking.com** (Priority 1) - 25-40% commission → Used first
2. **Expedia** (Priority 2) - 4-7% commission → Fallback
3. **Hotels.com** (Priority 3) - 4-6% commission → Fallback
4. **Agoda** (Priority 4, Asia region) - 4-7% → Fallback for Asia

### Flights:
1. **Duffel API** (Your checkout) - 100% profit → Always used when available
2. **Booking.com** (Priority 1) - 1-3% commission → Fallback
3. **Expedia** (Priority 2) - 2-5% commission → Fallback

### Cars:
1. **Booking.com** (Priority 1) - 10-15% commission
2. **Rentalcars** (Priority 2) - 10-15% commission → Alternative
3. **Expedia** (Priority 2) - 5-10% commission → Alternative

### Tours & Activities:
1. **GetYourGuide** (Priority 2) - 8-12% commission → Better than Booking.com!
2. **Booking.com** (Priority 1) - 8-12% commission → General fallback
3. **Viator** (Priority 3) - 8-10% commission → Premium fallback

---

## 💡 **Smart Features:**

### 1. **Automatic Partner Selection**
The system picks the best partner based on:
- Product type
- Commission rate
- Regional specialization
- Availability

### 2. **Regional Optimization**
- **Agoda** prioritized for Asia destinations
- **Global partners** for everywhere else

### 3. **Fallback Chain**
If primary partner unavailable → tries backup partners automatically

### 4. **Commission Tracking**
Shows which partner was used and commission rate

---

## 📊 **Example: User Searches "Hotels in Tokyo"**

```
1. Check Duffel API → No hotels (flights only)
2. Check priority partners:
   - Agoda (Priority 4, Asia) → 4-7% commission
   - Booking.com (Priority 1) → 25-40% commission
3. Select Agoda (regional specialist for Asia)
4. Show button: "Search Hotels on Agoda"
5. User clicks → Earn 4-7% commission
```

---

## 🔧 **Customize Priorities:**

Edit `lib/affiliates/manager.ts`:

```typescript
// Make Expedia primary for hotels
providers.push({
  provider: 'expedia',
  priority: 1, // Change from 2 to 1
  // ...
})
```

---

## ✅ **Testing:**

### Test Each Provider:
```
1. Add affiliate URL to .env.local
2. Restart dev server: npm run dev
3. Search for hotels/flights/cars
4. Check which button appears
5. Click → Should redirect correctly
```

### Check Database:
```sql
SELECT provider, product, COUNT(*) 
FROM affiliate_clicks
GROUP BY provider, product;
```

---

## 🎉 **Benefits of Multiple Partners:**

1. **Higher Commissions** - Use best rates per product
2. **Backup Options** - Fallback if primary fails
3. **Regional Optimization** - Better for specific regions
4. **User Choice** - (Future) Show multiple options
5. **A/B Testing** - Test which converts better

---

## 💰 **Commission Comparison:**

| Partner | Hotels | Flights | Cars | Tours |
|---------|--------|---------|------|-------|
| **Booking.com** | 25-40% | 1-3% | 10-15% | 8-12% |
| **Expedia** | 4-7% | 2-5% | 5-10% | - |
| **Hotels.com** | 4-6% | - | - | - |
| **Agoda** | 4-7% | - | - | - |
| **Rentalcars** | - | - | 10-15% | - |
| **GetYourGuide** | - | - | - | 8-12% |
| **Viator** | - | - | - | 8-10% |

**Recommendation:** Use Booking.com as primary (best commissions), add others as backups!

---

## 📝 **Your Setup Checklist:**

- [x] Booking.com configured (PRIMARY)
- [ ] Expedia link added
- [ ] Hotels.com link added  
- [ ] Agoda link added
- [ ] Rentalcars link added
- [ ] GetYourGuide link added
- [ ] Viator link added
- [ ] All added to Vercel
- [ ] Tested each partner
- [ ] Checked database tracking

---

**Questions?** Check `lib/affiliates/manager.ts` for technical details!
