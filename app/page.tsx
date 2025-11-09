'use client';

import { useState } from 'react';
import AuthBar from '@/components/AuthBar';
import { supabase } from '@/lib/supabaseClient';
import ItineraryView from '@/components/ItineraryView';
import CloudItineraries from '@/components/CloudItineraries';
import { ImageCarousel } from '@/components/LeftPanelOptions';
// 左侧面板选项 - 请从以下组件中选择一个：
// import { InspirationWall } from '@/components/LeftPanelOptions';
// import { StatsPanel } from '@/components/LeftPanelOptions';
// import { DestinationInfo } from '@/components/LeftPanelOptions';
// import { TimelineView } from '@/components/LeftPanelOptions';

export default function Page(){
  const [destination, setDestination] = useState('日本 东京');
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2025-12-05');
  const [budget, setBudget] = useState('10000 CNY');
  const [people, setPeople] = useState(2);
  const [prefs, setPrefs] = useState('美食、动漫、亲子');
  const [recognizing, setRecognizing] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function startVoice(){
    // Web Speech API (Chrome)
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert('当前浏览器不支持语音识别，请手动输入。'); return; }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = ()=>setRecognizing(true);
    rec.onerror = ()=>setRecognizing(false);
    rec.onend = ()=>setRecognizing(false);
    rec.onresult = async (e:any)=>{
      const text = e.results[0][0].transcript;
      setRecognizing(false);
      
      // 调用大模型解析语音内容
      try {
        const res = await fetch('/api/voice-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await res.json();
        
        if (data.destination) setDestination(data.destination);
        if (data.startDate) setStartDate(data.startDate);
        if (data.endDate) setEndDate(data.endDate);
        if (data.budget) setBudget(data.budget);
        if (data.people) setPeople(data.people);
        if (data.prefs) setPrefs(data.prefs);
      } catch (error) {
        console.error('Voice parse error:', error);
        // 如果解析失败，至少把文本填入偏好
        setPrefs(text);
      }
    };
    rec.start();
  }

  async function generate(){
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, startDate, endDate, budget, people, prefs })
      });
      const data = await res.json();
      if(!res.ok){ alert('生成失败：' + (data.error || '未知错误')); }
      else setPlan(data);
    } finally {
      setLoading(false);
    }
  }

  async function save(){
    try {
      // 检查用户是否登录
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if(userError || !user){ 
        alert('请先登录再保存'); 
        return; 
      }
    
      // 获取用户的访问令牌
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if(sessionError || !session?.access_token) {
        alert('登录会话已过期，请重新登录');
        return;
      }
      
      // 验证行程数据
      if(!plan) {
        alert('没有可保存的行程，请先生成行程');
        return;
      }
      
      setSaving(true);
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          title: plan?.title || `${destination}行程`,
          payload: plan
        })
      });
      
      const result = await res.json();
      
      if(!res.ok) {
        console.error('Save error:', result);
        alert('保存失败：' + (result.error || '未知错误') + (result.details ? `\n详情：${result.details}` : ''));
      } else {
        alert('✅ 保存成功！行程已保存到云端。');
      }
    } catch (error: any) {
      console.error('Save function error:', error);
      alert('保存时发生错误：' + error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-container">
      {/* 背景效果 */}
      <div className="bg-gradient"></div>
      <div className="bg-particles"></div>
      
      <div className="main-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-glow">AI</span> 行程规划器
            </h1>
            <p className="header-subtitle">智能规划，轻松旅行</p>
          </div>
          <AuthBar />
        </header>

        {/* Main Content Area */}
        <div className="hero-section">
          {/* Form */}
          <div className="form-section" style={{ gridColumn: '1 / -1' }}>
            <div className="glass-card">
              <div className="card-header-glow">
                <h2 className="section-title">旅行信息</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch', minHeight: '600px' }}>
                {/* 左侧轮播图 */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <ImageCarousel destination={destination} />
                </div>
                
                {/* 右侧表单 */}
                <div className="form-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📍</span> 目的地
                    </label>
                    <input 
                      className="glass-input" 
                      value={destination} 
                      onChange={e=>setDestination(e.target.value)} 
                      placeholder="如：日本 东京"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">💰</span> 预算
                    </label>
                    <input 
                      className="glass-input" 
                      value={budget} 
                      onChange={e=>setBudget(e.target.value)} 
                      placeholder="如：10000 CNY"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📅</span> 开始日期
                    </label>
                    <input 
                      className="glass-input" 
                      type="date" 
                      value={startDate} 
                      onChange={e=>setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">📅</span> 结束日期
                    </label>
                    <input 
                      className="glass-input" 
                      type="date" 
                      value={endDate} 
                      onChange={e=>setEndDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-icon">👥</span> 同行人数
                    </label>
                    <input 
                      className="glass-input" 
                      type="number" 
                      min={1} 
                      value={people} 
                      onChange={e=>setPeople(parseInt(e.target.value||'1',10))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">💭</span> 偏好（可语音输入）
                  </label>
                  <div className="input-group-voice">
                    <textarea 
                      className="glass-input" 
                      rows={3} 
                      value={prefs} 
                      onChange={e=>setPrefs(e.target.value)} 
                      placeholder="如：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                    />
                    <button 
                      className={`voice-btn ${recognizing ? 'recognizing' : ''}`} 
                      onClick={startVoice}
                      title="点击开始语音输入，可以说：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                    >
                      {recognizing ? '🎤 识别中…' : '🎤'}
                    </button>
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontStyle: 'italic'
                  }}>
                    💬 语音示例："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                  </div>
                </div>

                <div className="action-section">
                  <button 
                    className="btn-generate" 
                    onClick={generate} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        <span>生成中…</span>
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">✨</span>
                        <span>生成行程与预算</span>
                      </>
                    )}
                  </button>
                  
                  <div className="secondary-actions">
                    <button 
                      className="btn-secondary-glass" 
                      onClick={save} 
                      disabled={!plan || saving}
                    >
                      {saving ? '💾 保存中...' : '💾 保存到云端'}
                    </button>
                    <CloudItineraries onLoad={(payload) => setPlan(payload)} />
                  </div>
                </div>
                
                <div className="privacy-note-glass">
                  <span className="icon">🔒</span>
                  <span>隐私说明：偏好与行程仅在你明确保存时写入云端。</span>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Results */}
        {plan && (
          <div className="results-section">
            <ItineraryView plan={plan} />
          </div>
        )}
      </div>
    </div>
  );
}
