import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import en from '@/messages/en.json'
import ar from '@/messages/ar.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import it from '@/messages/it.json'
import ru from '@/messages/ru.json'
import pl from '@/messages/pl.json'

export type Locale = 'en' | 'ar' | 'fr' | 'de' | 'it' | 'ru' | 'pl'

const translations = {
  en,
  ar,
  fr,
  de,
  it,
  ru,
  pl,
}

type TranslationKeys = typeof en

interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale: Locale) => set({ locale }),
    }),
    {
      name: 'beka-language',
    }
  )
)

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationPath = NestedKeyOf<TranslationKeys>

export function useTranslation() {
  const { locale } = useI18n()

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key "${key}" not found for locale "${locale}"`)
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  return { t, locale }
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
