import { marked } from "marked"
import { slugify } from "./slug"

export const renderMarkdown = (content: string) => {
  const renderer: any = new (marked.Renderer as any)()
  renderer.heading = (tokenOrText: any, level?: number) => {
    // marked v10+ passes a token object; older versions pass (text, level)
    const text = typeof tokenOrText === "string" ? tokenOrText : tokenOrText?.text || tokenOrText?.raw || ""
    const depth = typeof level === "number" ? level : tokenOrText?.depth || 2
    const id = slugify(text)
    return `<h${depth} id="${id}">${text}</h${depth}>`
  }
  return marked.parse(content, { renderer })
}
