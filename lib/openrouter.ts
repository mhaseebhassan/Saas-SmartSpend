export async function callOpenRouter(
  prompt: string,
  systemPrompt: string,
  maxTokens = 200
): Promise<string> {
  const response = await fetch(
    `${process.env.OPENROUTER_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://saas-smart-spend.vercel.app",
        "X-Title": "SmartSpend",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    }
  );

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
