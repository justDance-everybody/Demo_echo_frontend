# 🎙️ Echo AI - 全语音AI-Agent平台

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![Status](https://img.shields.io/badge/status-MVP%20Ready-green.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/justDance-everybody/Demo_echo_frontend)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/justDance-everybody/Demo_echo_frontend/blob/main/LICENSE)

## 🌟 项目概述

**Echo AI** 是一个端到端、以语音为核心交互方式的智能代理平台。用户只需一句话即可调度海量"技能"服务，通过实时的语音反馈获得即时、精准的服务体验。

### 🎯 核心特性

- **🎙️ 纯语音交互**：一句话完成复杂任务，无需手动操作
- **🔄 端到端闭环**：录音→STT→意图解析→确认→执行→播报
- **🧩 技能生态**：支持MCP脚本和第三方HTTP API集成
- **👥 多角色支持**：普通用户、开发者、管理员权限体系
- **🌙 主题系统**：深色/浅色模式，支持自定义主题
- **📱 响应式设计**：Mobile-First，完美适配所有设备

## 🚀 快速开始

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- 现代浏览器（支持Web Speech API）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/justDance-everybody/Demo_echo_frontend.git
cd Demo_echo_frontend

# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm start

# 打开浏览器访问 http://localhost:3000
```

### 测试运行

```bash
# 单元测试
npm test

# E2E测试
npm run cypress:open

# 完整测试套件
npm run test:ci
```

## 🏗️ 技术架构

### 前端技术栈

- **React 18** - 现代化前端框架
- **Vite** - 快速构建工具
- **Ant Design Mobile** - 移动端UI组件库
- **Web Speech API** - 浏览器原生语音功能
- **Cypress** - E2E测试框架
- **MSW** - Mock服务工具

### 后端技术栈

- **Python + FastAPI** - 高性能API框架
- **MySQL + SQLAlchemy** - 数据库ORM
- **OpenAI SDK** - AI语言模型集成
- **JWT** - 身份认证

### 核心组件

```
src/
├── components/
│   ├── VoiceInterface.js      # 🎙️ 统一语音交互组件
│   ├── ProgressBar/          # 📊 进度指示器
│   └── ErrorBoundary.js      # 🛡️ 错误边界
├── contexts/
│   ├── AuthContext.js        # 🔐 认证状态管理
│   ├── ThemeContext.js       # 🎨 主题状态管理
│   └── SessionContext.js     # 💬 会话状态管理
├── pages/
│   ├── MainPage/             # 🏠 主页面
│   ├── DeveloperConsole/     # 👨‍💻 开发者控制台
│   └── SettingsPage/         # ⚙️ 设置页面
└── services/
    └── apiClient.js          # 📡 API调用封装
```

## 🎯 功能特性

### 核心功能

#### 🎙️ 语音交互系统
- **录音功能**：一键录音，支持超时检测
- **语音识别**：实时STT转换，高准确率
- **意图理解**：基于大模型的智能意图解析
- **语音合成**：自然的TTS播报反馈

#### 🔐 用户认证体系
- **多角色支持**：普通用户、开发者、管理员
- **权限控制**：基于角色的页面和功能访问控制
- **安全认证**：JWT令牌 + 本地存储管理

#### 🛠️ 开发者生态
- **API上传**：支持Dify、Coze等平台API集成
- **服务管理**：启用/禁用、编辑、删除自定义服务
- **接口测试**：内置API调用测试工具

### 用户体验

#### 🎨 主题系统
- **深色/浅色模式**：一键切换，用户偏好记忆
- **自定义主题**：颜色、圆角、间距等全面定制
- **实时预览**：样式调整即时生效

#### 📱 响应式设计
- **Mobile-First**：移动端优先设计理念
- **断点适配**：完美适配各种屏幕尺寸
- **触摸友好**：优化触摸交互体验

## 📊 测试覆盖

### 测试统计（Dev0.1版本）

| 测试模块 | 测试用例数 | 通过率 | 状态 |
|---------|----------|--------|------|
| 用户认证与访问控制 | 5 | 100% | ✅ |
| 核心语音交互流程 | 4 | 100% | ✅ |
| 基础界面与用户反馈 | 3 | 100% | ✅ |
| 技能服务与开发者功能 | 2 | 100% | ✅ |
| **总计** | **14** | **100%** | **✅** |

### 测试类型

- **单元测试**：Jest + React Testing Library
- **E2E测试**：Cypress + 自定义命令
- **Mock测试**：MSW + Web Speech API Mock
- **无障碍测试**：jest-axe + 自动化检查

## 🔧 开发指南

### 项目结构

```
Demo_echo_frontend/
├── frontend/                 # 前端应用
│   ├── src/                 # 源代码
│   ├── public/              # 静态资源
│   ├── cypress/             # E2E测试
│   └── package.json         # 依赖配置
├── backend/                 # 后端服务（规划中）
├── docs/                    # 项目文档
│   ├── 产品开发需求文档PRD.md
│   ├── 前端开发文档.md
│   └── 测试用例及验收标准.md
└── README.md               # 项目说明
```

### 开发流程

1. **功能开发**
   ```bash
   # 创建功能分支
   git checkout -b feature/your-feature
   
   # 开发功能
   npm start
   
   # 运行测试
   npm test
   ```

2. **提交代码**
   ```bash
   # 运行完整测试
   npm run test:ci
   
   # 提交更改
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/your-feature
   ```

3. **创建PR**
   - 在GitHub上创建Pull Request
   - 等待代码审查和测试通过
   - 合并到主分支

### 测试策略

```bash
# 运行单元测试
npm test

# 运行E2E测试
npm run cypress:open

# 生成测试报告
npm run test:ci
```

## 🎯 路线图

### Dev0.1 ✅ 已完成
- 核心语音交互功能
- 用户认证体系
- 测试基础设施
- 开发者控制台
- 主题系统

### Dev0.2 🔄 开发中
- 语音识别准确率优化
- 注册成功指示器
- 性能基准建立
- API响应时间优化

### Dev0.3 📋 规划中
- 多轮对话支持
- 上下文记忆功能
- 移动端体验优化
- 第三方集成扩展

### 长期目标 🚀
- 大规模并发支持
- 多语言国际化
- 企业级部署方案
- AI模型自定义

## 📚 文档资源

- [📖 产品需求文档](./docs/产品开发需求文档PRD.md)
- [🔧 前端开发文档](./docs/前端开发文档.md)
- [✅ 测试用例及验收标准](./docs/测试用例及验收标准.md)
- [🐛 Bug修复报告](./docs/Bug修复完成报告.md)

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- [GitHub仓库](https://github.com/justDance-everybody/Demo_echo_frontend)
- [在线演示](https://demo.echo-ai.com)
- [问题反馈](https://github.com/justDance-everybody/Demo_echo_frontend/issues)
- [开发者文档](https://docs.echo-ai.com)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和设计师！

---

**开发团队**: Echo AI 开发团队  
**最后更新**: 2025-01-06  
**版本**: Dev0.1  

---

*Echo AI - 让语音成为你的超能力！* 🎙️✨
