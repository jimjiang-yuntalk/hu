"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"

export default function SwipeNavigator({
  prevHref,
  nextHref,
  children,
}: {
  prevHref?: string | null
  nextHref?: string | null
  children: React.ReactNode
}) {
  const router = useRouter()
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!startRef.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - startRef.current.x
    const dy = touch.clientY - startRef.current.y
    startRef.current = null

    if (Math.abs(dx) < 60) return
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return

    if (dx < 0 && nextHref) {
      router.push(nextHref)
    } else if (dx > 0 && prevHref) {
      router.push(prevHref)
    }
  }

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {children}
    </div>
  )
}
