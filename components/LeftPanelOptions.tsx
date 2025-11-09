'use client';
import { useState, useEffect } from 'react';

// 选项1: 旅行灵感卡片墙
export function InspirationWall({ destination }: { destination?: string }) {
  const inspirations = [
    { icon: '🗼', title: '东京塔', desc: '经典地标，夜景绝美', color: '#6366f1' },
    { icon: '🍜', title: '拉面文化', desc: '体验正宗日式拉面', color: '#ec4899' },
    { icon: '🌸', title: '樱花季', desc: '春季限定美景', color: '#a855f7' },
    { icon: '🎌', title: '传统文化', desc: '感受和风魅力', color: '#06b6d4' },
    { icon: '🛍️', title: '购物天堂', desc: '银座、新宿等你来', color: '#10b981' },
    { icon: '🎮', title: '动漫圣地', desc: '秋叶原动漫文化', color: '#f59e0b' },
  ];

  return (
    <div className="inspiration-wall">
      <h3 className="panel-title">旅行灵感</h3>
      <div className="inspiration-grid">
        {inspirations.map((item, idx) => (
          <div key={idx} className="inspiration-card" style={{ '--card-color': item.color } as any}>
            <div className="inspiration-icon">{item.icon}</div>
            <div className="inspiration-content">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 选项2: 统计信息面板
export function StatsPanel({ destination, budget, people, startDate, endDate }: {
  destination?: string;
  budget?: string;
  people?: number;
  startDate?: string;
  endDate?: string;
}) {
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const budgetNum = budget ? parseInt(budget.replace(/[^\d]/g, '')) : 0;
  const dailyBudget = days > 0 && budgetNum > 0 ? Math.round(budgetNum / days) : 0;
  const perPersonBudget = people && people > 0 && budgetNum > 0 ? Math.round(budgetNum / people) : 0;

  const stats = [
    { label: '旅行天数', value: days || '--', icon: '📅', color: '#6366f1' },
    { label: '总预算', value: budget || '--', icon: '💰', color: '#10b981' },
    { label: '日均预算', value: dailyBudget ? `${dailyBudget} CNY` : '--', icon: '📊', color: '#06b6d4' },
    { label: '人均预算', value: perPersonBudget ? `${perPersonBudget} CNY` : '--', icon: '👤', color: '#ec4899' },
  ];

  return (
    <div className="stats-panel">
      <h3 className="panel-title">预算分析</h3>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ '--stat-color': stat.color } as any}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      {destination && (
        <div className="destination-preview">
          <div className="preview-header">
            <span className="preview-icon">📍</span>
            <span className="preview-title">目的地</span>
          </div>
          <div className="preview-content">{destination}</div>
        </div>
      )}
    </div>
  );
}

// 选项3: 目的地信息卡片
export function DestinationInfo({ destination }: { destination?: string }) {
  const destinationData: Record<string, {
    image: string;
    highlights: string[];
    tips: string[];
    weather: string;
  }> = {
    '日本 东京': {
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      highlights: ['东京塔', '浅草寺', '银座购物', '秋叶原'],
      tips: ['建议购买JR Pass', '准备现金，部分地方不支持刷卡', '学习基本日语问候语'],
      weather: '四季分明，春季樱花最美'
    },
    '日本 大阪': {
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
      highlights: ['大阪城', '道顿堀', '环球影城', '心斋桥'],
      tips: ['大阪周游卡很划算', '尝试章鱼烧和大阪烧', '预留时间购物'],
      weather: '气候温和，全年适合旅行'
    },
  };

  const data = destination ? destinationData[destination] || destinationData['日本 东京'] : null;

  if (!data) {
    return (
      <div className="destination-info-empty">
        <div className="empty-icon">🌍</div>
        <h3>输入目的地</h3>
        <p>开始规划你的完美旅程</p>
      </div>
    );
  }

  return (
    <div className="destination-info">
      <div className="destination-image" style={{ backgroundImage: `url(${data.image})` }}>
        <div className="image-overlay"></div>
        <div className="destination-title">{destination}</div>
      </div>
      <div className="destination-content">
        <div className="info-section">
          <h4 className="section-label">✨ 必游景点</h4>
          <div className="highlights-list">
            {data.highlights.map((item, idx) => (
              <span key={idx} className="highlight-badge">{item}</span>
            ))}
          </div>
        </div>
        <div className="info-section">
          <h4 className="section-label">💡 旅行贴士</h4>
          <ul className="tips-list">
            {data.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
        <div className="info-section">
          <h4 className="section-label">🌤️ 天气</h4>
          <p className="weather-text">{data.weather}</p>
        </div>
      </div>
    </div>
  );
}

// 选项4: 时间线视图
export function TimelineView({ startDate, endDate, destination }: {
  startDate?: string;
  endDate?: string;
  destination?: string;
}) {
  const days = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const timelineItems = Array.from({ length: Math.min(days, 7) }, (_, i) => {
    const date = startDate ? new Date(startDate) : new Date();
    date.setDate(date.getDate() + i);
    return {
      day: i + 1,
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      activities: ['早餐', '景点游览', '午餐', '自由活动', '晚餐']
    };
  });

  if (days === 0) {
    return (
      <div className="timeline-empty">
        <div className="empty-icon">📅</div>
        <h3>设置旅行日期</h3>
        <p>查看你的行程时间线</p>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      <h3 className="panel-title">行程时间线</h3>
      <div className="timeline-container">
        {timelineItems.map((item, idx) => (
          <div key={idx} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-day">第 {item.day} 天</span>
                <span className="timeline-date">{item.date}</span>
              </div>
              <div className="timeline-activities">
                {item.activities.map((activity, aIdx) => (
                  <span key={aIdx} className="activity-tag">{activity}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 选项5: 图片轮播
export function ImageCarousel({ destination }: { destination?: string }) {
  // ============================================
  // 📸 如何替换图片：
  // ============================================
  // 方法1: 直接修改下面的 images 数组，替换为你想要的图片URL
  // 例如: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
  // 
  // 方法2: 使用 Unsplash API（推荐）
  // 访问 https://unsplash.com/developers 获取 API Key
  // 然后修改 searchImages 函数中的 API 调用
  //
  // 方法3: 使用本地图片
  // 将图片放在 public/images/ 目录下
  // 然后使用: ['/images/image1.jpg', '/images/image2.jpg']
  // ============================================
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800',
    'https://images.unsplash.com/photo-1493514789931-683cb2b3c853?w=800',
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // 当目的地改变时，搜索相关图片
  useEffect(() => {
    if (destination) {
      searchImages(destination);
    }
  }, [destination]);

  async function searchImages(dest: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest })
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setImages(data.images);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to search images:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="image-carousel">
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#1d1d1f'
        }}>
          正在搜索图片...
        </div>
      )}
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="carousel-slide">
              <img 
                src={img} 
                alt={`Slide ${idx + 1}`}
                onError={(e) => {
                  // 如果图片加载失败，使用默认图片
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&sig=${idx}`;
                }}
              />
              <div className="slide-overlay">
                <h3>{destination || '探索世界'}</h3>
                <p>发现无限可能</p>
              </div>
            </div>
          ))}
        </div>
        <button 
          className="carousel-btn prev"
          onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
        >
          ‹
        </button>
        <button 
          className="carousel-btn next"
          onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
        >
          ›
        </button>
        <div className="carousel-dots">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

