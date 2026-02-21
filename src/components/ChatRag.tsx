"use client"

import { useState } from "react"
import AnswerPanel from "@/components/AnswerPanel"
import EvidencePanel from "@/components/EvidencePanel"
import type { Citation } from "@/lib/kb-search-rag"

export default function ChatRag() {
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [citations, setCitations] = useState<Citation[]>([])
  const [active, setActive] = useState<Citation | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [shareUrl, setShareUrl] = useState("")

  const ask = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError("")
    setAnswer("")
    setCitations([])
    setActive(undefined)
    setShareUrl("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "检索失败")
      }
      const data = await res.json()
      setAnswer(data?.answer_markdown || "")
      setCitations(data?.citations || [])
    } catch (err: any) {
      setError(err?.message || "检索失败")
    } finally {
      setLoading(false)
    }
  }

  const onCitationClick = (citeId: string) => {
    const found = citations.find((c) => c.cite_id === citeId)
    if (found) setActive(found)
  }

  const createShare = async () => {
    if (!answer) return
    const res = await fetch("/api/share/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "qa",
        content_markdown: answer,
        citations,
        access: "public",
      }),
    })
    const data = await res.json()
    if (data?.share_id) {
      setShareUrl(`${window.location.origin}/share/${data.share_id}`)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-muted/40 p-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about 羽毛球知识库..."
          className="min-h-[72px] w-full resize-none bg-transparent text-sm focus:outline-none"
        />
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">RAG 可溯源问答</div>
          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-destructive">{error}</span>}
            <button
              onClick={ask}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? "检索中..." : "发送"}
            </button>
            <button
              onClick={createShare}
              className="inline-flex items-center rounded-full bg-secondary px-4 py-2 text-sm font-medium"
              disabled={!answer}
            >
              Share
            </button>
          </div>
        </div>
        {shareUrl && (
          <div className="text-xs text-muted-foreground mt-2">
            分享链接：<a className="text-primary underline" href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnswerPanel answerMarkdown={answer} citations={citations} onCitationClick={onCitationClick} />
        <EvidencePanel citation={active} />
      </div>
    </section>
  )
}
