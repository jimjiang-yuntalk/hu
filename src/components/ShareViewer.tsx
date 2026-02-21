"use client"

import { useEffect, useState } from "react"
import AnswerPanel from "@/components/AnswerPanel"
import EvidencePanel from "@/components/EvidencePanel"
import type { Citation } from "@/lib/kb-search-rag"

type ShareRecord = {
  share_id: string
  type: "qa" | "report"
  content_markdown: string
  citations: Citation[]
}

export default function ShareViewer({ shareId }: { shareId: string }) {
  const [data, setData] = useState<ShareRecord | null>(null)
  const [active, setActive] = useState<Citation | undefined>(undefined)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/share/${shareId}`)
      if (!res.ok) {
        setError("分享内容不存在或无权限")
        return
      }
      const json = await res.json()
      setData(json)
    }
    load()
  }, [shareId])

  const onCitationClick = (citeId: string) => {
    const found = data?.citations.find((c) => c.cite_id === citeId)
    if (found) setActive(found)
  }

  if (error) return <div className="text-sm text-destructive">{error}</div>
  if (!data) return <div className="text-sm text-muted-foreground">加载中...</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AnswerPanel answerMarkdown={data.content_markdown} citations={data.citations} onCitationClick={onCitationClick} />
      <EvidencePanel citation={active} />
    </div>
  )
}
