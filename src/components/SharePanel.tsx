'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'

type QuoteOption = {
  id: string
  content: string
  author?: string
}

export default function SharePanel({ quotes = [], sharePath = '' }: { quotes?: QuoteOption[]; sharePath?: string }) {
  const [copied, setCopied] = useState(false)
  const [manualText, setManualText] = useState('')
  const [selectedQuoteId, setSelectedQuoteId] = useState('')
  const [customText, setCustomText] = useState('')
  const [tip, setTip] = useState('')

  const currentUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    if (sharePath) {
      try {
        return new URL(sharePath, window.location.origin).toString()
      } catch {
        return `${window.location.origin}${sharePath}`
      }
    }
    return window.location.href
  }, [sharePath])

  const selectedQuote = useMemo(() => {
    return quotes.find((q) => q.id === selectedQuoteId)
  }, [quotes, selectedQuoteId])

  const buildShareText = () => {
    const custom = customText.trim()
    if (custom) return custom
    if (selectedQuote) {
      return selectedQuote.author
        ? `【羽坛金句】${selectedQuote.content} —— ${selectedQuote.author}`
        : `【羽坛金句】${selectedQuote.content}`
    }
    return ''
  }

  const copyWithFallback = async (text: string) => {
    if (!text) return false

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      try {
        const input = document.createElement('textarea')
        input.value = text
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.focus()
        input.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(input)
        return ok
      } catch {
        return false
      }
    }
  }

  const handleShare = async () => {
    setTip('')
    const url = currentUrl
    const title = document.title || '斛教练 AI乒羽馆'
    const text = buildShareText()

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // 用户取消或系统不支持时，继续走复制兜底
      }
    }

    const payload = text ? `${text}\n${url}` : url
    const ok = await copyWithFallback(payload)
    if (ok) {
      setCopied(true)
      setManualText('')
      setTimeout(() => setCopied(false), 1500)
    } else {
      setManualText(payload)
    }
  }

  const handleWeChat = async () => {
    const url = currentUrl
    const text = buildShareText()
    const payload = text ? `${text}\n${url}` : url

    const ok = await copyWithFallback(payload)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } else {
      setManualText(payload)
    }

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
    const isWeChatWebView = ua.includes('micromessenger')

    if (isWeChatWebView) {
      setTip('请点击右上角“···”→ 发送给朋友 / 分享到朋友圈')
      return
    }

    setTip('已复制分享内容，正在尝试打开微信')
    setTimeout(() => {
      window.location.href = 'weixin://'
    }, 120)
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="text-sm font-medium">分享设置</div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">选择一条羽坛金句（可选）</div>
        <select
          value={selectedQuoteId}
          onChange={(e) => setSelectedQuoteId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">不使用金句</option>
          {quotes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.content}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">或自定义分享文案（优先级更高）</div>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="输入你想分享的话..."
          className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          系统分享
        </Button>
        <Button onClick={handleWeChat} variant="secondary" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          微信分享
        </Button>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {copied ? (
            <>
              <Check className="h-3 w-3 text-primary" /> 已复制分享内容
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> 失败时自动复制
            </>
          )}
        </div>
      </div>

      {tip && <div className="text-xs text-muted-foreground">{tip}</div>}

      {manualText && (
        <textarea
          readOnly
          value={manualText}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-xs"
        />
      )}
    </div>
  )
}
