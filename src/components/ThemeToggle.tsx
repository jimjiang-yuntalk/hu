"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const getPreferredTheme = () => {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const initial = getPreferredTheme()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    window.localStorage.setItem("theme", next)
    applyTheme(next)
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={toggle}
      className="w-full justify-start gap-2"
      aria-label="切换明暗模式"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{theme === "dark" ? "明亮模式" : "暗黑模式"}</span>
    </Button>
  )
}
