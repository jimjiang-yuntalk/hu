"use client"

import { ReactNode } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function MobileHeader({ sidebar }: { sidebar: ReactNode }) {
  return (
    <div className="md:hidden sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" aria-label="打开菜单">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0" showCloseButton={false}>
            {sidebar}
          </SheetContent>
        </Sheet>
        <a href="/" className="font-semibold text-sm hover:text-primary transition-colors">
          AI乒羽馆
        </a>
      </div>
    </div>
  )
}
