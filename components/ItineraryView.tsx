'use client';
import DestinationMap from './DestinationMap';
import { ImageCarousel } from './LeftPanelOptions';

type Plan = {
  title: string;
  currency: string;
  total_budget_estimate: number;
  days: Array<{
    date: string;
    city: string;
    activities: Array<{ time: string; name: string; type: string; lat?: number; lng?: number; cost_estimate?: number; tips?: string }>;
    hotel?: { name: string; address?: string; lat?: number; lng?: number; price_per_night?: number };
    meals?: Array<{ name: string; address?: string; lat?: number; lng?: number; price_estimate?: number }>;
    transport?: string;
    daily_cost_estimate?: number;
  }>;
};

export default function ItineraryView({ plan }: { plan: Plan | null }){
  if(!plan) return null;

  // 获取目的地名称（从标题或第一天城市）
  const destination = plan.days?.[0]?.city || plan.title.split(' ')[0] || '';

  return (
    <div className="card itinerary-card">
      <div className="itinerary-header">
        <h2>🗺️ {plan.title}</h2>
        <div className="budget-badge">
          💰 预计总预算：<strong>{plan.total_budget_estimate.toLocaleString()}</strong> {plan.currency}
        </div>
      </div>
      
      {/* 下方地图 */}
      <div style={{ marginBottom: '32px', minHeight: '500px' }}>
        <DestinationMap plan={plan} />
      </div>
      
      <div className="days-container">
        {plan.days?.map((d, i) => (
          <div key={i} className="day-card">
            <div className="day-header">
              <span className="day-number">第 {i+1} 天</span>
              <span className="day-date">📅 {d.date}</span>
              <span className="day-city">📍 {d.city}</span>
            </div>
            
            {d.transport && (
              <div className="transport-info">
                🚗 交通：{d.transport}
              </div>
            )}
            
            <div className="day-content-grid">
              {d.activities && d.activities.length > 0 && (
                <div className="section">
                  <h4 className="section-title">🎯 活动安排</h4>
                  <ul className="activities-list">
                    {d.activities.map((a, j) => (
                      <li key={j} className="activity-item">
                        <span className="badge">{a.time}</span>
                        <div className="activity-content">
                          <span className="activity-name">{a.name}</span>
                          <span className="activity-meta">
                            <span className="activity-type">({a.type}</span>
                            {a.cost_estimate && <span className="activity-cost"> · 约{a.cost_estimate}</span>}
                            <span>)</span>
                          </span>
                          {a.tips && <div className="activity-tips">💡 {a.tips}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="day-side-info">
                {d.hotel && (
                  <div className="section">
                    <h4 className="section-title">🏨 住宿</h4>
                    <div className="hotel-info">
                      <strong>{d.hotel.name}</strong>
                      {d.hotel.address && <div className="small">📍 {d.hotel.address}</div>}
                      {d.hotel.price_per_night && (
                        <div className="price-info">💰 约 {d.hotel.price_per_night} {plan.currency}/晚</div>
                      )}
                    </div>
                  </div>
                )}
                
                {d.meals && d.meals.length > 0 && (
                  <div className="section">
                    <h4 className="section-title">🍽️ 餐饮</h4>
                    <div className="meals-list">
                      {d.meals.map((m, k) => (
                        <span key={k} className="meal-badge">
                          {m.name}
                          {m.price_estimate && <span className="meal-price"> {m.price_estimate}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {typeof d.daily_cost_estimate === 'number' && (
                  <div className="daily-cost">
                    💵 当日花费估计：<strong>{d.daily_cost_estimate}</strong> {plan.currency}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
