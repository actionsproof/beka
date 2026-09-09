# Internationalization (i18n) Setup

## Overview
BEKA now supports 7 languages with a complete translation system:
- 🇬🇧 English (en)
- 🇸🇦 Arabic (ar) - RTL support
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇮🇹 Italian (it)
- 🇷🇺 Russian (ru)
- 🇵🇱 Polish (pl)

## File Structure

```
messages/
├── en.json  # English (default)
├── ar.json  # Arabic
├── fr.json  # French
├── de.json  # German
├── it.json  # Italian
├── ru.json  # Russian
└── pl.json  # Polish

lib/i18n/
└── index.ts # Translation hook and utilities
```

## Usage

### Basic Translation

```typescript
import { useTranslation } from '@/lib/i18n'

function MyComponent() {
  const { t, locale } = useTranslation()
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
      <button>{t('common.save')}</button>
    </div>
  )
}
```

### Change Language

```typescript
import { useI18n } from '@/lib/i18n'

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="ar">العربية</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
      <option value="it">Italiano</option>
      <option value="ru">Русский</option>
      <option value="pl">Polski</option>
    </select>
  )
}
```

### RTL Support (for Arabic)

```typescript
import { getDirection } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n'

function App() {
  const { locale } = useI18n()
  const dir = getDirection(locale)
  
  return (
    <div dir={dir} className={dir === 'rtl' ? 'font-arabic' : ''}>
      {/* Your content */}
    </div>
  )
}
```

## Translation Keys

All translations are organized by category:

### Common Keys
- `common.back` - "Back to BEKA"
- `common.save` - "Save Changes"
- `common.cancel` - "Cancel"
- `common.edit` - "Edit Profile"
- `common.loading` - "Loading..."
- `common.viewDetails` - "View Details"
- `common.filter` - "Filter"

### Navigation Keys
- `nav.askBeka` - "Ask BEKA"
- `nav.explore` - "Explore"
- `nav.myTrips` - "My trips"
- `nav.newChat` - "New chat"
- `nav.profileSettings` - "Profile & Settings"
- `nav.myBookings` - "My Bookings & Trips"

### Home Page Keys
- `home.title` - "Where will you go?"
- `home.subtitle` - Description text
- `home.placeholder` - Input placeholder
- `home.suggestions.*` - Suggestion prompts

### Profile Keys
- `profile.tabs.*` - Tab names
- `profile.personalInfo` - "Personal Information"
- `profile.travelPreferences` - "Travel Preferences"
- `profile.budget.*` - Budget levels

### Bookings Keys
- `bookings.title` - "Your Bookings"
- `bookings.confirmed` - "Confirmed"
- `bookings.pending` - "Pending"
- `bookings.completed` - "Completed"
- `bookings.cancelled` - "Cancelled"

### Payments Keys
- `payments.title` - "Payment History"
- `payments.methods.*` - Payment method names
- `payments.status.*` - Payment statuses

### Settings Keys
- `settings.notifications` - "Notification Preferences"
- `settings.accountSettings` - "Account Settings"
- `settings.language` - "Language"
- `settings.currency` - "Currency"

## Adding New Translations

### Step 1: Add to English (en.json)
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is a description"
  }
}
```

### Step 2: Add translations to all other language files
Repeat the structure in ar.json, fr.json, de.json, it.json, ru.json, and pl.json with appropriate translations.

### Step 3: Use in your component
```typescript
const { t } = useTranslation()
<h1>{t('myFeature.title')}</h1>
```

## How to Implement Translations in Existing Components

### Example: Updating a Component

**Before:**
```typescript
function BookingCard() {
  return (
    <div>
      <h2>Your Bookings</h2>
      <button>View Details</button>
    </div>
  )
}
```

**After:**
```typescript
import { useTranslation } from '@/lib/i18n'

function BookingCard() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h2>{t('bookings.title')}</h2>
      <button>{t('common.viewDetails')}</button>
    </div>
  )
}
```

## Language Persistence

The selected language is automatically saved in localStorage using Zustand's persist middleware. The language preference persists across:
- Page refreshes
- Browser sessions
- Different tabs

## Best Practices

1. **Always use translation keys, never hardcoded text**
   ```typescript
   // ❌ Bad
   <button>Save Changes</button>
   
   // ✅ Good
   <button>{t('common.save')}</button>
   ```

2. **Group related translations**
   ```json
   {
     "bookings": {
       "title": "...",
       "status": {
         "confirmed": "...",
         "pending": "..."
       }
     }
   }
   ```

3. **Use descriptive keys**
   ```json
   // ❌ Bad
   { "btn1": "Save" }
   
   // ✅ Good
   { "common": { "save": "Save Changes" } }
   ```

4. **Keep translations consistent**
   - Use the same term for the same concept across all pages
   - Example: Always use "bookings" not sometimes "reservations"

5. **Test with RTL (Arabic)**
   - Check layout doesn't break
   - Ensure icons flip appropriately
   - Test text alignment

## Next Steps

To fully implement translations across the app:

1. **Update Main Page (app/page.tsx)**
   - Replace hardcoded strings with `t()` calls
   - Import `useTranslation` hook

2. **Update Profile Page (app/profile/page.tsx)**
   - Already has language selector
   - Need to wrap strings in `t()` calls

3. **Update Dashboard (app/dashboard/page.tsx)**
   - Replace all text with translation keys

4. **Add Language Selector to Header**
   - Create dropdown in main navigation
   - Allow quick language switching

5. **Add RTL Layout Support**
   - Update root layout for dir attribute
   - Add Arabic font if needed
   - Test all components in RTL mode

## Testing Translations

1. **Change language in Profile > Settings**
2. **Check localStorage** - Should see `beka-language` key
3. **Refresh page** - Language should persist
4. **Navigate between pages** - Language should stay consistent

## Missing Translations

If a translation key is not found:
- The key itself will be displayed (e.g., "home.title")
- A warning will be logged to console
- Add the missing key to all language files

## Example: Quick Start

To see translations in action, add this to any component:

```typescript
'use client'

import { useTranslation, useI18n } from '@/lib/i18n'

export default function TranslationDemo() {
  const { t, locale } = useTranslation()
  const { setLocale } = useI18n()
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('home.title')}</h1>
      <p className="mt-2">{t('home.subtitle')}</p>
      
      <div className="mt-4">
        <label>Choose Language:</label>
        <select 
          value={locale} 
          onChange={(e) => setLocale(e.target.value as any)}
          className="ml-2 border rounded px-2 py-1"
        >
          <option value="en">🇬🇧 English</option>
          <option value="ar">🇸🇦 العربية</option>
          <option value="fr">🇫🇷 Français</option>
          <option value="de">🇩🇪 Deutsch</option>
          <option value="it">🇮🇹 Italiano</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="pl">🇵🇱 Polski</option>
        </select>
      </div>
      
      <div className="mt-4">
        <button className="px-4 py-2 bg-primary text-white rounded">
          {t('common.save')}
        </button>
        <button className="ml-2 px-4 py-2 border rounded">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
```

## Contact & Support

For questions about translations or adding new languages, refer to the translation JSON files in the `messages/` directory.
