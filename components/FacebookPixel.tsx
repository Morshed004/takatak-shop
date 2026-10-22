'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function PixelTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // fbq ফাংশন কল করে পেজ ভিউ ট্র্যাক করা
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

export default function FacebookPixel() {
  return (
    <Suspense fallback={null}>
      <PixelTracker />
    </Suspense>
  )
}