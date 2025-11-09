# AI 旅行规划器 - 设置指南

## 修复的问题

### 1. **环境变量访问错误** (已修复)
- **问题**: 在客户端组件 `app/page.tsx` 中直接使用 `process.env` 访问环境变量会返回 `undefined`
- **修复**: 将环境变量的读取移到服务端 API 路由 `app/api/save/route.ts` 中

### 2. **货币显示不一致** (已修复)
- **问题**: `components/ItineraryView.tsx` 中使用硬编码的 `$` 符号
- **修复**: 改为使用 `plan.currency` 动态显示正确的货币单位

### 3. **缺少环境变量模板** (已修复)
- **问题**: 缺少 `.env.example` 文件
- **修复**: 创建了 `.env.example` 文件作为配置模板

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 文件，填入以下配置：

#### a) 阿里云百炼 API Key
访问 https://bailian.console.aliyun.com/ 获取 API Key

1. 登录阿里云账号
2. 进入百炼控制台
3. 点击 "API-KEY 管理"
4. 创建新的 API Key

```
DASHSCOPE_API_KEY=sk-your-actual-dashscope-api-key
```

#### b) Supabase 配置

1. 访问 https://supabase.com 创建免费账号
2. 创建新项目
3. 在 Project Settings → API 中找到：
   - Project URL
   - anon/public key

```
NEXT_PUBLIC_SUPABASE_URL=https://jwirtpmjiivnoupgtmue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_JDDFcIdq_cYhODfH5J4olg_XC-P-iOKimage.png
uk8Y9gFCEyi8k7mt
```

4. **在 Supabase 的 SQL Editor 中执行数据库设置脚本**：

   **方法 1：使用项目提供的完整脚本（推荐）**
   
   1. 打开项目根目录的 `supabase-setup.sql` 文件
   2. 复制全部内容
   3. 在 Supabase 控制台 → **SQL Editor** → **New Query**
   4. 粘贴 SQL 脚本
   5. 点击 **Run** 执行
   
   **方法 2：手动执行（如果方法1失败）**
   
   在 SQL Editor 中执行以下 SQL：
   
   ```sql
   -- 删除旧表（如果存在）
   DROP TABLE IF EXISTS itineraries CASCADE;
   
   -- 创建行程表
   CREATE TABLE itineraries (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     title TEXT NOT NULL,
     payload JSONB NOT NULL
   );
   
   -- 添加索引
   CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
   CREATE INDEX idx_itineraries_created_at ON itineraries(created_at DESC);
   
   -- 启用 RLS (行级安全)
   ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
   
   -- 创建策略：用户只能查看和修改自己的数据
   CREATE POLICY "Users can view their own itineraries"
     ON itineraries FOR SELECT
     USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own itineraries"
     ON itineraries FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own itineraries"
     ON itineraries FOR UPDATE
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete their own itineraries"
     ON itineraries FOR DELETE
     USING (auth.uid() = user_id);
   ```
   
   **验证设置**：
   - 执行后应该看到 "Success. No rows returned"
   - 在 Table Editor 中应该能看到 `itineraries` 表
   - 在 Authentication → Policies 中应该能看到 4 个策略

#### c) 高德地图 API Key (可选，但推荐配置)

1. 访问 https://console.amap.com/dev/key/app
2. 注册并创建应用
3. 选择 "Web端(JS API)" 平台
4. 获取 Key

```
NEXT_PUBLIC_AMAP_KEY=your-amap-key
```

**注意**: 如果不配置地图 API，地图功能将不显示，但其他功能正常使用。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 使用说明

### 基本功能

1. **输入旅行信息**
   - 目的地：如 "日本 东京"
   - 日期范围
   - 预算：如 "10000 CNY" 或 "150000 JPY"
   - 同行人数
   - 偏好：可以文字输入或使用语音输入（Chrome 浏览器支持）

2. **生成行程**
   - 点击 "生成行程与预算" 按钮
   - AI 会根据你的输入生成详细的日程安排、景点推荐、酒店和餐饮建议
   - 如果配置了高德地图，景点会标注在地图上

3. **保存行程**
   - 点击 "登录/注册" 使用邮箱登录（Supabase Magic Link）
   - 登录后点击 "保存到云端" 保存行程

### 语音输入

- 点击 "🎤 语音" 按钮开始语音识别（需要 Chrome 浏览器）
- 说出你的偏好，如 "我喜欢美食和动漫，想带孩子去玩"
- 识别结果会自动填入偏好框

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 访问 https://vercel.com 导入项目
3. 在 Vercel 项目设置中添加环境变量（与 `.env.local` 相同）
4. 点击 Deploy

## 技术栈

- **Next.js 14**: React 框架
- **TypeScript**: 类型安全
- **Supabase**: 用户认证和数据存储
- **阿里云百炼 (通义千问)**: AI 行程规划
- **高德地图**: 地图可视化
- **Web Speech API**: 语音识别

## 常见问题

### Q: 百炼 API 调用失败？
A: 检查：
1. API Key 是否正确配置
2. 账户是否有足够的余额
3. 网络是否能访问阿里云 API
4. 如需切换模型，可在 `app/api/plan/route.ts` 中将 `qwen-plus` 改为 `qwen-turbo` 或 `qwen-max`

### Q: 地图不显示？
A: 检查：
1. 是否配置了 `NEXT_PUBLIC_AMAP_KEY`
2. 高德地图 Key 是否有效
3. 浏览器控制台是否有错误信息

### Q: 语音识别不工作？
A: 
1. 确保使用 Chrome 浏览器
2. 需要 HTTPS 或 localhost 环境
3. 授予浏览器麦克风权限

### Q: 保存功能不工作？
A: 检查：
1. 是否已登录
2. Supabase 配置是否正确
3. 数据表是否创建
4. RLS 策略是否设置

## 项目结构

```
ai-travel-planner-nextjs/
├── app/
│   ├── api/
│   │   ├── plan/route.ts      # OpenAI 行程生成 API
│   │   └── save/route.ts      # 保存行程 API
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页面
├── components/
│   ├── AMap.tsx               # 高德地图组件
│   ├── AuthBar.tsx            # 登录/注册组件
│   └── ItineraryView.tsx      # 行程展示组件
├── lib/
│   └── supabaseClient.ts      # Supabase 客户端
├── .env.example               # 环境变量模板
└── package.json               # 依赖配置
```

## 许可证

MIT

