import React, { useState } from 'react';
import { Modal, Button, Steps, Alert, Space, Typography } from 'antd';
import { 
  AudioOutlined, 
  SettingOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import { 
  requestMicrophonePermission, 
  getErrorSolution, 
  isMicrophoneSupported, 
  isSpeechRecognitionSupported,
  ERROR_TYPES 
} from '../utils/microphonePermission';

const { Title, Paragraph, Text } = Typography;

const MicrophonePermissionDialog = ({ 
  visible, 
  onClose, 
  onPermissionGranted 
}) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // 检查基本支持情况
  const micSupported = isMicrophoneSupported();
  const speechSupported = isSpeechRecognitionSupported();

  const steps = [
    {
      title: '检查支持',
      icon: <SettingOutlined />,
      description: '检查浏览器是否支持语音功能'
    },
    {
      title: '请求权限',
      icon: <AudioOutlined />,
      description: '请求麦克风权限'
    },
    {
      title: '权限确认',
      icon: <CheckCircleOutlined />,
      description: '确认权限设置成功'
    }
  ];

  // 请求麦克风权限
  const handleRequestPermission = async () => {
    setLoading(true);
    setErrorInfo(null);
    setCurrentStep(1);

    try {
      const result = await requestMicrophonePermission();
      
      if (result.success) {
        setPermissionStatus('granted');
        setCurrentStep(2);
        setTimeout(() => {
          onPermissionGranted && onPermissionGranted();
          onClose();
        }, 2000);
      } else {
        setPermissionStatus('denied');
        setErrorInfo(result);
        setCurrentStep(1);
      }
    } catch (error) {
      setPermissionStatus('error');
      setErrorInfo({
        errorType: ERROR_TYPES.UNKNOWN,
        message: '权限请求过程中发生错误',
        originalError: error
      });
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  // 渲染支持状态检查
  const renderSupportCheck = () => (
    <div style={{ marginBottom: 16 }}>
      <Title level={4}>📋 功能支持检查</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>麦克风功能:</Text>
          <Text type={micSupported ? 'success' : 'danger'}>
            {micSupported ? '✅ 支持' : '❌ 不支持'}
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text>语音识别:</Text>
          <Text type={speechSupported ? 'success' : 'danger'}>
            {speechSupported ? '✅ 支持' : '❌ 不支持'}
          </Text>
        </div>
      </Space>
    </div>
  );

  // 渲染错误解决方案
  const renderErrorSolution = () => {
    if (!errorInfo) return null;

    const solution = getErrorSolution(errorInfo.errorType);
    
    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          type="warning"
          message={solution.title}
          description={
            <div>
              <Paragraph>{errorInfo.message}</Paragraph>
              <Title level={5}>💡 解决方案:</Title>
              <ol>
                {solution.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          }
          showIcon
        />
      </div>
    );
  };

  // 渲染成功状态
  const renderSuccessMessage = () => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
      <Title level={3} style={{ color: '#52c41a', marginTop: 16 }}>
        权限设置成功！
      </Title>
      <Paragraph>
        麦克风权限已获取，您现在可以使用语音功能了。
      </Paragraph>
    </div>
  );

  // 渲染主要内容
  const renderContent = () => {
    if (!micSupported || !speechSupported) {
      return (
        <div>
          {renderSupportCheck()}
          <Alert
            type="error"
            message="浏览器不支持"
            description="您的浏览器不支持所需的语音功能，请使用Chrome、Firefox、Safari或Edge等现代浏览器。"
            showIcon
          />
        </div>
      );
    }

    if (permissionStatus === 'granted') {
      return renderSuccessMessage();
    }

    return (
      <div>
        {renderSupportCheck()}
        
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((step, index) => (
            <Steps.Step 
              key={index}
              title={step.title} 
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Steps>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={4}>🎤 麦克风权限请求</Title>
          <Paragraph>
            为了使用语音功能，我们需要访问您的麦克风。
            <br />
            请点击下方按钮并在浏览器弹出的对话框中选择"允许"。
          </Paragraph>
        </div>

        {renderErrorSolution()}
      </div>
    );
  };

  // 渲染底部按钮
  const renderFooter = () => {
    if (!micSupported || !speechSupported) {
      return [
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ];
    }

    if (permissionStatus === 'granted') {
      return [
        <Button key="close" type="primary" onClick={onClose}>
          开始使用
        </Button>
      ];
    }

    return [
      <Button key="cancel" onClick={onClose}>
        取消
      </Button>,
      <Button 
        key="request" 
        type="primary" 
        loading={loading}
        onClick={handleRequestPermission}
        icon={<AudioOutlined />}
      >
        请求麦克风权限
      </Button>
    ];
  };

  return (
    <Modal
      title="🎙️ 语音功能设置"
      open={visible}
      onCancel={onClose}
      footer={renderFooter()}
      width={520}
      maskClosable={false}
    >
      {renderContent()}
    </Modal>
  );
};

export default MicrophonePermissionDialog; 