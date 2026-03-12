'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCategory } from './actions'
import { Category } from '@prisma/client'

interface CategorySheetProps {
  categories: Category[]
}

export function CategorySheet({ categories }: CategorySheetProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const result = await createCategory(formData)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert('Error creating category')
    }
    setIsLoading(false)
  }

  // Filter out children to only allow 2-level depth (optional, based on user preference but good for now)
  // Or just show all as flat list with indentation
  const potentialParents = categories.filter(c => !c.parentId)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建分类
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>创建新分类</SheetTitle>
          <SheetDescription>
            添加一个新的文章分类。您可以指定父级分类和关键词。
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input id="name" name="name" required placeholder="例如：高级战术" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL标识)</Label>
            <Input id="slug" name="slug" required placeholder="advanced-tactics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">父级分类</Label>
            <Select name="parentId">
              <SelectTrigger>
                <SelectValue placeholder="选择父级分类（可选）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无（顶级分类）</SelectItem>
                {potentialParents.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">关键词</Label>
            <Input 
              id="keywords" 
              name="keywords" 
              placeholder="例如：战术, 意识, 配合" 
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground">
              用于搜索或自动匹配标签。多个关键词请用逗号分隔。
            </p>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '创建中...' : '创建分类'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
