import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing API Key' });
  }

  try {
    const resp = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });

    const data = await resp.json();
    
    return NextResponse.json({
      status: resp.status,
      statusText: resp.statusText,
      data: data
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' });
  }
}