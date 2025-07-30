/**
 * API连接测试工具
 * 用于验证与后端API的连接和认证流程
 */

import apiClient from './apiClient';

// 测试API连接
export const testApiConnection = async () => {
  try {
    console.log('🔍 测试API连接...');
    console.log('API基础URL:', process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site');
    
    // 测试健康检查接口
    const healthResponse = await fetch('https://rqoufedpoguc.sealosgzg.site/health');
    const healthData = await healthResponse.json();
    
    console.log('✅ 健康检查通过:', healthData);
    return { success: true, health: healthData };
  } catch (error) {
    console.error('❌ API连接测试失败:', error);
    return { success: false, error: error.message };
  }
};

// 测试登录流程
export const testLoginFlow = async (username, password) => {
  try {
    console.log('🔐 测试登录流程...');
    console.log('用户名:', username);
    
    const result = await apiClient.login(username, password);
    
    if (result.success) {
      console.log('✅ 登录成功:', {
        user: result.user,
        token: result.token ? '***' + result.token.slice(-10) : 'null'
      });
      return { success: true, data: result };
    } else {
      console.log('❌ 登录失败:', result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 登录测试异常:', error);
    return { success: false, error: error.message };
  }
};

// 测试注册流程
export const testRegisterFlow = async (username, password, email) => {
  try {
    console.log('📝 测试注册流程...');
    console.log('用户名:', username, '邮箱:', email);
    
    const result = await apiClient.register(username, password, email);
    
    if (result.success) {
      console.log('✅ 注册成功:', {
        user: result.user,
        token: result.token ? '***' + result.token.slice(-10) : 'null'
      });
      return { success: true, data: result };
    } else {
      console.log('❌ 注册失败:', result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error('❌ 注册测试异常:', error);
    return { success: false, error: error.message };
  }
};

// 测试用户信息获取
export const testGetUserInfo = async () => {
  try {
    console.log('👤 测试获取用户信息...');
    
    const userInfo = await apiClient.getUserInfo();
    console.log('✅ 用户信息获取成功:', userInfo);
    return { success: true, data: userInfo };
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return { success: false, error: error.message };
  }
};

// 测试工具列表获取
export const testGetTools = async () => {
  try {
    console.log('🛠️ 测试获取工具列表...');
    
    const tools = await apiClient.getTools();
    console.log('✅ 工具列表获取成功:', tools);
    return { success: true, data: tools };
  } catch (error) {
    console.error('❌ 获取工具列表失败:', error);
    return { success: false, error: error.message };
  }
};

// 完整测试流程
export const runFullApiTest = async () => {
  console.log('🚀 开始完整API测试流程...');
  
  // 1. 测试API连接
  const connectionTest = await testApiConnection();
  if (!connectionTest.success) {
    console.error('❌ API连接失败，停止测试');
    return connectionTest;
  }
  
  // 2. 测试普通用户登录
  console.log('\n--- 测试普通用户登录 ---');
  const loginTest = await testLoginFlow('testuser_5090', '8lpcUY2BOt');
  
  if (loginTest.success) {
    // 3. 测试获取用户信息
    console.log('\n--- 测试获取用户信息 ---');
    await testGetUserInfo();
    
    // 4. 测试获取工具列表
    console.log('\n--- 测试获取工具列表 ---');
    await testGetTools();
  }
  
  // 5. 测试开发者用户登录
  console.log('\n--- 测试开发者用户登录 ---');
  const devLoginTest = await testLoginFlow('devuser_5090', 'mryuWTGdMk');
  
  if (devLoginTest.success) {
    // 6. 测试开发者权限
    console.log('\n--- 测试开发者权限 ---');
    try {
      const devTools = await apiClient.getDeveloperServices();
      console.log('✅ 开发者工具列表获取成功:', devTools);
    } catch (error) {
      console.log('❌ 开发者权限测试失败:', error.message);
    }
  }
  
  console.log('\n🎉 API测试流程完成！');
  return { success: true };
};

// 在浏览器控制台中运行测试
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.testLoginFlow = testLoginFlow;
  window.testRegisterFlow = testRegisterFlow;
  window.testGetUserInfo = testGetUserInfo;
  window.testGetTools = testGetTools;
  window.runFullApiTest = runFullApiTest;
  
  console.log('🔧 API测试工具已加载到全局作用域');
  console.log('使用方法:');
  console.log('- testApiConnection() - 测试API连接');
  console.log('- testLoginFlow(username, password) - 测试登录');
  console.log('- testRegisterFlow(username, password, email) - 测试注册');
  console.log('- testGetUserInfo() - 测试获取用户信息');
  console.log('- testGetTools() - 测试获取工具列表');
  console.log('- runFullApiTest() - 运行完整测试流程');
} 