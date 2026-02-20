import { prisma } from '@/lib/prisma'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import * as Icons from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LucideIcon } from 'lucide-react'

export async function AppSidebar() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
  })

  // Sort manually if needed or rely on DB order. 
  // The seed insertion order might not be preserved in basic SELECT without orderBy.
  // I'll assume it's roughly correct or add sorting logic if I added an 'order' field. 
  // For now, I'll just render them.

  return (
    <div className="w-80 bg-background border-r min-h-screen p-4 overflow-y-auto shrink-0">
      <div className="font-bold text-2xl mb-8 text-primary flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="斛教练 Logo" 
            width={32} 
            height={32} 
            className="h-8 w-8 object-contain"
          />
          <span>斛教练</span>
        </Link>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category) => {
          // Dynamic Icon Resolution
          const IconName = category.icon as keyof typeof Icons;
          const Icon = Icons[IconName] as LucideIcon || Icons.Circle;

          return (
            <AccordionItem key={category.id} value={category.id} className="border-b-0 mb-2">
              <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-3 rounded-md py-2 text-sm font-medium [&[data-state=open]]:bg-accent [&[data-state=open]]:text-accent-foreground">
                <div className="flex items-center gap-3 text-left">
                  <Icon className="h-5 w-5 text-primary" />
                  <span>{category.name.split('(')[0].trim()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="flex flex-col gap-1 mt-1 pl-4 border-l-2 border-muted ml-5">
                  {category.children.map((child) => (
                    <Link 
                      key={child.id} 
                      href={`/category/${child.slug}`}
                      className="text-sm py-2 px-3 rounded-md hover:bg-muted transition-colors block text-muted-foreground hover:text-foreground"
                    >
                      {child.name.split('(')[0].trim()}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
      <div className="mt-auto pt-4 border-t border-sidebar-border flex flex-col gap-1">
        <Link href="/user-settings" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors">
           <Icons.User className="h-4 w-4" />
           <span>用户上传</span>
        </Link>
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors">
           <Icons.Settings className="h-4 w-4" />
           <span>管理后台 (Admin)</span>
        </Link>
      </div>
    </div>
  )
}
