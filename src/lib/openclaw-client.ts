type OpenClawResponse = {
  output_text?: string
  output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>
  error?: { message: string }
}

const callResponses = async (payload: any) => {
  const url = process.env.OPENCLAW_GATEWAY_URL
  const token = process.env.OPENCLAW_GATEWAY_TOKEN
  if (!url || !token) throw new Error("OPENCLAW_GATEWAY_URL/TOKEN 未配置")

  const res = await fetch(`${url}/v1/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-openclaw-agent-id": "main",
    },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as OpenClawResponse
  if (!res.ok) {
    throw new Error(data?.error?.message || `OpenClaw error: ${res.status}`)
  }
  if (data.output_text) return data.output_text
  const text = data.output
    ?.flatMap((o) => o.content || [])
    ?.filter((c) => c.type === "output_text")
    ?.map((c) => c.text || "")
    ?.join("\n")
  return text || ""
}

export const openclawResponses = async (input: string, opts?: { user?: string }) => {
  return callResponses({ model: "openclaw", input, user: opts?.user })
}

export const openclawResponsesWithImage = async (
  text: string,
  imageUrl: string,
  opts?: { user?: string }
) => {
  return callResponses({
    model: "openclaw",
    user: opts?.user,
    input: [
      { type: "input_text", text },
      { type: "input_image", source: { type: "url", url: imageUrl } },
    ],
  })
}
