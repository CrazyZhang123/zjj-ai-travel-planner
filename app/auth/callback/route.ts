import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.redirect(
        new URL(`/?error=missing_env_vars`, requestUrl.origin)
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnon);
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(
        new URL(`/?error=auth_failed`, requestUrl.origin)
      );
    }
  }

  // 重定向到首页或指定页面
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
