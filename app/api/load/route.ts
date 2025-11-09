import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { itineraryId } = await req.json();
    
    if (!itineraryId) {
      return NextResponse.json({ 
        error: 'Missing itinerary ID' 
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
    
    // 获取行程详情
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .eq('id', itineraryId)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to load itinerary',
        details: error.code || 'UNKNOWN_ERROR'
      }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ 
        error: 'Itinerary not found or access denied' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      data: {
        ...data,
        payload: data.payload // 返回完整的 payload
      }
    });
    
  } catch (error: any) {
    console.error('Load API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

