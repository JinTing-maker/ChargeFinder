#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 启动 ChargeFinder 开发服务器..."
echo ""

# 激活 conda 环境
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate vibe_code

# 启动服务器
echo "📍 主页:    http://localhost:8001/"
echo "📍 后台:    http://localhost:8001/admin/"
echo "👤 账号:    admin / admin123"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "═══════════════════════════════════════"

# 2秒后自动打开浏览器
sleep 2 && open http://localhost:8001/ &

python manage.py runserver 0.0.0.0:8001
