"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import AnswerPanel from "@/components/AnswerPanel"
import SwipeNavigator from "@/components/SwipeNavigator"
import EvidencePanel from "@/components/EvidencePanel"
import type { Citation } from "@/lib/kb-search-rag"
import { Button } from "@/components/ui/button"
import { Share2, ArrowLeft, BookOpen, FileText, X } from "lucide-react"

export default function QaPageClient({ 
  qa,
  prevHref,
  nextHref,
}: { 
  qa: { 
    id: string
    question: string
    answer: string | null
    citations_json: string | null
    createdAt: Date
  },
  prevHref?: string | null,
  nextHref?: string | null
}) {
  const [active, setActive] = useState<Citation | undefined>(undefined)
  const [shareLabel, setShareLabel] = useState("分享")
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const citations = qa.citations_json ? JSON.parse(qa.citations_json) as Citation[] : []

  const onCitationClick = (citeId: string) => {
    const found = citations.find((c) => c.cite_id === citeId)
    if (found) {
      setActive(found)
    }
  }

  const showCopied = () => {
    setShareLabel("已复制")
    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current)
    }
    shareTimerRef.current = setTimeout(() => {
      setShareLabel("分享")
    }, 2000)
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return
      }
    } catch {
      // fallback to legacy copy
    }

    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.top = "-9999px"
    textarea.style.left = "-9999px"
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    try {
      document.execCommand("copy")
    } catch {
      // ignore
    }
    document.body.removeChild(textarea)
  }

  const handleShare = async () => {
    const url = window.location.href
    await copyToClipboard(url)
    showCopied()

    if (navigator.share) {
      try {
        await navigator.share({
          title: qa.question,
          text: qa.question,
          url,
        })
      } catch {
        // user cancelled share
      }
    }
  }

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current)
      }
    }
  }, [])

  return (
    <SwipeNavigator prevHref={prevHref} nextHref={nextHref}>
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-screen-2xl">
          <Link href="/qa-history" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Link>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">问答详情</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {shareLabel}
          </Button>
        </div>
      </div>

      <div className="container max-w-screen-2xl py-6 md:py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Left Column: Main Content */}
        <div className="space-y-8 min-w-0">
          
          {/* Question Section */}
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{qa.question}</h1>
          </div>

          {/* Answer Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              <BookOpen className="h-4 w-4" />
              回答
            </div>
            <div className="rounded-xl border bg-card/50 p-6 md:p-8 shadow-sm">
              <AnswerPanel 
                answerMarkdown={qa.answer || "暂无回答"} 
                citations={citations} 
                onCitationClick={onCitationClick} 
                showTitle={false}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar (Sticky) */}
        <div className="hidden lg:block relative">
          <div className="sticky top-20 h-[calc(100vh-6rem)] flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {active ? "相关知识" : "相关知识"}
              </div>
              {active && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActive(undefined)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {active ? (
                <EvidencePanel citation={active} showTitle={false} className="border-0 bg-transparent p-0" />
              ) : (
                <div className="space-y-3">
                  {citations.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">暂无来源</div>
                  ) : (
                    citations.map((c) => (
                      <div 
                        key={c.cite_id} 
                        onClick={() => onCitationClick(c.cite_id)}
                        className="group flex flex-col gap-2 rounded-lg border bg-background p-3 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                            {c.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {c.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                             {c.heading || "段落"}
                           </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Evidence Drawer */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setActive(undefined)}
          />
          <div className="relative w-full max-h-[80vh] rounded-t-2xl bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">相关知识</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setActive(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              <EvidencePanel citation={active} showTitle={false} className="border-0 bg-transparent p-0" />
            </div>
          </div>
        </div>
      )}
    </div>
    </SwipeNavigator>
  )
}

