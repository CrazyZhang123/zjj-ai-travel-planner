/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // 启用 standalone 输出以优化 Docker 镜像大小
  output: 'standalone'
};
export default nextConfig;
