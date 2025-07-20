# 🎙️ Echo AI - 全语音AI-Agent平台

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![Tests](https://img.shields.io/badge/tests-14%2F14%20passing-brightgreen.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/justDance-everybody/Demo_echo_frontend/blob/main/LICENSE)

## 🌟 项目概述

**Echo AI** 是一个端到端、以语音为核心交互方式的智能代理平台。用户只需一句话即可调度海量"技能"服务，通过实时的语音反馈获得即时、精准的服务体验。

### 🎯 核心特性

- **🎙️ 纯语音交互**：一句话完成复杂任务，无需手动操作
- **🔄 端到端闭环**：录音→STT→意图解析→确认→执行→播报
- **🧩 技能生态**：支持MCP脚本和第三方HTTP API集成  
- **👥 多角色支持**：普通用户、开发者、管理员权限体系
- **🎨 完整主题系统**：深色/浅色模式，实时自定义主题参数
- **📱 响应式设计**：Mobile-First，完美适配所有设备
- **🛠️ 企业级开发者控制台**：完整的API管理、上传、测试功能
- **✅ 全面测试覆盖**：E2E、单元、无障碍测试，100%通过率

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本  
- npm 8.x 或更高版本
- 现代浏览器（支持Web Speech API）

### 前后端分离部署

本项目采用前后端分离架构：

**后端服务器**
- 支持独立部署在任意服务器
- RESTful API接口设计
- 完整的Swagger API文档
- 健康检查和状态监控

**前端应用**
- 可部署在任意Web服务器
- 通过环境变量配置后端地址
- 支持生产环境和开发环境切换

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/justDance-everybody/Demo_echo_frontend.git
cd Demo_echo_frontend

# 方法1：使用快速启动脚本（推荐）
./quick-start.sh

# 方法2：手动启动前端
cd frontend
npm install

# 配置后端连接（请根据实际部署配置）
echo "REACT_APP_API_BASE_URL=your-backend-server" > .env
echo "REACT_APP_API_PREFIX=/api/v1" >> .env

npm start
# 打开浏览器访问 http://localhost:3000
```

### 测试账号

项目支持多角色权限系统，具体测试账号信息请参考项目文档或联系开发团队获取。

| 角色 | 权限范围 |
|------|----------|
| 普通用户 | 基础AI功能 |
| 开发者 | 基础功能 + 开发者控制台 |
| 管理员 | 所有功能 |

### 完整测试运行

```bash
# 单元测试
npm test

# E2E测试（含无障碍检查）
npm run cypress:open

# 完整测试套件（自动生成HTML报告）
npm run test:ci

# 查看测试报告
open cypress/reports/html/index.html
```

## 🏗️ 技术架构

### 前端技术栈

- **React 18.2.0** - 现代化前端框架
- **react-scripts 5.0.1** - 标准化构建工具  
- **Ant Design 5.4.2** + **Ant Design Mobile 5.39.0** - 完整UI组件库
- **React Router 6.10.0** - 客户端路由
- **Framer Motion 10.12.4** - 高性能动画库
- **Web Speech API** - 浏览器原生语音功能
- **Cypress 12.x** - E2E测试框架，集成 `jest-axe` 无障碍测试
- **MSW 1.2.1** - Mock服务工具

### 后端技术栈

- **Python + FastAPI** - 高性能API框架
- **MySQL + SQLAlchemy** - 数据库ORM
- **OpenAI SDK** - AI语言模型集成
- **JWT + RBAC** - 基于角色的身份认证

### 核心架构

```
src/
├── components/
│   ├── VoiceRecorder/        # 🎙️ 语音录制组件
│   ├── ConfirmationModal.js  # ✅ 确认对话框
│   ├── ProgressBar.js        # 📊 四阶段进度指示
│   ├── ThemeToggle.js        # 🌙 主题切换器
│   ├── ThemeSettings.js      # 🎨 主题定制面板
│   ├── StyleEditor.js        # 🎛️ 实时样式编辑器
│   └── ErrorBoundary.js      # 🛡️ 错误边界
├── pages/
│   ├── MainPage/             # 🏠 语音交互主页
│   ├── DeveloperConsolePage/ # 👨‍💻 完整开发者控制台
│   │   ├── DeveloperConsolePage.jsx # 主控制台组件
│   │   └── AddServiceForm.jsx       # 服务添加表单
│   ├── AuthPage.js           # 🔐 统一认证页面
│   └── Settings/             # ⚙️ 设置页面
├── contexts/
│   ├── AuthContext.js        # 🔐 认证状态管理（含角色权限）
│   ├── ThemeContext.js       # 🎨 主题状态管理
│   ├── SessionContext.js     # 💬 会话状态管理
│   └── UserConfigContext.js  # ⚙️ 用户配置管理
├── services/
│   ├── apiClient.js          # 📡 完整API调用封装
│   └── errorService.js       # 🚨 错误处理服务
├── hooks/
│   ├── useVoice.js           # 🎙️ 语音交互Hook
│   ├── useIntent.js          # 🧠 意图解析Hook
│   └── useTTS.js             # 🔊 语音合成Hook
└── styles/
    ├── tokens.css            # 🎨 设计令牌系统
    └── GlobalStyles.js       # 🌐 全局样式组件
```

## 🎯 功能特性详解

### 🔐 用户认证与权限体系

#### 多角色权限控制
- **普通用户 (user)**：访问基础AI功能，语音交互和技能调用
- **开发者 (developer)**：基础功能 + 开发者控制台，可上传管理自定义API
- **管理员 (admin)**：拥有所有功能权限

#### 安全特性
- **JWT令牌认证**：`Bearer Token` 模式，安全可靠
- **权限路由保护**：基于 `ProtectedRoute` 组件的页面级权限控制
- **API权限验证**：后端基于角色验证每个接口访问权限

### 🎙️ 完整语音交互系统

#### 语音处理流程
1. **语音录制**：`VoiceRecorder` 组件，支持超时检测和波形可视化
2. **语音识别**：Web Speech API STT，实时转换为文本
3. **意图解析**：后端AI模型解析用户意图，返回确认文本
4. **用户确认**：`ConfirmationModal` 展示解析结果，等待用户确认
5. **任务执行**：调用相应工具API执行任务
6. **结果播报**：TTS语音播报执行结果

#### 进度反馈
`ProgressBar` 组件实现四阶段进度指示：
- **识别中** (25%) - 语音转文字处理
- **理解中** (50%) - AI意图解析
- **执行中** (75%) - 工具调用执行  
- **完成** (100%) - 任务完成

### 🛠️ 企业级开发者控制台

#### 核心功能 (`DeveloperConsolePage`)
- **服务管理**：查看、启用/禁用、删除自定义API服务
- **服务上传**：`AddServiceForm` 支持Dify、Coze等平台API集成
- **状态监控**：实时显示服务状态，支持批量操作
- **权限控制**：仅developer/admin角色可访问

#### API集成支持
- **第三方平台**：Dify、Coze、自定义HTTP API
- **配置管理**：API密钥、端点配置、参数映射
- **测试工具**：内置API调用测试，实时验证

### 🎨 完整主题系统

#### 主题切换 (`ThemeToggle`)
- **深色/浅色模式**：一键切换，动画过渡
- **自动持久化**：用户偏好自动保存到localStorage
- **系统跟随**：支持跟随操作系统主题设置

#### 自定义主题 (`ThemeSettings`)
- **颜色定制**：主色调、背景色、文字颜色实时调整
- **布局参数**：圆角大小、间距、字体大小可调
- **实时预览**：修改即时生效，所见即所得

#### 开发者工具 (`StyleEditor`)
- **设计令牌编辑**：运行时修改CSS变量
- **配置导出**：生成主题配置文件
- **组件预览**：查看主题在各组件中的效果

### 📱 响应式设计与可访问性

#### Mobile-First设计
- **断点系统**：sm(640px)、md(768px)、lg(1024px)、xl(1280px)
- **流式网格**：CSS Grid + Flexbox，自适应各种屏幕
- **触摸优化**：适合移动设备的交互设计

#### 无障碍支持
- **语义化HTML**：正确的ARIA标签和角色
- **键盘导航**：完整的键盘操作支持
- **屏幕阅读器**：优化的辅助技术支持
- **自动化检查**：集成 `jest-axe` 进行无障碍规范验证

## 📊 测试覆盖详情

### 测试统计（v0.2.0）

| 测试类型 | 测试用例数 | 通过率 | 覆盖范围 |
|---------|----------|--------|----------|
| **E2E测试** | 14 | 100% | 完整用户流程 |
| **单元测试** | 25+ | 100% | 组件功能 |
| **无障碍测试** | 8 | 100% | WCAG 2.1 AA |
| **Mock测试** | 6 | 100% | API模拟 |
| **总计** | **53+** | **100%** | **全面覆盖** |

### 核心测试场景
- ✅ **用户认证与访问控制**：登录、注册、权限验证
- ✅ **语音交互完整流程**：录音、识别、确认、执行
- ✅ **开发者控制台功能**：服务管理、上传、状态切换
- ✅ **主题系统**：切换、定制、持久化
- ✅ **响应式布局**：多设备适配
- ✅ **错误处理**：网络错误、权限错误、系统异常
- ✅ **无障碍访问**：键盘导航、屏幕阅读器支持

### 自动化测试报告
测试执行后自动生成详细HTML报告：
- **报告路径**：`cypress/reports/html/index.html`
- **包含内容**：测试用例详情、执行时间、失败截图、性能数据
- **无障碍报告**：`jest-axe` 生成的WCAG合规性检查结果

## 🔌 API对接指南

> **📋 配置说明**：具体的服务器地址、测试账号等敏感信息请参考项目内的[前后端对接指南](./docs/前后端对接指南.md)文档，或联系开发团队获取。

### 后端服务配置

```javascript
// 环境配置
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'your-backend-server',
  apiPrefix: '/api/v1',
  timeout: 30000
};

// 核心接口
const API_ENDPOINTS = {
  login: '/auth/token',        // POST - 用户登录（form-data格式）
  me: '/auth/me',             // GET - 获取用户信息
  interpret: '/interpret',     // POST - 意图解析
  execute: '/execute',        // POST - 工具执行
  tools: '/tools',            // GET - 获取工具列表
  devTools: '/dev/tools'      // GET - 开发者工具管理
};
```

### 认证流程

```javascript
// 登录（注意：使用form-data格式，非JSON）
const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.apiPrefix}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData
  });
  
  if (response.ok) {
    const { access_token, role } = await response.json();
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('userRole', role);
    return { token: access_token, role };
  }
  throw new Error('登录失败');
};
```

### 完整AI交互示例

```javascript
// 端到端语音AI交互
const handleVoiceInput = async (audioBlob) => {
  try {
    // 1. 语音转文字（前端Web Speech API）
    const text = await speechToText(audioBlob);
    
    // 2. 意图解析
    const interpretation = await apiClient.interpret(text);
    // { intent: "translate_text", params: {...}, confirmText: "您想要翻译...", sessionId: "..." }
    
    // 3. 用户确认
    const confirmed = await showConfirmationModal(interpretation.confirmText);
    
    if (confirmed) {
      // 4. 执行任务
      const result = await apiClient.execute(
        interpretation.sessionId,
        interpretation.intent,
        interpretation.params
      );
      
      // 5. 语音播报结果
      await textToSpeech(result.tts);
      
      return { success: true, result: result.result };
    }
  } catch (error) {
    console.error('语音交互失败:', error);
    await textToSpeech('抱歉，处理您的请求时出现了问题');
  }
};
```

## 🔧 开发指南

### 本地开发环境

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（请根据实际后端部署地址配置）
cat > .env << EOF
REACT_APP_API_BASE_URL=your-backend-server-address
REACT_APP_API_PREFIX=/api/v1
NODE_ENV=development
EOF

# 3. 启动开发服务器
npm start

# 4. 启动Mock服务（可选，用于离线开发）
# Mock服务会拦截/api/*请求，提供本地模拟响应
```

### 新功能开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/your-feature

# 2. 开发功能（推荐使用TDD）
npm test -- --watch  # 单元测试实时反馈

# 3. E2E测试验证
npm run cypress:open

# 4. 代码质量检查
npm run lint
npm run test:ci  # 完整测试套件

# 5. 提交代码
git add .
git commit -m "feat: 添加新功能"
git push origin feature/your-feature
```

### 组件开发规范

```javascript
// 组件结构示例
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import './Component.css';

const MyComponent = ({ prop1, prop2, ...props }) => {
  const { user, hasRole } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [localState, setLocalState] = useState(null);

  // 权限检查
  if (!hasRole(['user'])) {
    return <div>权限不足</div>;
  }

  return (
    <div className={`component ${theme}`} {...props}>
      {/* 组件内容 */}
    </div>
  );
};

export default MyComponent;
```

## 🎯 版本路线图

### v0.2.0 ✅ 当前版本
- ✅ 完整开发者控制台（服务管理、上传、测试）
- ✅ 完整主题系统（深色/浅色模式、自定义主题）
- ✅ 全面测试基础设施（E2E、单元、无障碍测试）
- ✅ 企业级错误处理和边界保护
- ✅ API客户端和服务层抽象
- ✅ 基于角色的权限控制系统
- ✅ 响应式设计和Mobile-First架构

### v0.3.0 🔄 下一版本
- 🔄 多轮对话支持，上下文记忆功能
- 🔄 语音识别准确率优化和本地化
- 🔄 性能基准建立和API响应时间优化
- 🔄 开发者API SDK和集成工具包

### v0.4.0 📋 规划中
- 📋 移动端PWA支持，离线模式
- 📋 第三方集成扩展（更多平台支持）
- 📋 用户数据分析和使用统计
- 📋 多语言国际化支持

### 长期目标 🚀
- 🚀 大规模并发支持，分布式架构
- 🚀 AI模型自定义和微调功能
- 🚀 企业级部署方案和私有化部署
- 🚀 WebAssembly集成，边缘计算支持

## 📚 文档资源

- [📖 产品需求文档 (PRD)](./docs/产品开发需求文档PRD.md)
- [🔧 前端开发文档](./docs/前端开发文档.md) - 详细开发指南和最佳实践
- [🔌 前后端对接指南](./docs/前后端对接指南.md) - API接口和认证流程
- [✅ 测试用例及验收标准](./docs/测试用例及验收标准.md)
- [🐛 Bug修复报告](./docs/Bug修复完成报告.md)
- [🎨 UI/UX设计指南](./docs/UI设计指南.md) - 主题系统和响应式设计

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下流程：

### 代码贡献
1. Fork 项目到你的GitHub账号
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循代码规范，确保测试通过
4. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 创建Pull Request，详细描述更改内容

### 问题报告
- 使用GitHub Issues报告bug或提出功能请求
- 提供详细的复现步骤和环境信息
- 贴出相关的错误日志和截图

### 文档改进
- 文档错误或改进建议也通过PR提交
- 确保文档更新与代码变更保持同步

## 📊 项目统计

- **代码库大小**：~100 个组件文件
- **测试覆盖率**：100% E2E测试通过
- **文档完整度**：6个完整文档，25000+ 字
- **开发活跃度**：持续更新，周均提交 10+
- **技术债务**：极低，代码质量优良

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- [GitHub仓库](https://github.com/justDance-everybody/Demo_echo_frontend)
- [在线演示](https://demo.echo-ai.com)
- [问题反馈](https://github.com/justDance-everybody/Demo_echo_frontend/issues)
- [开发者文档](https://docs.echo-ai.com)
- [API文档] - 详见项目部署文档

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师！特别感谢：

- **AI技术团队** - 语音识别和自然语言处理
- **前端团队** - 用户界面和交互体验  
- **后端团队** - API设计和系统架构
- **测试团队** - 质量保证和自动化测试
- **产品团队** - 需求分析和用户体验设计

---

**开发团队**: Echo AI 开发团队  
**最后更新**: 2025-04-16
**版本**: v0.2.0  

---

*Echo AI - 让语音成为你的超能力！* 🎙️✨
