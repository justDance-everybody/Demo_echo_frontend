# API使用示例

## 📋 概述

本文档提供API客户端和AI交互服务的使用示例，帮助开发者快速上手。

## 🔧 API客户端使用

### 基础配置

```javascript
import apiClient from './services/apiClient';

// API客户端已自动配置
// 基础URL: https://rqoufedpoguc.sealosgzg.site
// API前缀: /api/v1
```

### 认证相关

```javascript
// 用户登录
const loginResult = await apiClient.login('testuser_5090', '8lpcUY2BOt');
if (loginResult.success) {
  console.log('登录成功:', loginResult.user);
  // Token已自动存储
}

// 用户注册
const registerResult = await apiClient.register('newuser', 'password123', 'newuser@example.com');
if (registerResult.success) {
  console.log('注册成功:', registerResult.user);
}

// 获取用户信息
const userInfo = await apiClient.getUserInfo();
console.log('用户信息:', userInfo);
```

### AI交互流程

```javascript
import { handleUserTextInput, handleVoiceInteraction } from './services/aiInteraction';

// 文本交互
const textResult = await handleUserTextInput('查询今天天气', 'session-123', 13);
if (textResult.success) {
  console.log('AI回复:', textResult.content);
  console.log('语音播报文本:', textResult.speechText);
}

// 语音交互
const voiceResult = await handleVoiceInteraction('帮我翻译这句话', 13, 'session-123');
if (voiceResult.success) {
  console.log('语音处理结果:', voiceResult.content);
}
```

### 工具管理

```javascript
// 获取工具列表
const tools = await apiClient.getTools();
console.log('可用工具:', tools);

// 获取单个工具详情
const toolDetail = await apiClient.getToolById('translate_text');
console.log('工具详情:', toolDetail);

// 执行工具
const executeResult = await apiClient.execute('session-123', 'translate_text', {
  text: 'Hello World',
  target_language: 'zh'
}, 13);
console.log('执行结果:', executeResult);
```

### 开发者功能

```javascript
// 获取开发者工具列表
const devTools = await apiClient.getDeveloperTools();
console.log('开发者工具:', devTools);

// 创建新工具
const newTool = await apiClient.createTool({
  name: '自定义翻译工具',
  description: '基于GPT的翻译服务',
  endpoint: 'https://api.example.com/translate'
});

// 测试工具
const testResult = await apiClient.testTool(toolId, {
  text: '测试文本',
  target_language: 'en'
});
```

## 🎯 完整使用示例

### 1. 用户登录流程

```javascript
import React, { useState } from 'react';
import apiClient from './services/apiClient';

function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await apiClient.login(username, password);
      if (result.success) {
        console.log('登录成功:', result.user);
        // 跳转到主页
        window.location.href = '/';
      } else {
        alert('登录失败: ' + result.message);
      }
    } catch (error) {
      alert('登录异常: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="用户名"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </div>
  );
}
```

### 2. AI对话组件

```javascript
import React, { useState } from 'react';
import { handleUserTextInput } from './services/aiInteraction';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await handleUserTextInput(input);
      const aiMessage = {
        type: 'ai',
        content: result.content,
        success: result.success
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: '处理失败: ' + error.message
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
}
```

### 3. 工具执行组件

```javascript
import React, { useState, useEffect } from 'react';
import apiClient from './services/apiClient';

function ToolsComponent() {
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const toolsData = await apiClient.getTools();
      setTools(toolsData);
    } catch (error) {
      console.error('加载工具失败:', error);
    }
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    try {
      const result = await apiClient.execute(
        'session-' + Date.now(),
        selectedTool.tool_id,
        params,
        13
      );
      setResult(result);
    } catch (error) {
      console.error('执行工具失败:', error);
    }
  };

  return (
    <div>
      <h3>可用工具</h3>
      <select onChange={(e) => setSelectedTool(tools.find(t => t.tool_id === e.target.value))}>
        <option value="">选择工具</option>
        {tools.map(tool => (
          <option key={tool.tool_id} value={tool.tool_id}>
            {tool.name}
          </option>
        ))}
      </select>

      {selectedTool && (
        <div>
          <h4>{selectedTool.name}</h4>
          <p>{selectedTool.description}</p>
          <button onClick={executeTool}>执行</button>
        </div>
      )}

      {result && (
        <div>
          <h4>执行结果</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### 4. 开发者控制台

```javascript
import React, { useState, useEffect } from 'react';
import { developerTools } from './services/aiInteraction';

function DeveloperConsole() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDeveloperTools();
  }, []);

  const loadDeveloperTools = async () => {
    setLoading(true);
    try {
      const result = await developerTools.getTools();
      setTools(result);
    } catch (error) {
      console.error('加载开发者工具失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTool = async (toolData) => {
    try {
      const result = await developerTools.createTool(toolData);
      console.log('工具创建成功:', result);
      loadDeveloperTools(); // 重新加载列表
    } catch (error) {
      console.error('创建工具失败:', error);
    }
  };

  return (
    <div>
      <h2>开发者控制台</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div>
          <h3>我的工具</h3>
          {tools.map(tool => (
            <div key={tool.id}>
              <h4>{tool.name}</h4>
              <p>{tool.description}</p>
              <button onClick={() => developerTools.deleteTool(tool.id)}>
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔒 权限控制

```javascript
import { checkPermission } from './services/aiInteraction';

function ProtectedComponent({ userRole, requiredRole }) {
  if (!checkPermission(userRole, requiredRole)) {
    return <div>权限不足，无法访问此功能</div>;
  }

  return <div>受保护的内容</div>;
}

// 使用示例
<ProtectedComponent userRole="user" requiredRole="developer" />
```

## 🚨 错误处理

```javascript
import { safeApiCall } from './services/aiInteraction';

async function safeOperation() {
  try {
    const result = await safeApiCall(() => apiClient.getDeveloperTools());
    console.log('操作成功:', result);
  } catch (error) {
    if (error.message.includes('401')) {
      // 自动跳转到登录页
      console.log('需要重新登录');
    } else if (error.message.includes('403')) {
      console.log('权限不足');
    } else {
      console.log('其他错误:', error.message);
    }
  }
}
```

## 📊 测试工具

```javascript
// 在浏览器控制台中运行
import { runFullApiTest } from './services/apiTest';

// 运行完整测试
runFullApiTest();

// 单独测试
testApiConnection();
testLoginFlow('testuser_5090', '8lpcUY2BOt');
testGetTools();
```

## 🔗 相关文档

- [API规范文档](../docs/前后端对接与API规范.md)
- [API集成指南](./API_INTEGRATION_GUIDE.md)
- [测试用例文档](../docs/前端测试用例与验收标准.md)

---

> 文档更新时间: 2025-01-20  
> 适用版本: v0.1.0  
> 维护团队: 前端开发团队 