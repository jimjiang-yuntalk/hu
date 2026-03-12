'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourtArea, Difficulty } from '@prisma/client'

// Dynamically import TiptapEditor with SSR disabled to prevent hydration mismatch
const TiptapEditor = dynamic(() => import('@/components/editor/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted rounded-md border flex items-center justify-center text-muted-foreground">编辑器加载中...</div>
})

// Helper for UI labels
const courtAreaLabels: Record<string, string> = {
  'Net': '网前 (Net)',
  'Mid': '中场 (Mid)',
  'Rear': '后场 (Rear)',
  'Full': '全场 (Full)',
}

const difficultyLabels: Record<string, string> = {
  'L1_Beginner': '初级 (L1)',
  'L2_Amateur': '业余 (L2)',
  'L3_Advanced': '进阶 (L3)',
  'L4_Pro': '专业 (L4)',
}

interface ArticleFormProps {
  categories: any[]
  initialData?: any
  action: (formData: FormData) => Promise<void>
}

import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// ... (previous imports)

export default function ArticleForm({ categories, initialData, action }: ArticleFormProps) {
  const [content, setContent] = useState(initialData?.content || '')
  // Convert initial categoryId (single) or categories (array) to array of IDs
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories 
      ? initialData.categories.map((c: any) => c.id) 
      : (initialData?.categoryId ? [initialData.categoryId] : [])
  )
  const [courtArea, setCourtArea] = useState(initialData?.court_area || '')
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || '')
  // Initialize tags: if initialData.tags exists (array of objects), map to string.
  // Otherwise empty string.
  const [tags, setTags] = useState<string>(
    initialData?.tags?.map((t: any) => t.name).join(', ') || ''
  )

  const [openCombobox, setOpenCombobox] = useState(false)

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    )
  }

  return (
    <form action={action} className="space-y-8 max-w-4xl mx-auto p-6 bg-card rounded-lg border shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{initialData ? '编辑文章' : '新建文章'}</h2>
        <p className="text-muted-foreground">{initialData ? '修改文章内容' : '创建新的羽毛球技术文章'}</p>
      </div>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">标题 (Title)</Label>
          <Input 
            id="title" 
            name="title" 
            required 
            placeholder="例如：反手高远球动作要领" 
            defaultValue={initialData?.title}
          />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2 col-span-2">
          <Label>分类 (Categories) - 可多选</Label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="justify-between h-auto min-h-[2.5rem] w-full"
              >
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} 个分类已选择`
                  : "选择分类..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="搜索分类..." />
                <CommandList>
                  <CommandEmpty>未找到分类</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {categories.map((cat) => (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={() => toggleCategory(cat.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategories.includes(cat.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedCategories.map(catId => {
              const cat = categories.find(c => c.id === catId)
              return cat ? (
                <Badge key={cat.id} variant="secondary" className="flex items-center gap-1">
                  {cat.name}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => toggleCategory(cat.id)}
                  />
                </Badge>
              ) : null
            })}
          </div>
          <input type="hidden" name="categoryIds" value={selectedCategories.join(',')} />
        </div>

        <div className="grid gap-2">
          <Label>难度 (Difficulty)</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="选择难度" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="difficulty" value={difficulty} />
        </div>

        <div className="grid gap-2">
          <Label>场区 (Court Area)</Label>
          <Select value={courtArea} onValueChange={setCourtArea}>
            <SelectTrigger>
              <SelectValue placeholder="选择场区" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(courtAreaLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="court_area" value={courtArea} />
        </div>
        
         <div className="grid gap-2 col-span-2">
          <Label htmlFor="video_url">视频链接</Label>
          <Input 
            id="video_url" 
            name="video_url" 
            placeholder="https://..." 
            defaultValue={initialData?.video_url}
          />
        </div>
      </div>

        {/* Tags Input */}
        <div className="grid gap-2">
          <Label htmlFor="tags">标签</Label>
          <Input 
            id="tags" 
            name="tags" 
            placeholder="例如：杀球, 进攻, 后场 (逗号分隔)" 
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">多个标签请用逗号分隔</p>
        </div>

        <div className="grid gap-2">
          <Label>内容</Label>
          <TiptapEditor content={content} onChange={setContent} />
          <input type="hidden" name="content" value={content} />
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>取消</Button>
        <Button type="submit">{initialData ? '更新文章' : '保存文章'}</Button>
      </div>
    </form>
  )
}
