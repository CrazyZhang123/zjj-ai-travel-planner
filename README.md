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
docker pull crpi-qpqr9kpy8y14y90q.cn-hangzhou.personal.cr.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest

# 或者使用其他标签
docker pull crpi-qpqr9kpy8y14y90q.cn-hangzhou.personal.cr.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:main
```

#### 2. 使用环境变量文件

创建 `docker.env` 文件：

```env
# 阿里云百炼 API Key
DASHSCOPE_API_KEY=your_key

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://jwirtpmjiivnoupgtmue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 应用基础 URL（用于 Supabase 回调链接，避免在 Docker 中使用 0.0.0.0）
NEXT_PUBLIC_APP_URL=http://localhost:3000


# 高德地图 API Key (可选)
NEXT_PUBLIC_AMAP_KEY=your_key

# Unsplash API Key (用于图片搜索)
UNSPLASH_ACCESS_KEY=your_key
```

然后运行：

```bash
docker run -d \
  --name ai-travel-planner \
  -p 3000:3000 \
  --env-file docker.env \
  crpi-qpqr9kpy8y14y90q.cn-hangzhou.personal.cr.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest
```

#### 3. 访问应用

打开浏览器访问：http://localhost:3000

#### 4. 查看日志

```bash
docker logs -f ai-travel-planner
```

#### 5. 停止和删除容器

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
windows手动创建\
mac: touch

```bash
touch .env.local
```

然后编辑 `.env.local` 填入你的配置：

```env
# 阿里云百炼 API Key
DASHSCOPE_API_KEY=your_key

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://jwirtpmjiivnoupgtmue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# 应用基础 URL（用于 Supabase 回调链接，避免在 Docker 中使用 0.0.0.0）
NEXT_PUBLIC_APP_URL=http://localhost:3000


# 高德地图 API Key (可选)
NEXT_PUBLIC_AMAP_KEY=your_key

# Unsplash API Key (用于图片搜索)
UNSPLASH_ACCESS_KEY=your_key
```

**获取 API Keys 的方法**：
- **阿里云百炼**: https://bailian.console.aliyun.com/ → API-KEY 管理
- **Supabase**: https://supabase.com → 创建项目 → Settings → API
- **高德地图**: https://console.amap.com/dev/key/app


### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 🎉



## 📦 Docker 镜像信息

### 镜像地址

```
crpi-qpqr9kpy8y14y90q.cn-hangzhou.personal.cr.aliyuncs.com/zjj-ai-travel-planner/ai-travel-planner:latest
```

### 可用标签

- `latest` - 最新版本（main 分支）


### 镜像大小

约174 MB（基于 Node.js 20 Alpine）

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 | 获取地址 |
|--------|------|------|----------|
| `DASHSCOPE_API_KEY` | ✅ | 阿里云百炼 API Key | https://bailian.console.aliyun.com/ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL | https://supabase.com |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名 Key | https://supabase.com |
| `NEXT_PUBLIC_AMAP_KEY` | ⭕ | 高德地图 API Key | https://console.amap.com/dev/key/app |
| `UNSPLASH_ACCESS_KEY` | ⭕ | Unsplash 图片 API Key | https://unsplash.com/developers |

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

>  **Tips**: 收到supabase的邮箱链接后，需要注意，如果开头是0.0.0.0:3000，请手动替换为localhost，一般不会存在这个问题

### Q: Docker 容器无法启动？

A: 检查：
1. 环境变量是否正确配置
2. 端口 3000 是否被占用
3. 查看容器日志：`docker logs ai-travel-planner`

### Q: 本地项目运行环境？

A: mac/windows

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
