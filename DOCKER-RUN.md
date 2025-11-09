# Docker 本地运行指南

本指南将帮助你使用 Docker 在本地运行 AI Travel Planner 应用。

## 📋 前置要求

- Docker Desktop 已安装并运行
- PowerShell（Windows）或 Bash（Linux/Mac）

## 🚀 快速开始

### 方法一：使用构建脚本（推荐）

```powershell
# 1. 构建 Docker 镜像
.\build-docker.ps1

# 2. 运行容器
docker run -d `
  --name ai-travel-planner `
  -p 3000:3000 `
  --env-file docker.env `
  ai-travel-planner:local
```

### 方法二：手动构建和运行

```powershell
# 1. 从 docker.env 提取 NEXT_PUBLIC_* 变量用于构建
Get-Content docker.env | Where-Object { 
    $_ -notmatch '^\s*#' -and $_ -match '^NEXT_PUBLIC_' 
} | Out-File -FilePath .env.local -Encoding utf8

# 2. 构建镜像
docker build -t ai-travel-planner:local .

# 3. 清理临时文件
Remove-Item .env.local -Force

# 4. 运行容器
docker run -d `
  --name ai-travel-planner `
  -p 3000:3000 `
  --env-file docker.env `
  ai-travel-planner:local
```

## 🔍 验证运行

1. **检查容器状态**
   ```powershell
   docker ps
   ```

2. **查看容器日志**
   ```powershell
   docker logs ai-travel-planner
   ```

3. **访问应用**
   打开浏览器访问：http://localhost:3000

## 🛠️ 常用命令

### 停止容器
```powershell
docker stop ai-travel-planner
```

### 启动已停止的容器
```powershell
docker start ai-travel-planner
```

### 重启容器
```powershell
docker restart ai-travel-planner
```

### 删除容器
```powershell
docker stop ai-travel-planner
docker rm ai-travel-planner
```

### 删除镜像
```powershell
docker rmi ai-travel-planner:local
```

### 进入容器（调试用）
```powershell
docker exec -it ai-travel-planner sh
```

## 📝 环境变量说明

### 构建时变量（NEXT_PUBLIC_*）
这些变量在构建时嵌入到客户端代码中：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `NEXT_PUBLIC_AMAP_KEY` - 高德地图 API Key
- `NEXT_PUBLIC_APP_URL` - 应用基础 URL（用于回调链接）

### 运行时变量
这些变量在运行时通过 `--env-file` 传递：
- `DASHSCOPE_API_KEY` - 阿里云百炼 API Key
- `UNSPLASH_ACCESS_KEY` - Unsplash API Key

## 🔧 故障排查

### 问题：容器无法启动
**解决方案：**
```powershell
# 查看详细日志
docker logs ai-travel-planner

# 检查端口是否被占用
netstat -ano | findstr :3000
```

### 问题：环境变量未生效
**解决方案：**
- 确保 `docker.env` 文件存在且格式正确
- 检查变量名是否正确（区分大小写）
- 重新构建镜像（NEXT_PUBLIC_* 变量需要重新构建）

### 问题：无法访问应用
**解决方案：**
- 确认容器正在运行：`docker ps`
- 检查端口映射：`docker port ai-travel-planner`
- 尝试访问：http://127.0.0.1:3000

## 📦 Docker 构建流程说明

### 多阶段构建

1. **base 阶段**：基础 Node.js 镜像
2. **deps 阶段**：安装项目依赖
3. **builder 阶段**：构建 Next.js 应用
4. **runner 阶段**：运行时的最小镜像

### Standalone 模式

Next.js 使用 `standalone` 输出模式，只包含运行应用所需的最小文件，大幅减少镜像大小。

### 启动脚本

`docker-entrypoint.sh` 脚本负责：
- 加载运行时环境变量
- 设置 NEXT_PUBLIC_* 变量
- 启动 Next.js 服务器

## 🎯 最佳实践

1. **使用构建脚本**：`build-docker.ps1` 自动处理环境变量分离
2. **使用环境变量文件**：通过 `--env-file` 传递敏感信息
3. **定期更新镜像**：代码更改后重新构建镜像
4. **查看日志**：使用 `docker logs` 监控应用状态

## 📚 相关文件

- `Dockerfile` - Docker 镜像构建配置
- `docker-entrypoint.sh` - 容器启动脚本
- `docker.env` - 环境变量配置文件
- `build-docker.ps1` - 自动化构建脚本
- `next.config.mjs` - Next.js 配置（启用 standalone 模式）

