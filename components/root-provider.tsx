'use client'

import { useEffect } from 'react'
import { useI18n, getDirection } from '@/lib/i18n'

export function RootProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n()
  const dir = getDirection(locale)

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  return <>{children}</>
}
