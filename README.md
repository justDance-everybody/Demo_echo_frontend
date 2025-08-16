# Echo 智能语音 AI-Agent 后端服务

## 项目简介
Echo是一个基于Python(FastAPI)的智能语音AI-Agent后端服务平台，支持语音全流程交互、意图识别、工具调用等功能。系统可集成MCP服务和各类HTTP API，实现丰富的技能服务。

## 主要特性
- **语音全流程交互**：支持语音输入、意图识别、语音合成输出
- **多种工具集成**：
  - MCP服务集成（支持区块链、Web3等复杂场景）
  - HTTP工具支持（Dify平台、Coze平台、通用HTTP API）
- **意图识别与确认**：使用大语言模型(LLM)解析用户意图并生成确认提示
- **安全认证**：JWT身份验证与权限管理
- **多轮对话管理**：会话状态跟踪与上下文保持
- **日志与监控**：详细操作记录，便于审计与排查

## 技术栈
- **后端**：Python 3.9+, FastAPI, SQLAlchemy, Alembic, Pydantic
- **数据库**：MySQL
- **AI服务**：兼容OpenAI API的LLM服务
- **认证**：JWT
- **部署**：Uvicorn, PM2
- **MCP集成**：支持多种MCP服务器（区块链、地图、语音等）

## 项目结构
```
project/
├── backend/               # 后端服务
│   ├── alembic/           # 数据库迁移
│   ├── app/               # 应用主目录
│   │   ├── clients/       # 第三方客户端封装
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据库模型
│   │   ├── routers/       # API路由
│   │   ├── schemas/       # 数据验证模型
│   │   ├── services/      # 业务逻辑
│   │   ├── utils/         # 工具函数
│   │   ├── config.py      # 配置管理
│   │   └── main.py        # 应用入口
│   ├── logs/              # 日志文件
│   ├── scripts/           # 辅助脚本
│   ├── tests/             # 测试代码
│   ├── .env.example       # 环境变量示例 ⚠️ 必须配置
│   └── requirements.txt   # 依赖包列表
├── MCP_Client/            # MCP客户端（Python）
│   ├── config/            # MCP配置
│   │   └── mcp_servers.json.example  # MCP服务器配置示例 ⚠️ 必须配置
│   └── src/               # MCP客户端源码
├── MCP_server/            # MCP服务器实现
│   ├── minimax-mcp-js/    # MiniMax语音API服务器
│   └── web3-mcp/          # Web3区块链服务器
├── MCPTEST/               # MCP测试工具
├── docs/                  # 项目文档
│   ├── 产品开发需求文档PRD.md
│   ├── 后端开发文档.md
│   ├── 前后端对接与API规范.md
│   └── 待开发功能点集合.md
├── outputs/               # 输出文件目录
└── README.md              # 项目说明
```

## 安装与配置

⚠️ **重要提醒：本项目需要正确配置多个环境变量文件才能正常运行！**

### 依赖环境
- Python 3.9+
- MySQL 5.7+
- (推荐)虚拟环境管理工具：venv, uv等

### 后端安装与配置
1. 克隆仓库并进入后端目录
```bash
git clone <repo_url>
cd project/backend
```

2. 创建并激活虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. **⚠️ 配置后端环境变量（必须）**
```bash
cp .env.example .env
# 编辑.env文件，设置数据库连接、API密钥等
vim .env
```

**关键配置项（必须设置）：**
- `DATABASE_URL` - MySQL数据库连接字符串
- `JWT_SECRET` - JWT密钥（生产环境必须设置）
- `LLM_API_KEY` - 大语言模型API密钥
- `LLM_MODEL` - 使用的模型名称
- `LLM_API_BASE` - LLM API基础URL

详细配置说明请参考：[后端开发文档](docs/后端开发文档.md)

6. 数据库迁移
```bash
cd backend
alembic upgrade head
```



### **⚠️ MCP_Client 配置（必须）**
1. 进入MCP_Client目录
```bash
cd project/MCP_Client
```

2. 创建并激活虚拟环境
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# 或
.venv\Scripts\activate  # Windows
```

3. 安装依赖
```bash
pip install openai python-dotenv
pip install git+https://github.com/modelcontextprotocol/python-sdk.git
```

4. **⚠️ 配置MCP服务器（必须）**
```bash
cd config
cp mcp_servers.json.example mcp_servers.json
# 编辑mcp_servers.json文件，配置各种MCP服务器
vim mcp_servers.json
```

**关键配置项（必须设置）：**
- `MINIMAX_API_KEY` - MiniMax语音API密钥
- `AMAP_MAPS_API_KEY` - 高德地图API密钥
- `SOLANA_RPC_URL` - Solana区块链RPC地址
- 各MCP服务器的启用状态和参数配置

## 启动服务

### 启动后端服务
```bash
cd backend
# 开发模式（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 3000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 3000
```

### 使用PM2启动（生产环境推荐）
```bash
# 安装PM2 (需要Node.js)
npm install -g pm2

# 使用项目根目录的启动脚本
cd project
pm2 start ecosystem.config.js
# 或使用start-pm2.sh脚本
./start-pm2.sh
```

### 启动MCP_Client（可选）
```bash
cd MCP_Client
# 启动并连接到指定MCP服务器
python src/mcp/client/main.py <path_to_server_script>
```

## 核心API接口

系统提供完整的RESTful API接口，支持意图解析、工具执行、用户认证等功能。

- **API基础路径**: `http://localhost:3000/api/v1`
- **API文档**: `http://localhost:3000/docs` (Swagger UI)
- **认证方式**: JWT Bearer Token

详细的API接口说明请参考：[API规范文档](docs/前后端对接与API规范.md)

## 支持的工具类型

系统支持两种主要类型的工具：

### 1. MCP工具
MCP (Model Context Protocol) 工具是基于自定义协议的脚本工具，能够执行区块链相关操作和其他复杂任务。

- 要求配置 `server_name` 字段，指向对应的MCP服务器
- 支持完整的参数传递和结果解析
- 集成了多种MCP服务器，如Playwright、MiniMax API、地图API和Web3区块链API

### 2. HTTP工具
HTTP工具允许系统调用外部HTTP API来执行操作。目前支持以下平台类型：

#### a. Dify
- 调用Dify平台上的AI应用
- 支持conversation_id管理
- 响应通过LLM总结，生成适合语音播报的内容

#### b. Coze
- 调用Coze平台上的机器人
- 要求在配置中提供bot_id
- 响应同样经过LLM总结处理

#### c. 通用HTTP
- 支持配置和调用任意HTTP API
- 支持GET, POST, PUT, PATCH, DELETE等多种HTTP方法
- 灵活配置头信息、认证方式（Bearer、ApiKey、Basic）
- 支持响应结果路径提取（使用result_path字段）
- 支持URL参数格式化和有效载荷配置
- 对响应结果进行LLM总结处理，生成简洁易懂的语音反馈

## 统一API架构

本项目采用了统一的API架构，提高了代码可维护性和一致性：

1. **统一API入口**
   - 所有API请求通过统一的路由处理
   - 标准化的请求/响应格式
   - 版本化API设计 (如 `/api/v1/...`)

2. **标准响应格式**
   ```json
   {
     "status": "success|error|waiting",
     "data": { /* 响应数据 */ },
     "message": "操作结果描述",
     "timestamp": "2023-04-19T12:34:56.789Z"
   }
   ```

## 开发指南

详细的开发指南请参考：
- [后端开发文档](docs/后端开发文档.md) - 后端开发者专用
- [API规范文档](docs/前后端对接与API规范.md) - API接口详细说明

## 测试与调试

### 运行测试
```bash
cd backend
pytest
```

### API调试
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## 贡献指南
- Fork本仓库
- 创建特性分支 (`git checkout -b feature/amazing-feature`)
- 提交更改 (`git commit -m 'Add some amazing feature'`)
- 推送分支 (`git push origin feature/amazing-feature`)
- 创建Pull Request

## 更新日志

### 2025-05-14
- 实现通用HTTP API工具支持，包括多种HTTP方法、认证方式和结果处理
- 完善Dify和Coze平台工具的LLM结果总结功能
- 添加单元测试覆盖工具执行服务

### 2025-04-30
- 实现意图识别和工具执行的核心功能
- 完成MCP客户端集成，支持多种操作
- 添加基础认证系统

## 文档导航

- [API规范文档](docs/前后端对接与API规范.md) - API接口详细说明和调用示例
- [后端开发文档](docs/后端开发文档.md) - 后端架构、服务和开发指南
- [产品需求文档](docs/产品开发需求文档PRD.md) - 产品功能需求和规划
- [待开发功能点](docs/待开发功能点集合.md) - 功能开发计划

---

> 文档更新时间：2025-05-14