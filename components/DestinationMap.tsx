'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import AMapViewer from './AMap';

interface Marker {
  lng: number;
  lat: number;
  name?: string;
  dayIndex?: number;
}

interface DestinationMapProps {
  plan?: {
    days?: Array<{
      date?: string;
      city?: string;
      activities?: Array<{ name: string; lat?: number; lng?: number }>;
      hotel?: { name: string; lat?: number; lng?: number };
      meals?: Array<{ name: string; lat?: number; lng?: number }>;
    }>;
  };
}

export default function DestinationMap({ plan }: DestinationMapProps) {
  const [allMarkers, setAllMarkers] = useState<Marker[][]>([]); // 每天的地图标记
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);

  useEffect(() => {
    if (!plan || !plan.days) {
      setAllMarkers([]);
      setSelectedMarker(null);
      return;
    }

    // 为每一天生成地图标记
    const dayMarkers: Marker[][] = [];
    
    plan.days.forEach((d, dayIndex) => {
      const ms: Marker[] = [];
      
      // 活动
      d.activities?.forEach((a) => {
        if (a.lat && a.lng) {
          const marker: Marker = {
            lng: a.lng,
            lat: a.lat,
            name: a.name,
            dayIndex
          };
          ms.push(marker);
        }
      });
      
      // 酒店
      if (d.hotel?.lat && d.hotel?.lng) {
        const marker: Marker = {
          lng: d.hotel.lng,
          lat: d.hotel.lat,
          name: d.hotel.name,
          dayIndex
        };
        ms.push(marker);
      }
      
      // 餐饮
      d.meals?.forEach((m) => {
        if (m.lat && m.lng) {
          const marker: Marker = {
            lng: m.lng,
            lat: m.lat,
            name: m.name,
            dayIndex
          };
          ms.push(marker);
        }
      });
      
      dayMarkers.push(ms);
    });
    
    setAllMarkers(dayMarkers);
    if (dayMarkers.length > 0) {
      setSelectedDay(0);
      // 默认选中第一个景点
      if (dayMarkers[0] && dayMarkers[0].length > 0) {
        setSelectedMarker(dayMarkers[0][0]);
      } else {
        setSelectedMarker(null);
      }
    }
  }, [plan]);

  // 获取当前选中天的标记
  const currentMarkers = allMarkers[selectedDay] || [];

  // 点击地图标记 - 只选中，不跳转
  const handleMapMarkerClick = useCallback((marker: {lng:number, lat:number, name?:string}) => {
    console.log('handleMapMarkerClick called with:', marker);
    const dayMarkers = allMarkers[selectedDay] || [];
    console.log('Current day markers:', dayMarkers);
    const fullMarker = dayMarkers.find(m => 
      Math.abs(m.lng - marker.lng) < 0.0001 && 
      Math.abs(m.lat - marker.lat) < 0.0001
    );
    console.log('Found marker:', fullMarker);
    if (fullMarker) {
      setSelectedMarker(fullMarker);
    } else {
      console.warn('Marker not found in current day markers');
    }
  }, [allMarkers, selectedDay]);

  // 点击景点卡片 - 只选中
  const handleMarkerCardClick = (marker: Marker) => {
    setSelectedMarker(marker);
  };

  // 跳转到高德地图导航
  const handleNavigateToAmap = (marker: Marker) => {
    const url = `https://uri.amap.com/marker?position=${marker.lng},${marker.lat}&name=${encodeURIComponent(marker.name || '')}`;
    window.open(url, '_blank');
  };

  if (allMarkers.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(0,0,0,0.4)',
        fontSize: '14px'
      }}>
        生成行程后将显示地图和景点
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 天选择器 */}
      {plan?.days && plan.days.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {plan.days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDay(idx);
                // 切换天数时，默认选中第一个景点
                const dayMarkers = allMarkers[idx] || [];
                if (dayMarkers.length > 0) {
                  setSelectedMarker(dayMarkers[0]);
                } else {
                  setSelectedMarker(null);
                }
              }}
              style={{
                padding: '8px 16px',
                background: selectedDay === idx
                  ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                  : 'rgba(255, 255, 255, 0.8)',
                border: selectedDay === idx
                  ? 'none'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                color: selectedDay === idx ? '#fff' : 'rgba(0, 0, 0, 0.7)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              第 {idx + 1} 天 {day.city ? `· ${day.city}` : ''}
            </button>
          ))}
        </div>
      )}

      {/* 地图 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {currentMarkers.length > 0 ? (
          <AMapViewer markers={currentMarkers} onMarkerClick={handleMapMarkerClick} />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.4)',
            fontSize: '14px'
          }}>
            第 {selectedDay + 1} 天暂无景点坐标
          </div>
        )}
      </div>

      {/* 选中景点详情 - 常驻显示，默认显示第一个景点 */}
      {currentMarkers.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>
            {selectedMarker ? selectedMarker.name : currentMarkers[0]?.name || '景点'}
          </h4>
          <button
            onClick={() => handleNavigateToAmap(selectedMarker || currentMarkers[0])}
            style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🗺️ 在高德地图中导航
          </button>
        </div>
      )}

      {/* 景点列表 */}
      {currentMarkers.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '8px',
          maxHeight: '120px',
          overflowY: 'auto'
        }}>
          {currentMarkers.map((marker, idx) => (
            <div
              key={idx}
              onClick={() => handleMarkerCardClick(marker)}
              style={{
                padding: '12px',
                background: selectedMarker === marker 
                  ? 'rgba(99, 102, 241, 0.1)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                border: selectedMarker === marker 
                  ? '2px solid #6366f1' 
                  : '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {marker.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
