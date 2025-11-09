import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { destination } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing DASHSCOPE_API_KEY' }, { status: 500 });
    }

    // 使用大模型生成与目的地相关的图片搜索关键词
    const prompt = `你是一个旅行图片搜索助手。请为目的地"${destination}"生成4个相关的图片搜索关键词（英文），这些关键词应该能够搜索到该目的地的风景、地标、文化特色等代表性图片。

要求：
1. 返回一个JSON数组，包含4个英文搜索关键词
2. 关键词应该具体且相关，例如："Tokyo skyline", "Tokyo temple", "Tokyo food", "Tokyo street"
3. 只返回JSON数组，不要其他文字
4. 格式：["keyword1", "keyword2", "keyword3", "keyword4"]`;

    const resp = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-turbo-2025-07-15",
        messages: [
          { role: "system", content: "你是一个JSON生成助手，只返回有效的JSON数组，不要markdown格式。"},
          { role: "user", content: prompt }
        ],
        temperature: 0.7
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
    
    let keywords: string[] = [];
    try {
      keywords = JSON.parse(cleanedContent);
      if (!Array.isArray(keywords)) {
        throw new Error('Response is not an array');
      }
    } catch (e: any) {
      console.error('JSON parse error:', e, 'Content:', cleanedContent);
      // 如果解析失败，使用默认关键词
      keywords = [
        `${destination} travel`,
        `${destination} landmark`,
        `${destination} culture`,
        `${destination} scenery`
      ];
    }

    // 使用 Pexels API 搜索图片（免费且可靠）
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    
    if (pexelsApiKey) {
      // 使用 Pexels API 搜索图片
      const imageUrls: string[] = [];
      
      for (const keyword of keywords) {
        try {
          const pexelsResp = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
            {
              headers: {
                'Authorization': pexelsApiKey
              }
            }
          );
          
          if (pexelsResp.ok) {
            const pexelsData = await pexelsResp.json();
            if (pexelsData.photos && pexelsData.photos.length > 0) {
              // 使用中等尺寸的图片
              imageUrls.push(pexelsData.photos[0].src.large || pexelsData.photos[0].src.medium);
            }
          }
        } catch (e) {
          console.error('Pexels API error for keyword:', keyword, e);
        }
      }
      
      // 如果成功获取到图片，返回
      if (imageUrls.length > 0) {
        return NextResponse.json({ images: imageUrls, keywords });
      }
    }
    
    // 如果 Pexels API 不可用，使用 Unsplash 的正式 API
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (unsplashAccessKey) {
      const imageUrls: string[] = [];
      
      for (const keyword of keywords) {
        try {
          const unsplashResp = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
            {
              headers: {
                'Authorization': `Client-ID ${unsplashAccessKey}`
              }
            }
          );
          
          if (unsplashResp.ok) {
            const unsplashData = await unsplashResp.json();
            if (unsplashData.results && unsplashData.results.length > 0) {
              imageUrls.push(unsplashData.results[0].urls.regular);
            }
          }
        } catch (e) {
          console.error('Unsplash API error for keyword:', keyword, e);
        }
      }
      
      if (imageUrls.length > 0) {
        return NextResponse.json({ images: imageUrls, keywords });
      }
    }
    
    // 如果都没有配置，使用 Unsplash 的随机图片 API（基于关键词）
    // 使用不同的图片ID确保每张图片不同
    const images = keywords.map((keyword, index) => {
      // 使用时间戳和索引生成不同的图片ID
      const imageId = 1500000000000 + Date.now() % 1000000 + index * 1000;
      // 使用 Unsplash 的随机图片 API，通过不同的 ID 确保每张图片不同
      return `https://picsum.photos/800/600?random=${imageId}`;
    });

    return NextResponse.json({ images, keywords });
  } catch (error: any) {
    console.error('Search images error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

