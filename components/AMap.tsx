'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    AMap?: any;
  }
}

export default function AMapViewer({ 
  markers, 
  onMarkerClick 
}: { 
  markers: {lng:number, lat:number, name?:string}[]; 
  onMarkerClick?: (marker: {lng:number, lat:number, name?:string}) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerInstancesRef = useRef<any[]>([]);
  const labelInstancesRef = useRef<any[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  
  // 更新回调引用
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key) return;

    const scriptId = 'amap-sdk';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    } else {
      init();
    }

    function init(){
      if (!ref.current || !window.AMap) return;
      
      // 清除之前的标记和标签实例
      markerInstancesRef.current.forEach(m => m.setMap(null));
      markerInstancesRef.current = [];
      labelInstancesRef.current.forEach(l => l.setMap(null));
      labelInstancesRef.current = [];
      
      // 如果地图已存在，清除所有标记
      if (mapRef.current) {
        mapRef.current.clearMap();
      } else {
        // 创建新地图
        const map = new window.AMap.Map(ref.current, { 
          zoom: 10, 
          center: markers?.[0] ? [markers[0].lng, markers[0].lat] : [116.397428, 39.90923] 
        });
        mapRef.current = map;
        window.addEventListener('resize', () => map.resize());
      }
      
      // 添加新标记
      if (markers && markers.length > 0) {
        const map = mapRef.current;
        
        // 计算所有标记的中心点
        const lngs = markers.map(m => m.lng);
        const lats = markers.map(m => m.lat);
        const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
        const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
        map.setCenter([centerLng, centerLat]);
        
        // 如果只有一个标记，放大一点
        if (markers.length === 1) {
          map.setZoom(15);
        } else {
          map.setZoom(12);
        }
        
        markers.forEach(m => {
          // 添加标记
          const marker = new window.AMap.Marker({ 
            position: [m.lng, m.lat], 
            title: m.name || '' 
          });
          marker.setMap(map);
          markerInstancesRef.current.push(marker);
          
          // 绑定点击事件
          marker.on('click', () => {
            console.log('Marker clicked:', m.name, m);
            if (onMarkerClickRef.current) {
              onMarkerClickRef.current(m);
            } else {
              console.warn('onMarkerClick callback is not set');
            }
          });
          
          // 添加文本标签显示景点名称
          if (m.name) {
            const text = new window.AMap.Text({
              text: m.name,
              position: [m.lng, m.lat],
              offset: new window.AMap.Pixel(0, -35), // 在标记上方显示
              style: {
                'padding': '4px 8px',
                'background-color': 'rgba(255, 255, 255, 0.95)',
                'border': '1px solid rgba(99, 102, 241, 0.3)',
                'border-radius': '4px',
                'font-size': '12px',
                'font-weight': '600',
                'color': '#1d1d1f',
                'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.15)',
                'white-space': 'nowrap',
                'max-width': '200px',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis'
              }
            });
            text.setMap(map);
            labelInstancesRef.current.push(text);
          }
        });
      }
    }
    
    return () => {
      // 清理标记和标签
      markerInstancesRef.current.forEach(m => {
        if (m && m.setMap) {
          m.setMap(null);
        }
      });
      markerInstancesRef.current = [];
      labelInstancesRef.current.forEach(l => {
        if (l && l.setMap) {
          l.setMap(null);
        }
      });
      labelInstancesRef.current = [];
    };
  }, [markers]);

  return <div className="map" ref={ref} style={{ width: '100%', height: '100%', minHeight: '300px' }} />;
}
