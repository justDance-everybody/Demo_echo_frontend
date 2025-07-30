import React, { useState } from 'react';
import { Button, Card, Input, Space, Divider, Typography, Alert, message } from 'antd';
import { testApiConnection, testLoginFlow, testRegisterFlow, runFullApiTest } from '../services/apiTest';

const { Title, Text } = Typography;

const ApiTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'testuser_5090',
    password: '8lpcUY2BOt',
    email: 'test@example.com'
  });

  const addResult = (title, result) => {
    setTestResults(prev => [...prev, { title, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const result = await testApiConnection();
      addResult('API连接测试', result);
    } catch (error) {
      addResult('API连接测试', { success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      const result = await testLoginFlow(credentials.username, credentials.password);
      addResult('登录测试', result);
    } catch (error) {
      addResult('登录测试', { success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestRegister = async () => {
    setLoading(true);
    try {
      const result = await testRegisterFlow(credentials.username, credentials.password, credentials.email);
      addResult('注册测试', result);
    } catch (error) {
      addResult('注册测试', { success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFullTest = async () => {
    setLoading(true);
    try {
      const result = await runFullApiTest();
      addResult('完整API测试', result);
    } catch (error) {
      addResult('完整API测试', { success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>🔧 API连接测试工具</Title>
      
      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>测试凭据</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="用户名"
            value={credentials.username}
            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
          />
          <Input.Password
            placeholder="密码"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          />
          <Input
            placeholder="邮箱"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          />
        </Space>
      </Card>

      <Card style={{ marginBottom: '20px' }}>
        <Title level={4}>测试操作</Title>
        <Space wrap>
          <Button 
            type="primary" 
            onClick={handleTestConnection}
            loading={loading}
          >
            测试API连接
          </Button>
          <Button 
            type="primary" 
            ghost
            onClick={handleTestLogin}
            loading={loading}
          >
            测试登录
          </Button>
          <Button 
            type="primary" 
            ghost
            onClick={handleTestRegister}
            loading={loading}
          >
            测试注册
          </Button>
          <Button 
            type="default" 
            onClick={handleFullTest}
            loading={loading}
          >
            完整测试
          </Button>
          <Button 
            danger
            onClick={clearResults}
          >
            清除结果
          </Button>
        </Space>
      </Card>

      <Card>
        <Title level={4}>测试结果</Title>
        {testResults.length === 0 ? (
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>暂无测试结果</Text>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {testResults.map((item, index) => (
              <div key={index}>
                <Divider>{item.title} - {item.timestamp}</Divider>
                <Alert
                  message={item.result.success ? '✅ 成功' : '❌ 失败'}
                  description={
                    <pre style={{ 
                      fontSize: '12px', 
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                      color: '#333'
                    }}>
                      {JSON.stringify(item.result, null, 2)}
                    </pre>
                  }
                  type={item.result.success ? 'success' : 'error'}
                  showIcon
                />
              </div>
            ))}
          </Space>
        )}
      </Card>

      <Card style={{ marginTop: '20px' }}>
        <Title level={4}>使用说明</Title>
        <Space direction="vertical">
          <Text>1. 确保后端服务正在运行</Text>
          <Text>2. 检查网络连接</Text>
          <Text>3. 使用提供的测试账号进行测试</Text>
          <Text>4. 查看浏览器控制台获取详细日志</Text>
        </Space>
      </Card>
    </div>
  );
};

export default ApiTestPage; 