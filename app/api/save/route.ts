import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, title, payload } = await req.json();
    
    // 验证必需字段
    if (!userId || !title || !payload) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, title, or payload' 
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }
    
    // 从请求头中提取用户的 JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid authorization token. Please login first.' 
      }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const { createClient } = await import('@supabase/supabase-js');
    
    // 使用用户的 token 创建认证的客户端
    const supabase = createClient(supabaseUrl, supabaseAnon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // 验证 token 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Invalid or expired token. Please login again.' 
      }, { status: 401 });
    }

    // 确保 userId 与当前认证用户匹配（安全验证）
    if (user.id !== userId) {
      return NextResponse.json({ 
        error: 'User ID mismatch. Cannot save itinerary for another user.' 
      }, { status: 403 });
    }
    
    // 插入数据
    const { data, error } = await supabase
      .from('itineraries')
      .insert([{ 
        user_id: userId, 
        title: title.trim(), 
        payload: payload 
      }])
      .select();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to save itinerary',
        details: error.code || 'UNKNOWN_ERROR'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      data: data[0],
      message: 'Itinerary saved successfully'
    });
    
  } catch (error: any) {
    console.error('Save API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
