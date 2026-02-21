---
name: media_analyze_report
description: 图片/视频分析报告（含 tags 与学习推荐链接）。
---

# media_analyze_report

## Input Schema
```json
{
  "media_url": "string",
  "tags": ["string"]
}
```

## Output Schema
```json
{
  "report_markdown": "string",
  "tags": [{ "keyword": "string", "confidence": 80 }],
  "recommended_links": [
    { "cite_id": "c1", "title": "...", "heading": "...", "url": "/kb/markdown?file=...", "anchor": "...", "snippet": "..." }
  ]
}
```

## Example
```json
{
  "report_markdown": "# 斛教练点评\n...",
  "tags": [{"keyword":"网前","confidence":82}],
  "recommended_links": [{"cite_id":"c1","title":"网前技术","heading":"挑球","url":"/kb/markdown?file=...","anchor":"挑球","snippet":"..."}]
}
```
