'use client'

import { deleteQaHistory } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export default function DeleteQaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('确定要删除这条问答记录吗？')) {
      startTransition(async () => await deleteQaHistory(id))
    }
  }

  return (
    <Button variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
