# 阿里云百炼 API 集成说明

## ✅ 已完成的修改

本项目已成功从 OpenAI API 迁移到阿里云百炼 API（通义千问）。

### 修改的文件

1. **`app/api/plan/route.ts`** ✅
   - 环境变量：`OPENAI_API_KEY` → `DASHSCOPE_API_KEY`
   - API 地址：`https://api.openai.com/v1/chat/completions` → `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
   - 模型：`gpt-4o-mini` → `qwen-plus`

2. **`.env.example`** ✅
   - 更新为百炼 API 配置模板

3. **`README.md`** ✅
   - 更新快速开始指南
   - 更新技术栈说明
   - 更新 API Key 获取链接

4. **`SETUP.md`** ✅
   - 更新详细配置说明
   - 更新常见问题解答
   - 更新技术栈信息

---

## 🚀 如何使用

### 1. 获取百炼 API Key

1. 访问 **https://bailian.console.aliyun.com/**
2. 登录阿里云账号（没有的话需要先注册）
3. 点击左侧菜单 "API-KEY 管理"
4. 点击 "创建新的API-KEY"
5. 复制生成的 API Key（格式：`sk-xxx...`）

### 2. 配置环境变量

创建或编辑 `.env.local` 文件：

```bash
# 阿里云百炼 API Key
DASHSCOPE_API_KEY=sk-your-actual-dashscope-api-key

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 高德地图 API Key (可选)
NEXT_PUBLIC_AMAP_KEY=your-amap-key-here
```

### 3. 安装依赖并运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000

---

## 🎯 可用的百炼模型

你可以在 `app/api/plan/route.ts` 第 36 行修改模型：

| 模型名称 | 说明 | 适用场景 |
|---------|------|---------|
| `qwen-turbo` | 速度快，成本低 | 快速生成，对质量要求不高 |
| `qwen-plus` | ⭐ 推荐，性能强大 | 平衡性能和成本 |
| `qwen-max` | 最强性能 | 对质量要求高，需要权限 |
| `qwen-long` | 超长上下文 | 处理大量信息 |

### 修改模型示例

打开 `app/api/plan/route.ts`，找到第 36 行：

```typescript
model: "qwen-plus",  // 改为 "qwen-turbo" 或 "qwen-max"
```

---

## 💡 API 兼容性说明

### ✅ 完全兼容的特性

百炼 API 使用 OpenAI 兼容格式，以下特性完全支持：

- ✅ Chat Completions API
- ✅ JSON 模式输出 (`response_format: { type: "json_object" }`)
- ✅ System/User/Assistant 消息角色
- ✅ Temperature 参数
- ✅ Stream 模式（本项目未使用）

### 🔧 差异说明

1. **API 地址不同**
   - OpenAI: `https://api.openai.com/v1/`
   - 百炼: `https://dashscope.aliyuncs.com/compatible-mode/v1/`

2. **模型名称不同**
   - OpenAI: `gpt-4`, `gpt-3.5-turbo`, `gpt-4o-mini` 等
   - 百炼: `qwen-turbo`, `qwen-plus`, `qwen-max` 等

3. **认证方式相同**
   - 都使用 `Authorization: Bearer ${api_key}` Header

---

## 📊 费用对比

### OpenAI (参考价格)
- GPT-4o-mini: ~$0.15 / 1M tokens (输入)
- GPT-4: ~$30 / 1M tokens (输入)

### 阿里云百炼 (参考价格)
- Qwen-turbo: ¥0.3 / 1K tokens (~$0.04 / 1K tokens)
- Qwen-plus: ¥2 / 1K tokens (~$0.28 / 1K tokens)
- Qwen-max: ¥40 / 1K tokens (~$5.6 / 1K tokens)

**💰 成本优势**：百炼 API 通常比 OpenAI 便宜，特别是 qwen-turbo 模型性价比很高。

---

## 🧪 测试

### 测试生成行程功能

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:3000
3. 填写表单：
   - 目的地：日本 东京
   - 日期：2025-12-01 至 2025-12-05
   - 预算：10000 CNY
   - 人数：2
   - 偏好：美食、动漫、亲子
4. 点击 "生成行程与预算"
5. 等待几秒，应该看到详细的行程规划

### 预期输出

生成的 JSON 应包含：
- `title`: 行程标题
- `currency`: 货币单位（如 CNY）
- `total_budget_estimate`: 总预算
- `days[]`: 每日详细行程
  - 活动列表、酒店、餐饮、交通
  - 坐标信息（会显示在地图上）
  - 费用估算

---

## ❓ 常见问题

### Q1: 报错 "Missing DASHSCOPE_API_KEY"
**A**: 检查 `.env.local` 文件是否存在，并且包含正确的 API Key。

### Q2: API 调用返回 401 Unauthorized
**A**: API Key 不正确或已过期，请重新生成。

### Q3: 返回的内容不是 JSON 格式
**A**: 
1. 确保使用的模型支持 `response_format: { type: "json_object" }`
2. 如果不支持，可以删除这一行，并在 prompt 中强调返回 JSON

### Q4: 想切换回 OpenAI API
**A**: 
1. 修改 `app/api/plan/route.ts`:
   - 环境变量改回 `OPENAI_API_KEY`
   - API 地址改回 `https://api.openai.com/v1/chat/completions`
   - 模型改为 `gpt-4o-mini` 或其他 OpenAI 模型
2. 更新 `.env.local` 配置

### Q5: 如何查看 API 调用日志？
**A**: 在浏览器开发者工具的 Network 标签中，筛选 `/api/plan` 请求，查看详细信息。

---

## 📚 相关资源

- **百炼控制台**: https://bailian.console.aliyun.com/
- **百炼文档**: https://help.aliyun.com/zh/model-studio/
- **通义千问模型介绍**: https://help.aliyun.com/zh/model-studio/getting-started/models
- **OpenAI 兼容 API 文档**: https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope/

---

## 🎉 完成！

你的项目现在已经完全迁移到阿里云百炼 API。享受更快的响应速度和更低的成本吧！

如有任何问题，欢迎随时提问。

