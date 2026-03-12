"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  // Load initial search query from URL params
  useEffect(() => {
    const query = searchParams.get("q") || ""
    if (query !== searchQuery) {
        setSearchQuery(query)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to search results or keep on current page with query param
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery.trim())
      router.push(url.toString())
    }
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索羽毛球知识库..."
          className="w-full px-4 py-3 pr-12 rounded-full border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          🔍
        </button>
      </div>
    </form>
  )
}