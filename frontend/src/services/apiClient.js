import axios from 'axios';

// 根据环境变量配置API基础URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true';

console.log(`🔧 API配置: 基础URL=${API_BASE_URL}, 使用Mock=${USE_MOCKS}`);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('localStorage access blocked in request interceptor:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response; // Return full response for handling in calling function
  },
  (error) => {
    console.error("API Error Interceptor:", error); // Log the raw error
    let errorMsg = '请求失败，发生未知错误。'; // Default error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      console.error(`API Error: Status ${status}`, data);
      if (status === 401) {
        try {
        localStorage.removeItem('token');
        } catch (e) {
          console.warn('localStorage access blocked in response interceptor:', e);
        }
        errorMsg = '身份验证失败，请重新登录';
        // Consider redirecting: window.location.href = '/login'; 
      } else if (data?.detail) { // FastAPI validation errors often in 'detail'
        if (Array.isArray(data.detail)) { // Handle list of validation errors
          errorMsg = data.detail.map(err => `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`).join('; ');
        } else {
          errorMsg = data.detail; // Handle single string detail
        }
      } else {
        errorMsg = data?.error?.msg || data?.error?.message || `请求失败，状态码: ${status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
      errorMsg = '无法连接到服务器，请检查网络连接或后端服务是否运行。';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error: Request setup error', error.message);
      errorMsg = `请求设置错误: ${error.message}`;
    }
    // Instead of rejecting with just message, reject with an object 
    // containing message and maybe original error for more context
    return Promise.reject({ message: errorMsg, originalError: error });
  }
);

// 认证相关方法

// 设置认证令牌
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// 用户登录
const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });

    // 确保返回成功状态和处理用户角色
    return {
      success: true,
      token: response.data.token,
      user: {
        id: response.data.user.id,
        username: response.data.user.username,
        role: response.data.user.role || 'user' // 确保获取角色信息，默认为user
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      message: error.message || '登录失败，请稍后再试'
    };
  }
};

// 用户注册
const register = async (username, password, email) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      password,
      email
    });

    // 确保返回成功状态和处理用户角色，注册成功后也应该包含token
    return {
      success: true,
      token: response.data.token,
      user: {
        id: response.data.user.id,
        username: response.data.user.username,
        role: response.data.user.role || 'user' // 确保获取角色信息，默认为user
      }
    };
  } catch (error) {
    console.error('注册失败:', error);
    return {
      success: false,
      message: error.message || '注册失败，请稍后再试'
    };
  }
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

// 刷新令牌
const refreshToken = async () => {
  try {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  } catch (error) {
    console.error('刷新令牌失败:', error);
    throw error;
  }
};

// 原有的API方法

const interpret = async (transcript, sessionId, userId) => {
  try {
    console.log(`发送interpret请求，携带sessionId: ${sessionId}`);
    const response = await api.post('/api/interpret', {
      query: transcript,
      sessionId: sessionId,
      userId: userId,
    });
    console.log(`收到interpret响应:`, response.data);

    // 检查响应中是否返回了sessionId，并记录
    if (response.data && response.data.sessionId) {
      console.log(`响应中包含sessionId: ${response.data.sessionId}`);
    } else {
      console.warn(`⚠️ 警告: 响应中未找到sessionId! 响应数据:`, response.data);
    }

    return response.data; // Extract data from successful response
  } catch (error) {
    console.error('API call to interpret failed in function:', error);
    // Re-throw the processed error object from the interceptor
    throw error;
  }
};

const execute = async (toolId, params, sessionId, userId) => {
  try {
    // 参数验证
    if (!toolId) {
      throw new Error('工具ID不能为空');
    }
    if (!params || typeof params !== 'object') {
      throw new Error('参数必须是一个对象');
    }

    // 确保userId是字符串类型
    const userIdStr = userId ? String(userId) : null;

    console.log(`发送execute请求，携带sessionId: ${sessionId}`);

    // 确保后端请求参数严格符合后端ExecuteRequest模型
    const requestData = {
      tool_id: toolId,
      params: params,
      sessionId: sessionId, // 使用sessionId作为会话ID字段
    };

    // 只有在有userId值的情况下才添加此字段，并使用user_id字段名
    if (userIdStr) {
      requestData.user_id = userIdStr;
    }

    console.log("准备发送execute请求数据:", requestData);

    const response = await api.post('/api/v1/execute', requestData);

    console.log("Execute API Response:", response);

    // 检查响应中是否返回了sessionId，并记录
    if (response.data && response.data.sessionId) {
      console.log(`Execute响应中包含sessionId: ${response.data.sessionId}`);
    } else {
      console.warn(`⚠️ 警告: Execute响应中未找到sessionId! 响应数据:`, response.data);
    }

    return response.data;
  } catch (error) {
    console.error('API call to execute failed in function:', error);
    // Re-throw the processed error object from the interceptor
    throw error;
  }
};

const getItems = async (page = 1, pageSize = 10) => {
  try {
    console.log(`获取首页列表... 页码: ${page}, 每页数量: ${pageSize}`);
    const response = await api.get('/api/services', {
      params: {
        page,
        page_size: pageSize
      }
    });
    console.log("首页列表响应:", response.data);

    // 返回分页数据结构
    return {
      items: response.data.items || [],
      pagination: {
        current_page: response.data.current_page || page,
        total_pages: response.data.total_pages || 1,
        total_items: response.data.total_items || response.data.items?.length || 0,
        page_size: response.data.page_size || pageSize,
        has_next: response.data.has_next || false,
        has_prev: response.data.has_prev || false
      }
    };
  } catch (error) {
    console.error('获取首页列表失败:', error);
    throw error;
  }
};

// 获取单个工具（服务）详情
const getToolById = async (toolId) => {
  try {
    console.log(`获取工具ID: ${toolId} 的详情`);
    const response = await api.get(`/v1/api/tools/${toolId}`);
    console.log("工具详情响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`获取工具ID: ${toolId} 的详情失败:`, error);
    throw error;
  }
};

// 开发者API接口

// 获取开发者服务列表
const getDeveloperServices = async () => {
  try {
    console.log("获取开发者服务列表...");
    const response = await api.get('/api/dev/tools');
    console.log("开发者服务列表响应:", response.data);
    return response.data.services;
  } catch (error) {
    console.error('获取开发者服务列表失败:', error);
    throw error;
  }
};

// 创建新服务
const createDeveloperService = async (serviceData) => {
  try {
    console.log("创建新服务...", serviceData);
    const response = await api.post('/api/dev/tools', serviceData);
    console.log("创建服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('创建服务失败:', error);
    throw error;
  }
};

// 获取单个开发者服务详情
const getDeveloperServiceById = async (serviceId) => {
  try {
    console.log(`获取开发者服务ID: ${serviceId} 的详情`);
    const response = await api.get(`/api/dev/tools/${serviceId}`);
    console.log("开发者服务详情响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`获取开发者服务ID: ${serviceId} 的详情失败:`, error);
    throw error;
  }
};

// 更新服务
const updateDeveloperService = async (serviceId, updateData) => {
  try {
    console.log(`更新开发者服务ID: ${serviceId}`, updateData);
    const response = await api.put(`/api/dev/tools/${serviceId}`, updateData);
    console.log("更新服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`更新开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 删除服务
const deleteDeveloperService = async (serviceId) => {
  try {
    console.log(`删除开发者服务ID: ${serviceId}`);
    const response = await api.delete(`/api/dev/tools/${serviceId}`);
    console.log("删除服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`删除开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 上传API包
const uploadApiPackage = async (formData) => {
  try {
    console.log("上传API包...");
    const response = await api.post('/api/dev/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("上传API包响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('上传API包失败:', error);
    throw error;
  }
};

// 获取开发者应用列表
const getDeveloperApplications = async () => {
  try {
    console.log("获取开发者应用列表...");
    const response = await api.get('/api/dev/apps');
    console.log("开发者应用列表响应:", response.data);
    return response.data.applications;
  } catch (error) {
    console.error('获取开发者应用列表失败:', error);
    throw error;
  }
};

// 创建新应用
const createDeveloperApplication = async (applicationData) => {
  try {
    console.log("创建新应用...", applicationData);
    const response = await api.post('/api/dev/apps', applicationData);
    console.log("创建应用响应:", response.data);
    return response.data;
  } catch (error) {
    console.error('创建应用失败:', error);
    throw error;
  }
};

// 测试已保存的API服务 (原 testApiService)
const testSavedApiService = async (serviceId, testData) => {
  try {
    console.log(`测试已保存的开发者服务ID: ${serviceId}`, testData);
    const response = await api.post(`/api/dev/tools/${serviceId}/test`, testData);
    console.log("测试服务响应:", response.data);
    return response.data;
  } catch (error) {
    console.error(`测试已保存的开发者服务ID: ${serviceId} 失败:`, error);
    throw error;
  }
};

// 新增: 测试未保存的API服务配置
const testUnsavedDeveloperTool = async (toolConfiguration) => {
  // toolConfiguration should include all form fields + the testInput value
  // Example: { serviceName: 'Test', platformType: 'dify', ..., testInput: 'hello' }
  try {
    console.log("测试未保存的服务配置:", toolConfiguration);
    // This endpoint /api/dev/tools/test is NEW and needs to be implemented in the backend
    // and mocked in MSW. It receives the full tool config and test input.
    const response = await api.post('/api/dev/tools/test', toolConfiguration);
    console.log("测试未保存的服务响应:", response.data);
    return response.data; // Expected: { success: boolean, raw_response?: any, error?: string }
  } catch (error) {
    console.error('测试未保存的服务配置失败:', error);
    throw error; // Let the interceptor handle formatting the error
  }
};

// Generic methods for direct use by components if they import the default export
const apiClientInstance = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
  patch: (url, data, config) => api.patch(url, data, config), // Added patch for completeness

  // You can also choose to expose specific, named functions through this default export if preferred by components
  setAuthToken,
  login,
  register,
  getUserInfo,
  refreshToken,
  interpret,
  execute,
  getItems,
  getToolById,
  // If there are specific developer tool functions that components might use via `apiClient.someFunc()`,
  // they could be added here too. For now, DeveloperConsolePage uses the generic get, put, delete.
  // 开发者API接口
  getDeveloperServices,
  createDeveloperService,
  getDeveloperServiceById,
  updateDeveloperService,
  deleteDeveloperService,
  uploadApiPackage,
  getDeveloperApplications,
  createDeveloperApplication,
  testSavedApiService,          // Renamed original testApiService
  testUnsavedDeveloperTool,     // Added new method
};

// API配置信息
export const apiConfig = {
  baseURL: API_BASE_URL,
  useMocks: USE_MOCKS,
  timeout: 15000,
  
  // 获取当前配置
  getConfig: () => ({
    baseURL: API_BASE_URL,
    useMocks: USE_MOCKS,
    environment: process.env.NODE_ENV
  }),
  
  // 检查是否连接到真实后端
  isRealBackend: () => !USE_MOCKS,
  
  // 获取状态描述
  getStatusDescription: () => USE_MOCKS ? 
    '🎭 当前使用Mock数据 (假数据模式)' : 
    `🌐 连接真实后端: ${API_BASE_URL}`
};

export default apiClientInstance; 