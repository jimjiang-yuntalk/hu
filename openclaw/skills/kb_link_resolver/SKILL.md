---
name: kb_link_resolver
description: 关键词到知识库链接解析（候选与置信度）。
---

# kb_link_resolver

## Input Schema
```json
{ "keywords": ["string"] }
```

## Output Schema
```json
{
  "results": [
    {
      "keyword": "string",
      "best_match": { "url": "string", "anchor": "string", "score": 0.88 },
      "candidates": [
        { "url": "string", "anchor": "string", "score": 0.78, "reason": "semantic match" }
      ]
    }
  ]
}
```
