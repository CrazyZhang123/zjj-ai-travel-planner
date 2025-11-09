import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { destination, startDate, endDate, budget, people, prefs } = body;

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing DASHSCOPE_API_KEY' }, { status: 500 });
  }

  const prompt = `You are an expert travel planner. Return ONLY valid JSON.
Fields: title, currency (ISO code), total_budget_estimate (number), days[].
For each day: date (YYYY-MM-DD), city, transport (brief), daily_cost_estimate (number),
activities[] with {time, name, type, lat?, lng?, cost_estimate?, tips?},
hotel {name, address?, lat?, lng?, price_per_night?},
meals[] {name, address?, lat?, lng?, price_estimate?}.

Constraints:
- Consider destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budget}
- People: ${people}
- Preferences: ${prefs}
- Be realistic with costs (use ${destination} local prices if possible).
- Include lat/lng when confident; else omit.
- Keep JSON concise.`;

  const resp = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "qwen-turbo-2025-07-15",  // 改为 qwen-turbo
      messages: [
        { role: "system", content: "Return only minified JSON without markdown."},
        { role: "user", content: prompt }
      ],
      temperature: 0.5
      // 移除 response_format
    })
  });

  if (!resp.ok) {
    const t = await resp.text();
    console.error('Dashscope API Error:', {
      status: resp.status,
      statusText: resp.statusText,
      detail: t
    });
    return NextResponse.json({ 
      error: 'Dashscope API error', 
      status: resp.status,
      detail: t 
    }, { status: 500 });
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch (e:any) {
    return NextResponse.json({ error: 'Bad JSON from model', raw: content }, { status: 500 });
  }
}
