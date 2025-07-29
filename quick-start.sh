#!/bin/bash

echo "🚀 Echo AI 快速启动脚本"
echo "======================"

# 检查是否在正确目录
if [ ! -d "Demo_echo_frontend/frontend" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    echo "当前目录：$(pwd)"
    echo "期望目录结构：./Demo_echo_frontend/frontend/"
    exit 1
fi

echo "📍 当前目录：$(pwd)"
echo "🔍 检查现有进程..."

# 检查现有React进程
EXISTING_PROCESSES=$(ps aux | grep react-scripts | grep -v grep)
if [ ! -z "$EXISTING_PROCESSES" ]; then
    echo "⚠️  发现现有React进程："
    echo "$EXISTING_PROCESSES"
    echo ""
    read -p "是否要停止现有进程并重新启动？(y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 停止现有React进程..."
        pkill -f react-scripts
        sleep 2
    else
        echo "ℹ️  保留现有进程，退出启动脚本"
        exit 0
    fi
fi

# 切换到前端目录
echo "📂 进入前端目录..."
cd Demo_echo_frontend/frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
fi

# 启动开发服务器
echo "🔥 启动React开发服务器..."
echo "   - 本地访问：http://localhost:3000"
echo "   - 网络访问：http://10.109.129.119:3000"
echo ""
echo "💡 在Cursor中设置端口转发："
echo "   1. Cmd+Shift+P → 'Ports: Focus on Ports View'"
echo "   2. 添加端口：3000"
echo "   3. 设置为：公开(Public)"
echo ""
echo "🎯 启动中..."
echo "按 Ctrl+C 停止服务器"
echo ""

npm start 