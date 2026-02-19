import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || 'dummy-key-for-build'

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: process.env.AI_BASE_URL || "https://api.deepseek.com"
})

export async function classifyAndParseContent(rawText: string) {
  // 1. Fetch categories and tags for context
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parent: { select: { name: true } } }
  })
  
  const tags = await prisma.tag.findMany({
    select: { name: true }
  })

  const categoryContext = categories.map(c => 
    `${c.id}: ${c.parent ? c.parent.name + ' > ' : ''}${c.name}`
  ).join('\n')
  
  const tagContext = tags.map(t => t.name).join(', ')

  // 2. Construct Prompt
  const prompt = `
    You are a professional Badminton Coach and Content Editor.
    Analyze the following badminton article text and structure it for a knowledge base.

    **Task**:
    1. Extract a clear Title.
    2. Write a 1-sentence Summary.
    3. Choose the BEST Category ID from the provided list.
    4. Determine Court Area (Net, Mid, Rear, Full).
    5. Assess Difficulty (L1_Beginner, L2_Amateur, L3_Advanced, L4_Pro).
    6. Identify 3-5 relevant Tags. Prioritize existing tags, but create new ones if necessary for core technical terms.
    7. Clean and format the content into structured Markdown.
       - Use # for the main title (Level 1).
       - Use ## for section headers (Level 2).
       - Use ### for subsections if needed.
       - Ensure clear paragraph breaks.
       - Highlight key terms in bold.

    **Categories List**:
    ${categoryContext}
    
    **Existing Tags**:
    ${tagContext}

    **Input Text**:
    ${rawText.substring(0, 3000)}... (truncated)

    **Output Format (JSON only)**:
    {
      "title": "string",
      "summary": "string",
      "categoryId": "uuid",
      "court_area": "Net" | "Mid" | "Rear" | "Full",
      "difficulty": "L1_Beginner" | "L2_Amateur" | "L3_Advanced" | "L4_Pro",
      "tags": ["tag1", "tag2", ...],
      "content": "markdown string"
    }
  `

  // 3. Call LLM
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.AI_MODEL_NAME || 'deepseek-chat', 
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(completion.choices[0].message.content || '{}')
  return result
}
