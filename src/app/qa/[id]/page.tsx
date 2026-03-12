
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import QaPageClient from "@/components/QaPageClient"

export default async function QaPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const qa = await prisma.qaHistory.findUnique({
    where: { id },
  })

  const qaList = await prisma.qaHistory.findMany({
    select: { id: true },
    orderBy: { createdAt: "desc" },
  })
  const index = qaList.findIndex((item) => item.id === id)
  const prevId = index > 0 ? qaList[index - 1]?.id : null
  const nextId = index >= 0 && index < qaList.length - 1 ? qaList[index + 1]?.id : null

  if (!qa) {
    notFound()
  }

  return <QaPageClient qa={qa} prevHref={prevId ? `/qa/${prevId}` : null} nextHref={nextId ? `/qa/${nextId}` : null} />
}
