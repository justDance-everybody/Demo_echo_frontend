/**
 * API客户端封装
 * 根据API规范文档建议进行优化
 */
class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';
    this.apiPrefix = process.env.REACT_APP_API_PREFIX || '/api/v1';
  }

  // 设置认证令牌
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // 获取认证令牌
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // 通用API调用方法
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    const url = `${this.baseURL}${this.apiPrefix}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        throw new Error('Unauthorized - Token expired or invalid');
      }
      
      if (response.status === 403) {
        throw new Error('Forbidden - Insufficient permissions');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }

  // 登录
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      return {
        success: true,
        token: data.access_token,
        token_type: data.token_type,
        user: data.user
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
        message: error.message || '登录失败，请稍后再试'
      };
    }
  }

  // 注册
  async register(username, password, email) {
    try {
      const response = await fetch(`${this.baseURL}${this.apiPrefix}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      const data = await response.json();
      return {
        success: true,
        token: data.access_token,
        token_type: data.token_type,
        user: data.user
    };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      success: false,
      message: error.message || '注册失败，请稍后再试'
    };
  }
  }

// 获取用户信息
  async getUserInfo() {
    return this.request('/auth/me');
  }

  // 意图解析
  async interpret(query, session_id = null, user_id = 13) {
    return this.request('/intent/interpret', {
      method: 'POST',
      body: JSON.stringify({ query, session_id, user_id })
    });
  }

  // 确认执行
  async confirmExecution(session_id, user_input) {
    return this.request('/intent/confirm', {
      method: 'POST',
      body: JSON.stringify({ session_id, user_input })
    });
  }

  // 工具执行
  async execute(session_id, tool_id, params, user_id = 13) {
    return this.request('/execute', {
      method: 'POST',
      body: JSON.stringify({ 
        session_id, 
        user_id, 
        tool_id, 
        params 
      })
    });
  }

  // 获取工具列表
  async getTools() {
    return this.request('/tools');
  }

  // 获取单个工具详情
  async getToolById(toolId) {
    return this.request(`/tools/${toolId}`);
  }

  // 开发者工具管理
  async getDeveloperTools() {
    return this.request('/dev/tools');
  }

  async createTool(toolData) {
    return this.request('/dev/tools', {
      method: 'POST',
      body: JSON.stringify(toolData)
    });
  }

  async updateTool(tool_id, toolData) {
    return this.request(`/dev/tools/${tool_id}`, {
      method: 'PUT',
      body: JSON.stringify(toolData)
    });
  }

  async deleteTool(tool_id) {
    return this.request(`/dev/tools/${tool_id}`, {
      method: 'DELETE'
    });
  }

  async testTool(tool_id, testParams) {
    return this.request(`/dev/tools/${tool_id}/test`, {
      method: 'POST',
      body: JSON.stringify(testParams)
    });
  }

  // 应用管理
  async getDeveloperApps() {
    return this.request('/dev/apps');
  }

  async createApp(appData) {
    return this.request('/dev/apps', {
      method: 'POST',
      body: JSON.stringify(appData)
    });
  }

  async updateApp(app_id, appData) {
    return this.request(`/dev/apps/${app_id}`, {
      method: 'PUT',
      body: JSON.stringify(appData)
    });
  }

  async publishApp(app_id) {
    return this.request(`/dev/apps/${app_id}/publish`, {
      method: 'POST'
    });
  }

  // MCP服务器状态监控
  async getMCPStatus() {
    return this.request('/mcp/status');
  }

  // 兼容性方法
  async sendChatMessage(query, userId, sessionId, context) {
    return this.interpret(query, sessionId, userId);
  }

  async sendVoiceRequest(voiceText, userId, sessionId, context) {
    return this.interpret(voiceText, sessionId, userId);
  }

  async getServices() {
    const tools = await this.getTools();
    return {
      status: 'success',
      data: {
        services: tools.map(tool => ({
          id: tool.tool_id,
          name: tool.name,
          description: tool.description,
          type: tool.type,
          icon: 'api',
          color: 'var(--color-primary-light)'
        }))
      }
    };
  }

  async executeMcpService(serverId, query, options = {}) {
    const interpretation = await this.interpret(query, options.sessionId, options.userId);
    
    if (interpretation.intent) {
      return this.execute(
        interpretation.sessionId,
        interpretation.intent,
        interpretation.params || {},
        options.userId
      );
    } else {
      throw new Error('无法解析用户意图');
    }
  }
}

// 创建并导出API客户端实例
const apiClient = new ApiClient();

export default apiClient;