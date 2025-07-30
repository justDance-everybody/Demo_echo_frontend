# 前端API集成指南

## 📋 概述

本文档说明前端如何与Echo AI后端API进行集成，特别是登录注册流程的对接。

## 🚀 快速开始

### 1. 环境配置

前端已配置为使用公网后端服务：
- **API基础URL**: `https://rqoufedpoguc.sealosgzg.site`
- **API前缀**: `/api/v1`

### 2. 测试账号

后端已预置测试账号，可直接使用：

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 普通用户 | `testuser_5090` | `8lpcUY2BOt` | 基础AI功能 |
| 开发者 | `devuser_5090` | `mryuWTGdMk` | 基础功能 + 开发者控制台 |
| 管理员 | `adminuser_5090` | `SAKMRtxCjT` | 所有功能 |

## 🔧 API测试工具

### 浏览器控制台测试

启动前端应用后，在浏览器控制台中可以使用以下测试函数：

```javascript
// 测试API连接
testApiConnection()

// 测试登录
testLoginFlow('testuser_5090', '8lpcUY2BOt')

// 测试注册
testRegisterFlow('newuser', 'password123', 'newuser@example.com')

// 运行完整测试流程
runFullApiTest()
```

### 可视化测试页面

访问 `http://localhost:3000/api-test` 可以使用可视化界面进行API测试。

## 🔐 认证流程

### 登录流程

1. **发送登录请求**
```javascript
const formData = new URLSearchParams();
formData.append('username', 'testuser_5090');
formData.append('password', '8lpcUY2BOt');

const response = await fetch('https://rqoufedpoguc.sealosgzg.site/api/v1/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData
});
```

2. **处理登录响应**
```javascript
const data = await response.json();
// 响应格式:
// {
//   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
//   "token_type": "bearer",
//   "user": {
//     "id": 1,
//     "username": "testuser_5090",
//     "role": "user"
//   }
// }
```

3. **存储认证信息**
```javascript
localStorage.setItem('token', data.access_token);
localStorage.setItem('userRole', data.user.role);
```

### 注册流程

1. **发送注册请求**
```javascript
const response = await fetch('https://rqoufedpoguc.sealosgzg.site/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'newuser',
    password: 'password123',
    email: 'newuser@example.com'
  })
});
```

2. **处理注册响应**
```javascript
const data = await response.json();
// 成功响应格式:
// {
//   "user": {
//     "id": 2,
//     "username": "newuser",
//     "role": "user"
//   },
//   "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
//   "token_type": "bearer"
// }
```

## 🔒 权限控制

### 用户角色

- **user**: 普通用户，可访问基础AI功能
- **developer**: 开发者，可访问开发者控制台
- **admin**: 管理员，拥有所有权限

### 接口权限

| 接口 | 认证要求 | 角色要求 |
|------|----------|----------|
| `POST /api/v1/auth/token` | ❌ 无需认证 | - |
| `POST /api/v1/auth/register` | ❌ 无需认证 | - |
| `GET /api/v1/auth/me` | ✅ 需要Token | user+ |
| `POST /api/v1/intent/interpret` | ✅ 需要Token | user+ |
| `GET /api/v1/tools` | ✅ 需要Token | user+ |
| `GET /api/v1/dev/tools` | ✅ 需要Token | developer+ |

## 🛠️ 开发调试

### 1. 检查API连接

```bash
# 测试健康检查接口
curl https://rqoufedpoguc.sealosgzg.site/health

# 期望响应:
# {"status":"ok","timestamp":1752568483.0425155}
```

### 2. 测试登录接口

```bash
# 使用测试账号登录
curl -X POST "https://rqoufedpoguc.sealosgzg.site/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser_5090&password=8lpcUY2BOt"
```

### 3. 测试认证接口

```bash
# 使用获取的token测试认证接口
curl -X GET "https://rqoufedpoguc.sealosgzg.site/api/v1/tools" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📱 前端集成

### 1. API客户端使用

```javascript
import apiClient from './services/apiClient';

// 登录
const loginResult = await apiClient.login('testuser_5090', '8lpcUY2BOt');
if (loginResult.success) {
  console.log('登录成功:', loginResult.user);
}

// 注册
const registerResult = await apiClient.register('newuser', 'password123', 'newuser@example.com');
if (registerResult.success) {
  console.log('注册成功:', registerResult.user);
}

// 获取工具列表
const tools = await apiClient.getTools();
console.log('可用工具:', tools);
```

### 2. AuthContext使用

```javascript
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

const { login, register, isAuthenticated, user, role } = useContext(AuthContext);

// 登录
const handleLogin = async () => {
  const success = await login('testuser_5090', '8lpcUY2BOt');
  if (success) {
    console.log('登录成功');
  }
};

// 检查权限
if (role === 'developer') {
  // 显示开发者功能
}
```

## 🚨 常见问题

### 1. 登录失败

**问题**: 401 Unauthorized
**解决方案**:
- 确认使用 `application/x-www-form-urlencoded` 格式
- 检查用户名和密码是否正确
- 确认后端服务正在运行

### 2. 权限不足

**问题**: 403 Forbidden
**解决方案**:
- 检查用户角色是否满足接口要求
- 使用具有相应权限的账号登录

### 3. 网络连接问题

**问题**: 无法连接到服务器
**解决方案**:
- 检查网络连接
- 确认API地址是否正确
- 检查防火墙设置

## 📋 测试清单

- [ ] API连接测试通过
- [ ] 登录功能正常
- [ ] 注册功能正常
- [ ] Token存储正确
- [ ] 权限控制生效
- [ ] 错误处理完善
- [ ] 用户信息获取正常
- [ ] 工具列表获取正常

## 🔗 相关文档

- [前后端对接与API规范](../docs/前后端对接与API规范.md)
- [前端测试用例与验收标准](../docs/前端测试用例与验收标准.md)
- [后端API文档](https://rqoufedpoguc.sealosgzg.site/docs)

---

> 文档更新时间: 2025-01-20  
> 适用版本: v0.1.0  
> 维护团队: 前端开发团队 