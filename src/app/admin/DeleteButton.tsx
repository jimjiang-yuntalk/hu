'use client'

import { deleteArticle } from '@/app/actions'
import { Button } from "@/components/ui/button"
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('确定要删除这篇文章吗？')) {
      startTransition(async () => await deleteArticle(id))
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm" 
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
