"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowUp, Loader2, Sparkles, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FloatingChat() {
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // file input uses label for mobile compatibility
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!query.trim()) {
          setIsExpanded(false)
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [query])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = inputRef.current.scrollHeight + "px"
    }
  }, [query])

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "上传失败")
    }

    const data = await res.json()
    return data?.url as string
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setIsLoading(true)

    try {
      const imageUrl = await uploadImage(file)
      const res = await fetch("/api/chat-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, query }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "生成失败")
      }
      const data = await res.json()
      if (data?.qaId) {
        router.push(`/qa/${data.qaId}`)
      }
      setQuery("")
      setIsExpanded(false)
    } catch (err: any) {
      setError(err?.message || "生成失败")
    } finally {
      setIsLoading(false)
      if (e.target) e.target.value = ""
    }
  }

  const submit = async () => {
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    const q = query.trim()

    // 直接进入生成页面，避免在原页面等待
    router.push(`/qa/loading?q=${encodeURIComponent(q)}`)

    setQuery("")
    setIsExpanded(false)
    setIsLoading(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleExpand = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div 
        ref={containerRef}
        className={cn(
          "pointer-events-auto transition-all duration-300 ease-in-out bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden",
          isExpanded ? "w-full max-w-2xl rounded-2xl" : "w-[200px] hover:w-[220px] rounded-full h-12 cursor-pointer"
        )}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        {!isExpanded ? (
          // Collapsed State (Pill)
          <div className="flex items-center justify-center h-full gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>斛教练</span>
          </div>
        ) : (
          // Expanded State (Chat Window)
          <div className="flex flex-col w-full p-2">
            <div className="relative flex items-end gap-2 p-2">
              <label
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground hover:bg-muted/80",
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
                title="上传图片"
              >
                <ImagePlus className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isLoading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <div className="flex-1 min-h-[44px]">
                <textarea
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="欢迎提问"
                  className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-base max-h-[200px] overflow-y-auto placeholder:text-muted-foreground/60"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={submit}
                disabled={!query.trim() || isLoading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 mb-0.5",
                  query.trim() 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {error && (
              <div className="px-4 pb-1 text-xs text-destructive">
                {error}
              </div>
            )}

            {/* Footer / Hints */}
            <div className="px-4 pb-2 pt-1 flex items-center justify-between text-[10px] text-muted-foreground/60 select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>斛教练</span>
              </div>
              <div className="hidden sm:block">
                Enter 发送 · Shift + Enter 换行
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
