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

# 接收构建参数（环境变量）
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_AMAP_KEY

# 将 ARG 转换为 ENV，确保在构建时可用
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_AMAP_KEY=${NEXT_PUBLIC_AMAP_KEY}

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 验证环境变量并创建 .env.local 文件
# Next.js 会自动读取 .env.local 文件中的 NEXT_PUBLIC_* 变量
RUN echo "验证环境变量..." && \
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_SUPABASE_URL 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_SUPABASE_URL 已设置 (长度: $(echo -n "$NEXT_PUBLIC_SUPABASE_URL" | wc -c))"; \
    fi && \
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY 已设置 (长度: $(echo -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | wc -c))"; \
    fi && \
    if [ -z "$NEXT_PUBLIC_AMAP_KEY" ]; then \
      echo "❌ 错误: NEXT_PUBLIC_AMAP_KEY 未设置或为空" && exit 1; \
    else \
      echo "✅ NEXT_PUBLIC_AMAP_KEY 已设置 (长度: $(echo -n "$NEXT_PUBLIC_AMAP_KEY" | wc -c))"; \
    fi && \
    echo "环境变量验证通过" && \
    printf "NEXT_PUBLIC_SUPABASE_URL=%s\n" "$NEXT_PUBLIC_SUPABASE_URL" > .env.local && \
    printf "NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> .env.local && \
    printf "NEXT_PUBLIC_AMAP_KEY=%s\n" "$NEXT_PUBLIC_AMAP_KEY" >> .env.local && \
    echo ".env.local 文件已创建，包含 $(wc -l < .env.local) 行" && \
    echo "验证 .env.local 文件内容（仅显示键名和值长度）:" && \
    while IFS='=' read -r key value; do \
      if [ -n "$key" ] && [ -n "$value" ]; then \
        echo "  $key = [值长度: $(echo -n "$value" | wc -c)]"; \
      fi; \
    done < .env.local

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
