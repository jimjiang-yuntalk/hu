---
name: kb_qa_with_citations
description: RAG 问答（必须引用证据）。输入问题，输出 Markdown 回答与 citations[]。
---

# kb_qa_with_citations

## Input Schema
```json
{
  "question": "string",
  "category": "string?"
}
```

## Output Schema
```json
{
  "answer_markdown": "string",
  "citations": [
    {
      "cite_id": "string",
      "doc_id": "string",
      "file_path": "string",
      "title": "string",
      "heading": "string",
      "anchor": "string",
      "url": "string",
      "snippet": "string",
      "offset": { "paragraph": 0, "start": 0, "end": 0 },
      "score": 0.92
    }
  ]
}
```

## Example
```json
{
  "answer_markdown": "网前挑球要点包括...（见 [网前挑球-要点](cite:c1) [步法节奏](cite:c2)）",
  "citations": [
    { "cite_id": "c1", "doc_id": "...", "file_path": "ybxy/网前/挑球.md", "title": "挑球", "heading": "要点", "anchor": "要点", "url": "/kb/markdown?file=...", "snippet": "挑球应通过..." }
  ]
}
```
