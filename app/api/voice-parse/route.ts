import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text } = body;

  if (!text) {
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing DASHSCOPE_API_KEY' }, { status: 500 });
  }

  const prompt = `你是一个智能语音解析助手。从用户的语音输入中提取以下字段，返回JSON格式：
{
  "destination": "目的地（如：日本 东京）",
  "startDate": "开始日期（YYYY-MM-DD格式，如果提到）",
  "endDate": "结束日期（YYYY-MM-DD格式，如果提到）",
  "budget": "预算（包含数字和货币单位，如：10000 CNY）",
  "people": 人数（数字）,
  "prefs": "旅行偏好（如：美食、动漫、亲子等）"
}

用户输入："${text}"

要求：
1. 只返回JSON，不要其他文字
2. 如果某个字段没有提到，设为null或空字符串
3. 日期要转换为YYYY-MM-DD格式
4. 预算要包含货币单位（CNY、JPY、USD等）
5. 人数提取为数字`;

  try {
    const resp = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-turbo-2025-07-15",
        messages: [
          { role: "system", content: "你是一个JSON解析助手，只返回有效的JSON，不要markdown格式。"},
          { role: "user", content: prompt }
        ],
        temperature: 0.3
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
    
    // 清理可能的markdown代码块
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/g, '');
    }
    
    try {
      const parsed = JSON.parse(cleanedContent);
      return NextResponse.json(parsed);
    } catch (e: any) {
      console.error('JSON parse error:', e, 'Content:', cleanedContent);
      return NextResponse.json({ 
        error: 'Failed to parse JSON from model', 
        raw: cleanedContent 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Voice parse error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

