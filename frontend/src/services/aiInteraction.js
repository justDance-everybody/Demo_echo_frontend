/**
 * AI交互流程服务
 * 根据API规范文档实现完整的AI交互流程
 */
import apiClient from './apiClient';

/**
 * 完整的AI交互示例（语音转文字由前端处理）
 * @param {string} userText - 用户输入的文本
 * @param {string} sessionId - 会话ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 交互结果
 */
export async function handleUserTextInput(userText, sessionId = null, userId = 13) {
  try {
    console.log('开始AI交互流程:', { userText, sessionId, userId });
    
    // 1. 解析用户意图
    const interpretation = await apiClient.interpret(userText, sessionId, userId);
    console.log('意图解析结果:', interpretation);
    
    // 2. 根据响应类型处理
    if (interpretation.type === 'tool_call' && interpretation.tool_calls) {
      // 需要工具调用，显示确认文本给用户
      const confirmText = interpretation.confirm_text || interpretation.content;
      console.log('AI理解:', confirmText);
      
      // 3. 获取用户确认输入
      const userConfirmation = await getUserConfirmation(); // 如"是"、"确认"、"y"等
      
      // 4. 发送确认请求
      const confirmResult = await apiClient.confirmExecution(
        interpretation.session_id,
        userConfirmation
      );
      
      // 5. 返回执行结果
      return {
        success: confirmResult.success,
        content: confirmResult.content,
        speechText: confirmResult.content, // 用于语音播报
        sessionId: interpretation.session_id
      };
    } else {
      // 直接响应，无需工具调用
      return {
        success: true,
        content: interpretation.content,
        speechText: interpretation.content,
        sessionId: interpretation.session_id
      };
    }
  } catch (error) {
    console.error('AI交互失败:', error);
    return {
      success: false,
      error: error.message,
      speechText: '抱歉，处理您的请求时出现了问题'
    };
  }
}

/**
 * 获取用户确认输入的辅助函数
 * @returns {Promise<string>} 用户确认输入
 */
async function getUserConfirmation() {
  // 这里可以是弹窗、输入框或语音识别的结果
  // 返回用户的自然语言确认输入
  return new Promise((resolve) => {
    const userInput = prompt('请确认是否执行？(输入"是"或"y"确认)');
    resolve(userInput || '是');
  });
}

/**
 * 安全的API调用包装器
 * @param {Function} apiFunction - API函数
 * @returns {Promise<any>} API调用结果
 */
export async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.message.includes('401')) {
      // Token过期，重新登录
      localStorage.removeItem('accessToken');
      window.location.href = '/auth';
      throw new Error('身份验证失败，请重新登录');
    } else if (error.message.includes('403')) {
      // 权限不足，提示用户
      throw new Error('权限不足，请联系管理员或使用具有相应权限的账号');
    } else {
      console.error('API调用失败:', error);
      throw error;
    }
  }
}

/**
 * 角色权限检查
 * @param {string} userRole - 用户角色
 * @param {string} requiredRole - 所需角色
 * @returns {boolean} 是否有权限
 */
export function checkPermission(userRole, requiredRole) {
  const roleHierarchy = { 'user': 1, 'developer': 2, 'admin': 3 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * 开发环境下启用详细日志
 */
if (process.env.NODE_ENV === 'development') {
  // 拦截所有fetch请求进行日志记录
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('API Request:', args);
    return originalFetch.apply(this, args)
      .then(response => {
        console.log('API Response:', response);
        return response;
      });
  };
}

/**
 * 语音交互流程
 * @param {string} voiceText - 语音识别的文本
 * @param {number} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} 交互结果
 */
export async function handleVoiceInteraction(voiceText, userId = 13, sessionId = null) {
  try {
    console.log('语音交互开始:', { voiceText, userId, sessionId });
    
    // 调用文本交互处理
    const result = await handleUserTextInput(voiceText, sessionId, userId);
    
    // 返回结果，包含语音播报文本
    return {
      ...result,
      originalText: voiceText
    };
  } catch (error) {
    console.error('语音交互失败:', error);
    return {
      success: false,
      error: error.message,
      speechText: '语音处理失败，请重试'
    };
  }
}

/**
 * 工具执行流程
 * @param {string} toolId - 工具ID
 * @param {Object} params - 工具参数
 * @param {string} sessionId - 会话ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 执行结果
 */
export async function executeTool(toolId, params, sessionId = null, userId = 13) {
  try {
    console.log('工具执行开始:', { toolId, params, sessionId, userId });
    
    const result = await apiClient.execute(sessionId, toolId, params, userId);
    
    return {
      success: true,
      result: result.result,
      speechText: result.tts, // 适合语音播报的文本
      sessionId: result.session_id
    };
  } catch (error) {
    console.error('工具执行失败:', error);
    return {
      success: false,
      error: error.message,
      speechText: '工具执行失败，请重试'
    };
  }
}

/**
 * 获取可用工具列表
 * @returns {Promise<Array>} 工具列表
 */
export async function getAvailableTools() {
  try {
    const tools = await apiClient.getTools();
    return {
      success: true,
      tools: tools
    };
  } catch (error) {
    console.error('获取工具列表失败:', error);
    return {
      success: false,
      error: error.message,
      tools: []
    };
  }
}

/**
 * 开发者工具管理
 */
export const developerTools = {
  // 获取开发者工具列表
  async getTools() {
    return safeApiCall(() => apiClient.getDeveloperTools());
  },

  // 创建新工具
  async createTool(toolData) {
    return safeApiCall(() => apiClient.createTool(toolData));
  },

  // 更新工具
  async updateTool(toolId, toolData) {
    return safeApiCall(() => apiClient.updateTool(toolId, toolData));
  },

  // 删除工具
  async deleteTool(toolId) {
    return safeApiCall(() => apiClient.deleteTool(toolId));
  },

  // 测试工具
  async testTool(toolId, testParams) {
    return safeApiCall(() => apiClient.testTool(toolId, testParams));
  }
};

/**
 * 应用管理
 */
export const appManagement = {
  // 获取应用列表
  async getApps() {
    return safeApiCall(() => apiClient.getDeveloperApps());
  },

  // 创建应用
  async createApp(appData) {
    return safeApiCall(() => apiClient.createApp(appData));
  },

  // 更新应用
  async updateApp(appId, appData) {
    return safeApiCall(() => apiClient.updateApp(appId, appData));
  },

  // 发布应用
  async publishApp(appId) {
    return safeApiCall(() => apiClient.publishApp(appId));
  }
};

/**
 * MCP服务管理
 */
export const mcpServices = {
  // 获取MCP状态
  async getStatus() {
    return safeApiCall(() => apiClient.getMCPStatus());
  }
};

export default {
  handleUserTextInput,
  handleVoiceInteraction,
  executeTool,
  getAvailableTools,
  safeApiCall,
  checkPermission,
  developerTools,
  appManagement,
  mcpServices
}; 