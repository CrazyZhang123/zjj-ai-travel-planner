# 使用官方 Node.js 运行时作为基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 验证 .env.local 文件是否存在并验证环境变量
# Next.js 会自动读取 .env.local 文件中的 NEXT_PUBLIC_* 变量
RUN echo "验证环境变量..." && \
    if [ ! -f ".env.local" ]; then \
      echo "❌ 错误: .env.local 文件不存在" && exit 1; \
    fi && \
    if ! grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local 2>/dev/null || [ -z "$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d'=' -f2)" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_SUPABASE_URL 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_SUPABASE_URL 已设置"; \
    fi && \
    if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local 2>/dev/null || [ -z "$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d'=' -f2)" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置"; \
    fi && \
    if ! grep -q "NEXT_PUBLIC_AMAP_KEY=" .env.local 2>/dev/null || [ -z "$(grep '^NEXT_PUBLIC_AMAP_KEY=' .env.local | cut -d'=' -f2)" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_AMAP_KEY 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_AMAP_KEY 已设置"; \
    fi && \
    echo "环境变量验证通过" && \
    echo ".env.local 文件包含 $(wc -l < .env.local) 行"

# 构建应用
# Next.js 会自动读取 .env.local 文件中的 NEXT_PUBLIC_* 变量
RUN npm run build

# 验证环境变量是否被正确嵌入到构建输出中
# 检查 .next/static/chunks 中是否包含环境变量（不显示完整值）
RUN echo "验证构建输出中的环境变量..." && \
    if grep -r "NEXT_PUBLIC_SUPABASE_URL" .next/static/chunks 2>/dev/null | head -1 | grep -q "https://"; then \
      echo "✅ NEXT_PUBLIC_SUPABASE_URL 已正确嵌入到构建输出中"; \
    else \
      echo "⚠️  警告: 未在构建输出中找到 NEXT_PUBLIC_SUPABASE_URL"; \
    fi && \
    if grep -r "NEXT_PUBLIC_SUPABASE_ANON_KEY" .next/static/chunks 2>/dev/null | head -1 | grep -q "eyJ"; then \
      echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已正确嵌入到构建输出中"; \
    else \
      echo "⚠️  警告: 未在构建输出中找到 NEXT_PUBLIC_SUPABASE_ANON_KEY"; \
    fi

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 注意：NEXT_PUBLIC_* 变量已在构建时嵌入到客户端代码中
# 服务端代码如果需要这些变量，应在运行时通过环境变量或 .env.local 文件提供

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要的文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
