"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import * as Icons from "lucide-react"

interface SidebarClientProps {
  isMobile?: boolean
}

export function SidebarClient({ isMobile = false }: SidebarClientProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const showFull = isMobile || isOpen

  const toggleSidebar = () => setIsOpen(!isOpen)

  const MaybeSheetClose = ({ children }: { children: React.ReactElement }) => {
    if (!isMobile) return children
    return <SheetClose asChild>{children}</SheetClose>
  }

  const navItems = [
    { href: "/pingyu-map", label: "乒羽图谱", icon: Icons.Map },
    { href: "/qa-history", label: "斛兵论道", icon: Icons.History },
    { href: "/user-settings", label: "羽拨心弦", icon: Icons.Image },
    { href: "/quotes", label: "羽坛金句", icon: Icons.Quote },
    { href: "/admin", label: "人机协同", icon: Icons.Settings },
  ]

  return (
    <div
      className={cn(
        "bg-background border-r h-full flex flex-col transition-all duration-300 ease-in-out shrink-0",
        isMobile ? "w-full" : isOpen ? "w-80" : "w-16"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center p-4", showFull ? "justify-between" : "justify-center flex-col gap-4")}>
        <MaybeSheetClose>
          <Link href="/" className={cn("flex items-center gap-2 hover:opacity-80 transition-opacity", !showFull && "justify-center")}> 
            <Image
              src="/logo.png"
              alt="斛教练 Logo"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              style={{ color: "transparent" }}
            />
            {showFull && <span className="text-xl font-bold text-primary whitespace-nowrap">AI乒羽馆</span>}
          </Link>
        </MaybeSheetClose>

        {isMobile ? (
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="shrink-0" title="收起侧边栏">
              <Icons.PanelLeftClose className="h-5 w-5" />
            </Button>
          </SheetClose>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
            title={isOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            {isOpen ? <Icons.PanelLeftClose className="h-5 w-5" /> : <Icons.PanelLeftOpen className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto overflow-x-hidden p-2", showFull ? "" : "flex flex-col items-center")}> 
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <MaybeSheetClose key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                  !showFull && "justify-center px-0 w-10 h-10"
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                {showFull && <span>{item.label}</span>}
              </Link>
            </MaybeSheetClose>
          )
        })}
      </div>
    </div>
  )
}
