'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthBar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUser(sess?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(){
    const email = prompt('请输入邮箱用于登录/注册 (Supabase magic link):');
    if(!email) return;
    if(!email.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }
    try {
      // 获取当前页面的 origin（自动适配本地和生产环境）
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'http://localhost:3000/auth/callback';
      
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });
      if(error) {
        alert('登录失败：' + error.message);
        console.error('Supabase login error:', error);
      } else {
        alert('✅ 登录邮件已发送，请查收邮箱并点击链接完成登录。');
      }
    } catch (error: any) {
      alert('登录时发生错误：' + error.message);
      console.error('Login error:', error);
    }
  }
  
  async function signOut(){ 
    await supabase.auth.signOut();
    alert('已退出登录');
  }

  if(loading) {
    return (
      <div className="auth-bar">
        <div className="auth-loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="auth-bar">
      {user ? (
        <div className="auth-user">
          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="btn btn-logout" onClick={signOut} title="退出登录">
            退出
          </button>
        </div>
      ) : (
        <button className="btn btn-login" onClick={signIn}>
          <span className="icon">🔐</span> 登录 / 注册
        </button>
      )}
    </div>
  );
}
