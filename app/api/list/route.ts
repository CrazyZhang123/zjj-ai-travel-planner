import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
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
    
    // 获取用户的行程列表，按创建时间倒序
    const { data, error } = await supabase
      .from('itineraries')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to load itineraries',
        details: error.code || 'UNKNOWN_ERROR'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error: any) {
    console.error('List API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

