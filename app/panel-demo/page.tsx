'use client';

import { useState } from 'react';
import { 
  InspirationWall, 
  StatsPanel, 
  DestinationInfo, 
  TimelineView, 
  ImageCarousel 
} from '@/components/LeftPanelOptions';

export default function PanelDemo() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [destination, setDestination] = useState('日本 东京');
  const [budget, setBudget] = useState('10000 CNY');
  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2025-12-05');

  const options = [
    { id: 1, name: '旅行灵感卡片墙', desc: '展示热门目的地和旅行建议' },
    { id: 2, name: '统计信息面板', desc: '显示预算分析和旅行数据' },
    { id: 3, name: '目的地信息卡片', desc: '根据目的地显示详细信息' },
    { id: 4, name: '时间线视图', desc: '可视化行程时间线' },
    { id: 5, name: '图片轮播', desc: '精美的目的地图片展示' },
  ];

  return (
    <div className="app-container">
      <div className="bg-gradient"></div>
      <div className="bg-particles"></div>
      
      <div className="main-container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-glow">左侧面板</span> 设计方案
            </h1>
            <p className="header-subtitle">选择你喜欢的左侧面板设计</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', marginBottom: '60px' }}>
          {/* 选项列表 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>选择设计方案</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  style={{
                    padding: '16px',
                    background: selectedOption === option.id 
                      ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: selectedOption === option.id ? '#fff' : '#1d1d1f',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{option.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{option.desc}</div>
                </button>
              ))}
            </div>

            {/* 测试数据输入 */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>测试数据</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="目的地"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                <input
                  type="text"
                  placeholder="预算"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                <input
                  type="number"
                  placeholder="人数"
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value) || 2)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass-input"
                  style={{ fontSize: '13px', padding: '8px 12px' }}
                />
              </div>
            </div>
          </div>

          {/* 预览区域 */}
          <div className="map-section" style={{ minHeight: '600px' }}>
            {selectedOption === null ? (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'rgba(0,0,0,0.4)',
                fontSize: '18px'
              }}>
                请选择一个设计方案查看预览
              </div>
            ) : selectedOption === 1 ? (
              <InspirationWall destination={destination} />
            ) : selectedOption === 2 ? (
              <StatsPanel 
                destination={destination}
                budget={budget}
                people={people}
                startDate={startDate}
                endDate={endDate}
              />
            ) : selectedOption === 3 ? (
              <DestinationInfo destination={destination} />
            ) : selectedOption === 4 ? (
              <TimelineView 
                startDate={startDate}
                endDate={endDate}
                destination={destination}
              />
            ) : selectedOption === 5 ? (
              <ImageCarousel destination={destination} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

