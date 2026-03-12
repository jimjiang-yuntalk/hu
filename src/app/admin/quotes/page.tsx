import { addQuote } from '@/app/actions'
import { readQuotes } from '@/lib/quotes'
import DeleteQuoteButton from './DeleteQuoteButton'

export const dynamic = 'force-dynamic'

export default async function AdminQuotesPage() {
  const quotes = await readQuotes()

  return (
    <div className="py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">羽坛金句运维</h1>
        <p className="text-muted-foreground mt-2">维护可用于分享的羽坛金句</p>
      </div>

      <form action={addQuote} className="rounded-xl border bg-card p-4 grid gap-3 sm:grid-cols-12">
        <input
          name="content"
          placeholder="输入金句内容"
          className="sm:col-span-7 rounded-md border bg-background px-3 py-2 text-sm"
          required
        />
        <input
          name="author"
          placeholder="作者（可选）"
          className="sm:col-span-3 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="sm:col-span-2 rounded-md bg-primary text-primary-foreground text-sm px-3 py-2">
          新增金句
        </button>
      </form>

      {quotes.length === 0 ? (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">暂无金句</div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm leading-6">{q.content}</div>
                {(q.author || q.createdAt) && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {q.author ? `—— ${q.author}` : ''}
                  </div>
                )}
              </div>
              <DeleteQuoteButton id={q.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
