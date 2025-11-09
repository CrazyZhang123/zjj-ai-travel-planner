# AI 旅行规划器 (Next.js + Supabase + 高德地图 + 阿里云百炼)

一个功能完整的 AI 驱动的旅行规划 Web 应用，支持：
- 📝 **语音或文字输入** 旅行偏好
- 🤖 **AI 生成** 个性化行程和预算（使用阿里云百炼通义千问）
- 🗺️ **地图可视化** 展示景点位置（高德地图）
- 💾 **云端保存** 行程（Supabase 认证和存储）
- 🖼️ **图片搜索** 展示目的地相关图片

## ✨ 最近更新（Bug 修复）

### 已修复的问题：
1. ✅ **环境变量访问错误** - 修复了客户端组件无法正确读取环境变量的问题
2. ✅ **货币显示不一致** - 改为动态显示正确的货币单位
3. ✅ **缺少环境变量模板** - 添加了 `.env.example` 文件

详细修复说明请查看 [SETUP.md](./SETUP.md)

## 🚀 快速开始

### 方式一：使用 Docker（推荐）

#### 1. 拉取 Docker 镜像

```bash
# 从阿里云容器镜像服务拉取
docker pull registry.cn-hangzhou.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest

# 或者使用其他标签
docker pull registry.cn-hangzhou.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:main
```

#### 2. 运行容器

```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:3000 \
  -e DASHSCOPE_API_KEY=sk-your-dashscope-api-key \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \
  -e NEXT_PUBLIC_AMAP_KEY=your-amap-key \
  registry.cn-hangzhou.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest
```

#### 3. 使用环境变量文件

创建 `docker.env` 文件：

```env
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_AMAP_KEY=your-amap-key
PEXELS_API_KEY=your-pexels-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

然后运行：

```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:3000 \
  --env-file docker.env \
  registry.cn-hangzhou.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest
```

#### 4. 访问应用

打开浏览器访问：http://localhost:3000

#### 5. 查看日志

```bash
docker logs -f ai-travel-planner
```

#### 6. 停止和删除容器

```bash
# 停止容器
docker stop ai-travel-planner

# 删除容器
docker rm ai-travel-planner
```

### 方式二：本地开发

### 1. 安装依赖

```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 填入你的配置：

```env
# 阿里云百炼 API Key
DASHSCOPE_API_KEY=sk-your-dashscope-api-key-here

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 高德地图 API Key (可选)
NEXT_PUBLIC_AMAP_KEY=your-amap-key-here
```

**获取 API Keys 的方法**：
- **阿里云百炼**: https://bailian.console.aliyun.com/ → API-KEY 管理
- **Supabase**: https://supabase.com → 创建项目 → Settings → API
- **高德地图**: https://console.amap.com/dev/key/app

### 3. 设置 Supabase 数据库

在 Supabase SQL Editor 中执行（详见 [SETUP.md](./SETUP.md)）：

```sql
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  payload JSONB
);
-- 更多 SQL 见 SETUP.md
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 🎉

### 方式三：本地构建 Docker 镜像

#### 1. 准备环境变量文件

确保 `docker.env` 文件存在并包含所有必需的环境变量：

```env
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_AMAP_KEY=your-amap-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

#### 2. 使用 PowerShell 脚本构建（推荐）

```powershell
# 使用默认标签
.\build-docker.ps1

# 或指定自定义标签
.\build-docker.ps1 -Tag "ai-travel-planner:my-tag"
```

脚本会自动从 `docker.env` 文件读取环境变量，创建 `.env.local` 文件用于构建，构建完成后自动清理。

**安全说明**：
- ✅ 使用 `.env.local` 文件而不是 `ARG/ENV`，避免 Docker 安全警告
- ✅ 只将 `NEXT_PUBLIC_*` 变量写入 `.env.local`（需要在构建时嵌入到客户端代码）
- ✅ 服务器端密钥（`DASHSCOPE_API_KEY`、`UNSPLASH_ACCESS_KEY`）不在构建时使用，应在运行时通过 `--env-file` 传递

#### 3. 手动构建（不使用脚本）

如果需要手动构建，需要先创建 `.env.local` 文件：

```powershell
# 从 docker.env 提取 NEXT_PUBLIC_* 变量并创建 .env.local
Get-Content docker.env | Where-Object { 
    $_ -notmatch '^\s*#' -and $_ -match '^NEXT_PUBLIC_' 
} | Out-File -FilePath .env.local -Encoding utf8

# 构建镜像
docker build -t ai-travel-planner:local .

# 清理临时文件
Remove-Item .env.local -Force
```

或者使用 Bash（Linux/Mac）：

```bash
# 从 docker.env 提取 NEXT_PUBLIC_* 变量并创建 .env.local
grep '^NEXT_PUBLIC_' docker.env > .env.local

# 构建镜像
docker build -t ai-travel-planner:local .

# 清理临时文件
rm .env.local
```

#### 4. 运行构建的镜像

**重要**：服务器端密钥（`DASHSCOPE_API_KEY`、`UNSPLASH_ACCESS_KEY`）在运行时通过环境变量传递，不会嵌入到镜像中，更安全。

```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:3000 \
  --env-file docker.env \
  ai-travel-planner:local
```

或者手动指定环境变量：

```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:3000 \
  -e DASHSCOPE_API_KEY=sk-your-key \
  -e UNSPLASH_ACCESS_KEY=your-unsplash-key \
  ai-travel-planner:local
```

## 📦 Docker 镜像信息

### 镜像地址

```
registry.cn-hangzhou.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest
```

### 可用标签

- `latest` - 最新版本（main 分支）
- `main` - main 分支构建
- `v1.0.0` - 版本标签（如果存在）
- `main-<commit-sha>` - 特定提交构建

### 镜像大小

约 200-300MB（基于 Node.js 20 Alpine）

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 | 获取地址 |
|--------|------|------|----------|
| `DASHSCOPE_API_KEY` | ✅ | 阿里云百炼 API Key | https://bailian.console.aliyun.com/ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL | https://supabase.com |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名 Key | https://supabase.com |
| `NEXT_PUBLIC_AMAP_KEY` | ⭕ | 高德地图 API Key | https://console.amap.com/dev/key/app |
| `PEXELS_API_KEY` | ⭕ | Pexels 图片 API Key | https://www.pexels.com/api/ |
| `UNSPLASH_ACCESS_KEY` | ⭕ | Unsplash 图片 API Key | https://unsplash.com/developers |

## 📖 详细文档

完整的设置指南、常见问题和故障排查，请查看 **[SETUP.md](./SETUP.md)**

## 🔄 CI/CD

项目使用 GitHub Actions 自动构建和推送 Docker 镜像到阿里云容器镜像服务。

### 触发条件

- 推送到 `main` 或 `master` 分支
- 创建版本标签（`v*`）
- 手动触发（workflow_dispatch）

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `ALIYUN_ACR_USERNAME` - 阿里云容器镜像服务用户名
- `ALIYUN_ACR_PASSWORD` - 阿里云容器镜像服务密码

### 配置步骤

1. 登录阿里云控制台
2. 进入容器镜像服务 ACR
3. 创建命名空间（如果还没有）
4. 获取访问凭证（用户名和密码）
5. 在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加上述两个 Secret
6. 修改 `.github/workflows/docker-build.yml` 中的 `NAMESPACE` 为你的命名空间

## 🚢 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量
4. 点击 Deploy

## 🛠️ 技术栈

- **Next.js 14** - React 框架
- **TypeScript** - 类型安全
- **Supabase** - 认证和数据库
- **阿里云百炼 (通义千问)** - AI 行程生成
- **高德地图** - 地图可视化
- **Web Speech API** - 语音识别
- **Docker** - 容器化部署

## 📂 项目结构

```
ai-travel-planner-nextjs/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── plan/          # 行程生成 API
│   │   ├── save/          # 保存行程 API
│   │   ├── load/          # 加载行程 API
│   │   ├── list/          # 行程列表 API
│   │   ├── search-images/ # 图片搜索 API
│   │   └── voice-parse/   # 语音解析 API
│   └── page.tsx           # 主页面
├── components/             # React 组件
│   ├── AMap.tsx           # 高德地图组件
│   ├── AuthBar.tsx        # 认证组件
│   ├── ItineraryView.tsx  # 行程展示组件
│   └── ...
├── lib/                    # 工具库
│   └── supabaseClient.ts  # Supabase 客户端
├── Dockerfile              # Docker 构建文件
├── .dockerignore          # Docker 忽略文件
├── .github/               # GitHub Actions
│   └── workflows/
│       └── docker-build.yml
└── package.json           # 项目配置
```

## 🐛 常见问题

### Q: Docker 容器无法启动？

A: 检查：
1. 环境变量是否正确配置
2. 端口 3000 是否被占用
3. 查看容器日志：`docker logs ai-travel-planner`

### Q: 百炼 API 调用失败？

A: 检查：
1. API Key 是否正确配置
2. 账户是否有足够的余额
3. 网络是否能访问阿里云 API

### Q: 地图不显示？

A: 检查：
1. 是否配置了 `NEXT_PUBLIC_AMAP_KEY`
2. 高德地图 Key 是否有效
3. 浏览器控制台是否有错误信息

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 GitHub Issue。
