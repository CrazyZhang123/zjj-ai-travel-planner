'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

type ItineraryItem = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export default function CloudItineraries({ onLoad }: { onLoad: (payload: any) => void }) {
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 检查用户登录状态
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setItineraries([]);
        setShowList(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadItineraries() {
    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('登录会话已过期，请重新登录');
        return;
      }

      const res = await fetch('/api/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const result = await res.json();
      
      if (!res.ok) {
        alert('加载失败：' + (result.error || '未知错误'));
      } else {
        setItineraries(result.data || []);
        setShowList(true);
      }
    } catch (error: any) {
      console.error('Load itineraries error:', error);
      alert('加载时发生错误：' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadItinerary(id: string) {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('登录会话已过期，请重新登录');
        return;
      }

      const res = await fetch('/api/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ itineraryId: id })
      });

      const result = await res.json();
      
      if (!res.ok) {
        alert('加载失败：' + (result.error || '未知错误'));
      } else {
        onLoad(result.data.payload);
        setShowList(false);
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Load itinerary error:', error);
      alert('加载时发生错误：' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (!user) {
    return (
      <button className="btn btn-secondary" onClick={() => alert('请先登录')}>
        <span className="icon">☁️</span> 加载云端记录
      </button>
    );
  }

  return (
    <div className="cloud-itineraries">
      <button 
        className="btn-secondary-glass" 
        onClick={loadItineraries} 
        disabled={loading}
      >
        <span className="icon">{loading ? '⏳' : '☁️'}</span> 
        {loading ? '加载中...' : '加载云端记录'}
      </button>

      {showList && (
        <>
          <div className="cloud-list-overlay" onClick={() => setShowList(false)}></div>
          <div className="cloud-list">
            <div className="cloud-list-header">
              <h3>我的行程 ({itineraries.length})</h3>
              <button className="btn-close" onClick={() => setShowList(false)}>×</button>
            </div>
            <div className="cloud-list-content">
              {itineraries.length === 0 ? (
                <div className="empty-state">
                  <p>📭 还没有保存的行程</p>
                  <p className="small">生成并保存行程后，它们会显示在这里</p>
                </div>
              ) : (
                <div className="itinerary-items">
                  {itineraries.map((item) => (
                    <div key={item.id} className="itinerary-item" onClick={() => loadItinerary(item.id)}>
                      <div className="item-title">{item.title}</div>
                      <div className="item-meta">
                        <span className="item-date">📅 {formatDate(item.created_at)}</span>
                        {item.updated_at !== item.created_at && (
                          <span className="item-date">🔄 {formatDate(item.updated_at)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

