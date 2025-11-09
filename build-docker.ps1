# Docker 构建脚本 - 从 docker.env 文件读取环境变量
# 使用方法: .\build-docker.ps1 [镜像标签]
#
# 安全说明：
# - 只将 NEXT_PUBLIC_* 变量写入 .env.local 文件用于构建
# - 服务器端密钥（DASHSCOPE_API_KEY, UNSPLASH_ACCESS_KEY）不在构建时使用
# - 服务器端密钥应在运行时通过 --env-file 传递

param(
    [string]$Tag = "ai-travel-planner:local"
)

# 检查 docker.env 文件是否存在
if (-not (Test-Path "docker.env")) {
    Write-Host "错误: 找不到 docker.env 文件" -ForegroundColor Red
    exit 1
}

Write-Host "正在从 docker.env 文件读取环境变量..." -ForegroundColor Green

# 读取 docker.env 文件并提取环境变量
$envVars = @{}
Get-Content "docker.env" | ForEach-Object {
    # 跳过注释和空行
    if ($_ -match '^\s*#|^\s*$') {
        return
    }
    
    # 解析 KEY=VALUE 格式
    if ($_ -match '^\s*([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# 分离构建时变量和运行时变量
$buildTimeVars = @{}
$runtimeVars = @{}

foreach ($key in $envVars.Keys) {
    if ($key -like "NEXT_PUBLIC_*") {
        $buildTimeVars[$key] = $envVars[$key]
    } else {
        $runtimeVars[$key] = $envVars[$key]
    }
}

# 创建临时的 .env.local 文件（只包含 NEXT_PUBLIC_* 变量）
$envLocalPath = ".env.local"
Write-Host "创建构建时环境变量文件: $envLocalPath" -ForegroundColor Cyan
Write-Host "构建时使用的环境变量: $($buildTimeVars.Keys -join ', ')" -ForegroundColor Cyan

# 写入 .env.local 文件
$buildTimeVars.Keys | ForEach-Object {
    "$_=$($buildTimeVars[$_])" | Out-File -FilePath $envLocalPath -Append -Encoding utf8
}

if ($runtimeVars.Count -gt 0) {
    Write-Host "运行时环境变量（需通过 --env-file 传递）: $($runtimeVars.Keys -join ', ')" -ForegroundColor Yellow
}

Write-Host "`n开始构建 Docker 镜像: $Tag" -ForegroundColor Green

# 执行 Docker 构建（不需要 --build-arg，因为使用 .env.local 文件）
$dockerArgs = @("build", "-t", $Tag, ".")
& docker $dockerArgs

$buildSuccess = $LASTEXITCODE -eq 0

# 清理临时文件
if (Test-Path $envLocalPath) {
    Remove-Item $envLocalPath -Force
    Write-Host "已清理临时文件: $envLocalPath" -ForegroundColor Gray
}

if ($buildSuccess) {
    Write-Host "`n构建成功! 镜像标签: $Tag" -ForegroundColor Green
    Write-Host "`n运行镜像时，请使用 --env-file docker.env 传递运行时环境变量" -ForegroundColor Cyan
} else {
    Write-Host "`n构建失败!" -ForegroundColor Red
    exit $LASTEXITCODE
}

