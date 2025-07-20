#!/bin/bash

echo "📊 Echo AI 服务器状态监控"
echo "========================"
echo "按 Ctrl+C 停止监控"
echo ""

# 监控间隔（秒）
INTERVAL=5

while true; do
    # 清屏（可选）
    # clear
    
    echo "🕒 $(date '+%Y-%m-%d %H:%M:%S')"
    echo "================================"
    
    # 检查React进程
    echo "📋 React进程状态："
    REACT_PROCESSES=$(ps aux | grep react-scripts | grep -v grep | head -3)
    if [ -z "$REACT_PROCESSES" ]; then
        echo "   ❌ 未运行"
    else
        echo "   ✅ 正在运行 (PID: $(echo "$REACT_PROCESSES" | awk '{print $2}' | tail -1))"
        # 显示内存使用情况
        MEMORY=$(echo "$REACT_PROCESSES" | tail -1 | awk '{print $6}')
        echo "   💾 内存使用: ${MEMORY}KB"
    fi
    
    # 检查端口监听
    echo "🔌 端口3000状态："
    if netstat -tlnp 2>/dev/null | grep :3000 > /dev/null; then
        echo "   ✅ 正在监听"
    else
        echo "   ❌ 未监听"
    fi
    
    # 检查HTTP访问
    echo "🌐 HTTP服务状态："
    if curl -s -I http://localhost:3000 > /dev/null 2>&1; then
        RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000)
        echo "   ✅ 可访问 (响应时间: ${RESPONSE_TIME}s)"
    else
        echo "   ❌ 不可访问"
    fi
    
    # 系统负载
    echo "⚡ 系统负载："
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    echo "   📈 当前负载: $LOAD"
    
    echo ""
    echo "================================"
    echo ""
    
    sleep $INTERVAL
done 