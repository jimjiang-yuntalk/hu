"use client"

import { useEffect, useState } from "react"

export default function HighlightSearch({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search)
    const q = urlParams.get("q")
    if (q) {
      setSearchQuery(q)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery) return

    // Function to highlight text
    const highlightText = (element: HTMLElement, query: string) => {
      if (element.nodeType === Node.TEXT_NODE) {
        const text = element.textContent || ""
        if (text.toLowerCase().includes(query.toLowerCase())) {
          const highlighted = text.replace(
            new RegExp(`(${query})`, 'gi'),
            '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>'
          )
          const span = document.createElement('span')
          span.innerHTML = highlighted
          element.parentNode?.replaceChild(span, element)
        }
      } else {
        // Skip highlighting in certain elements
        if (element.tagName === 'MARK' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
          return
        }
        for (let child of element.childNodes) {
          highlightText(child as HTMLElement, query)
        }
      }
    }

    // Apply highlighting to the main content area
    const mainContent = document.querySelector('.prose')
    if (mainContent) {
      highlightText(mainContent as HTMLElement, searchQuery)
    }
  }, [searchQuery])

  return <>{children}</>
}