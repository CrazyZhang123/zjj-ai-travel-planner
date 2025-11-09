'use client';
import { useEffect, useRef, useState } from 'react';

interface FlightPath {
  id: string;
  from: { lat: number; lng: number; city: string };
  to: { lat: number; lng: number; city: string };
  progress: number;
}

export default function WorldMap({ destination }: { destination?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 城市坐标（简化版世界地图）
    const cities: Record<string, { lat: number; lng: number }> = {
      '东京': { lat: 35.6762, lng: 139.6503 },
      '大阪': { lat: 34.6937, lng: 135.5023 },
      '北京': { lat: 39.9042, lng: 116.4074 },
      '上海': { lat: 31.2304, lng: 121.4737 },
      '纽约': { lat: 40.7128, lng: -74.0060 },
      '伦敦': { lat: 51.5074, lng: -0.1278 },
      '巴黎': { lat: 48.8566, lng: 2.3522 },
      '悉尼': { lat: -33.8688, lng: 151.2093 },
      '新加坡': { lat: 1.3521, lng: 103.8198 },
      '首尔': { lat: 37.5665, lng: 126.9780 },
    };

    // 设置画布大小（考虑设备像素比以支持高DPI屏幕）
    const dpr = window.devicePixelRatio || 1;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      // 设置实际画布尺寸（考虑设备像素比）
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // 设置CSS显示尺寸
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      // 重置变换矩阵并缩放上下文以匹配设备像素比
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 将经纬度转换为画布坐标（使用CSS尺寸，因为ctx已缩放）
    const latLngToCanvas = (lat: number, lng: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((lng + 180) / 360) * rect.width;
      const y = ((90 - lat) / 180) * rect.height;
      return { x, y };
    };

    // 绘制发光点
    const drawGlowPoint = (x: number, y: number, color: string, size: number = 8) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + '80');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    };

    // 绘制航线
    const drawFlightPath = (path: FlightPath) => {
      const from = latLngToCanvas(path.from.lat, path.from.lng);
      const to = latLngToCanvas(path.to.lat, path.to.lng);

      // 计算曲线控制点（大圆航线）
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const curve = Math.abs(to.x - from.x) * 0.3;
      const controlY = midY - curve;

      // 绘制航线轨迹
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(midX, controlY, to.x, to.y);
      ctx.stroke();

      // 计算当前飞机位置
      const t = path.progress;
      const currentX = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
      const currentY = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * controlY + t * t * to.y;

      // 绘制飞机
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.save();
      ctx.translate(currentX, currentY);
      ctx.rotate(angle);
      
      // 飞机发光效果
      const planeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
      planeGradient.addColorStop(0, '#6366f1');
      planeGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = planeGradient;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();

      // 飞机图标
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(12, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };

    // 初始化航线
    let paths: FlightPath[] = [];
    const cityNames = Object.keys(cities);
    
    // 创建3-5条随机航线
    for (let i = 0; i < 4; i++) {
      const fromCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      const toCity = cityNames[Math.floor(Math.random() * cityNames.length)];
      if (fromCity !== toCity) {
        paths.push({
          id: `path-${i}`,
          from: { ...cities[fromCity], city: fromCity },
          to: { ...cities[toCity], city: toCity },
          progress: Math.random()
        });
      }
    }

    // 动画循环
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // 绘制所有城市点
      Object.entries(cities).forEach(([city, coords]) => {
        const pos = latLngToCanvas(coords.lat, coords.lng);
        const destParts = destination?.split(' ') || [];
        const isDestination = destination && (
          city.includes(destParts[destParts.length - 1]) || 
          city.includes(destParts[0])
        );
        drawGlowPoint(pos.x, pos.y, isDestination ? '#06b6d4' : '#6366f1', isDestination ? 12 : 6);
      });

      // 更新并绘制航线
      paths = paths.map(path => ({
        ...path,
        progress: (path.progress + 0.005) % 1
      }));

      paths.forEach(drawFlightPath);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [destination]);

  return (
    <div className="world-map-container">
      <canvas ref={canvasRef} className="world-map-canvas" />
      <div className="map-glow"></div>
    </div>
  );
}

