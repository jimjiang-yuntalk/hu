'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareLinkButton({
  url,
  label = '分享',
}: {
  url: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
      type="button"
    >
      {copied ? <Check className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
      {copied ? '已复制' : label}
    </button>
  )
}
