# GitHub Actions Docker 构建测试指南

## 📋 前置准备

### 1. 配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets（Settings → Secrets and variables → Actions → New repository secret）：

#### 必需配置：
- `ALIYUN_NAMESPACE` - 阿里云容器镜像服务的命名空间
- `ALIYUN_USERNAME` - 阿里云账号用户名
- `ALIYUN_PASSWORD` - 阿里云账号密码（或访问令牌）
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `NEXT_PUBLIC_AMAP_KEY` - 高德地图 API Key

### 2. 验证阿里云容器镜像服务配置

1. 登录 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)
2. 确认命名空间已创建
3. 确认有推送镜像的权限

## 🧪 测试步骤

### 方法 1: 通过推送代码触发（推荐）

#### 步骤 1: 创建测试分支
```bash
git checkout -b test/docker-build
```

#### 步骤 2: 做一个小改动并提交
```bash
# 例如：更新 README 或添加一个注释
echo "# Test build" >> README.md
git add README.md
git commit -m "test: trigger docker build"
git push origin test/docker-build
```

#### 步骤 3: 创建 Pull Request
1. 在 GitHub 上创建从 `test/docker-build` 到 `main` 的 PR
2. 这会触发工作流（但不会推送镜像，因为 PR 不会推送）

#### 步骤 4: 合并到主分支
1. 合并 PR 到 `main` 分支
2. 这会触发完整的工作流，包括构建和推送镜像

#### 步骤 5: 查看工作流执行结果
1. 进入 GitHub 仓库的 **Actions** 标签页
2. 点击最新的工作流运行
3. 查看每个步骤的执行日志

### 方法 2: 手动触发（如果配置了 workflow_dispatch）

如果工作流支持手动触发，可以：
1. 进入 **Actions** 标签页
2. 选择 "Build and Push Docker Image" 工作流
3. 点击 "Run workflow"
4. 选择分支并运行

### 方法 3: 通过标签触发

```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

## ✅ 验证构建成功

### 1. 检查工作流日志

工作流应该成功完成以下步骤：
- ✅ Checkout code
- ✅ Create .env.local file
- ✅ Set up Docker Buildx
- ✅ Log in to Aliyun Container Registry
- ✅ Extract metadata
- ✅ Build and push Docker image
- ✅ Output image info

### 2. 检查镜像是否已推送

在阿里云容器镜像服务控制台：
1. 进入你的命名空间
2. 查看 `ai-travel-planner` 镜像
3. 确认有新的标签（如 `latest`, `main`, `sha-xxxxx` 等）

### 3. 本地拉取并测试镜像

```bash
# 登录阿里云容器镜像服务
docker login registry.cn-hangzhou.aliyuncs.com

# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/ai-travel-planner:latest

# 运行容器（需要 docker.env 文件）
docker run -d \
  --name ai-travel-planner-test \
  -p 3000:3000 \
  --env-file docker.env \
  registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/ai-travel-planner:latest

# 检查容器状态
docker ps

# 查看日志
docker logs ai-travel-planner-test

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

## 🔍 常见问题排查

### 问题 1: 工作流失败 - "Log in to Aliyun Container Registry" 步骤失败

**原因**: 认证信息错误
**解决**:
- 检查 `ALIYUN_USERNAME` 和 `ALIYUN_PASSWORD` 是否正确
- 确认密码不是账号密码，而是访问令牌（Access Token）

### 问题 2: 工作流失败 - ".env.local 文件不存在"

**原因**: 创建 .env.local 文件的步骤失败
**解决**:
- 检查 Secrets 是否已正确配置
- 查看工作流日志中 "Create .env.local file" 步骤的输出

### 问题 3: 构建失败 - "环境变量验证失败"

**原因**: 环境变量未设置或为空
**解决**:
- 检查所有 `NEXT_PUBLIC_*` 相关的 Secrets 是否已配置
- 确认 Secret 的值不为空

### 问题 4: 推送失败 - "denied: requested access to the resource is denied"

**原因**: 权限不足
**解决**:
- 确认账号有推送镜像到该命名空间的权限
- 检查命名空间名称是否正确

### 问题 5: PR 时也推送了镜像

**原因**: 工作流配置问题
**解决**: 
- 检查工作流中的 `push: ${{ github.event_name != 'pull_request' }}` 配置
- PR 时应该只构建，不推送

## 📝 工作流配置说明

### 触发条件
- 推送到 `main` 或 `master` 分支
- 创建以 `v*` 开头的标签
- 创建针对 `main` 或 `master` 的 Pull Request

### 标签策略
- `latest` - 默认分支（main/master）
- `main` / `master` - 分支名
- `pr-123` - Pull Request 编号
- `v1.0.0` - 语义化版本
- `1.0` - 主版本.次版本
- `main-abc123` - 分支名-SHA 前缀

### 缓存策略
- 使用阿里云容器镜像服务的 registry cache
- 缓存镜像：`registry.cn-hangzhou.aliyuncs.com/YOUR_NAMESPACE/ai-travel-planner:buildcache`

## 🎯 下一步

构建成功后，你可以：
1. 使用 `docker-compose.yml` 部署应用
2. 在服务器上拉取镜像并运行
3. 配置自动部署流程

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Docker Buildx 文档](https://docs.docker.com/buildx/)
- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)

