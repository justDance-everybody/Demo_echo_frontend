#!/bin/bash

echo "🔍 Echo AI 端口转发问题诊断脚本"
echo "=================================="
echo ""

# 1. 检查React开发服务器进程
echo "📋 1. 检查React开发服务器进程状态"
echo "-----------------------------------"
REACT_PROCESSES=$(ps aux | grep react-scripts | grep -v grep)
if [ -z "$REACT_PROCESSES" ]; then
    echo "❌ React开发服务器未运行"
    echo "💡 解决方案: cd Demo_echo_frontend/frontend && npm start"
    echo ""
else
    echo "✅ React开发服务器正在运行:"
    echo "$REACT_PROCESSES"
    echo ""
fi

# 2. 检查端口占用情况
echo "🔌 2. 检查端口3000占用情况"
echo "----------------------------"
PORT_INFO=$(netstat -tlnp 2>/dev/null | grep :3000)
if [ -z "$PORT_INFO" ]; then
    echo "❌ 端口3000未被占用"
    echo "💡 需要启动React开发服务器"
    echo ""
else
    echo "✅ 端口3000正在被监听:"
    echo "$PORT_INFO"
    echo ""
fi

# 3. 测试本地访问
echo "🌐 3. 测试远程服务器本地访问"
echo "-----------------------------"
if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 远程服务器本地访问正常"
    RESPONSE=$(curl -s -I http://localhost:3000 | head -1)
    echo "响应: $RESPONSE"
    echo ""
else
    echo "❌ 远程服务器本地访问失败"
    echo "💡 React开发服务器可能未启动或出现错误"
    echo ""
fi

# 4. 获取服务器网络信息
echo "📡 4. 服务器网络信息"
echo "-------------------"
echo "本机IP地址:"
hostname -I | tr ' ' '\n' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | head -3
echo ""

# 5. 检查防火墙状态
echo "🔥 5. 防火墙状态检查"
echo "-------------------"
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1)
    echo "UFW状态: $UFW_STATUS"
else
    echo "UFW未安装"
fi
echo ""

# 6. 提供解决方案
echo "🔧 常见解决方案"
echo "==============="
echo "问题1: React服务器未运行"
echo "  解决: cd Demo_echo_frontend/frontend && npm start"
echo ""
echo "问题2: Cursor端口转发检测失败"
echo "  解决: Cmd+Shift+P → 'Ports: Focus on Ports View' → 刷新 → 重新添加端口3000"
echo ""
echo "问题3: 端口转发可见性问题"
echo "  解决: 确保端口转发设置为'公开'(Public)而非'私有'(Private)"
echo ""
echo "问题4: SSH连接问题"
echo "  解决: Cmd+Shift+P → 'Remote-SSH: Reload Window'"
echo ""

# 7. 快速修复命令
echo "⚡ 快速修复命令"
echo "==============="
echo "# 重启React开发服务器"
echo "cd Demo_echo_frontend/frontend && npm start"
echo ""
echo "# 强制杀死所有React进程并重启"
echo "pkill -f react-scripts; cd Demo_echo_frontend/frontend && npm start"
echo ""

echo "🎯 诊断完成！"
echo "如果问题仍然存在，请检查Cursor的端口转发配置。" 