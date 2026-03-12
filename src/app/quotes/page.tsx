import { readQuotes } from '@/lib/quotes'

export const dynamic = 'force-dynamic'

export default async function QuotesPage() {
  const quotes = await readQuotes()

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">羽坛金句</h1>
        <p className="text-muted-foreground mt-2">把热爱练成习惯，把坚持打成肌肉记忆。</p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无金句</div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-xl border bg-card p-4">
              <div className="text-base leading-7">“{q.content}”</div>
              {q.author && <div className="text-sm text-muted-foreground mt-2">—— {q.author}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
