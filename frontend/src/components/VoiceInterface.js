import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { Card, Button, Progress, Alert, Space } from 'antd';
import { 
  AudioOutlined, 
  AudioMutedOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ReloadOutlined,
  SoundOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import useVoice from '../hooks/useVoice';
import useTTS from '../hooks/useTTS';
import useIntent from '../hooks/useIntent';
import apiClient from '../services/apiClient';
import { v4 as uuidv4 } from 'uuid';

// 简化的状态机 - 只有4个核心状态
const STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing', // 包含listening, interpreting, executing
  CONFIRMING: 'confirming', // 等待用户确认
  ERROR: 'error'
};

// 样式组件
const VoiceContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const StatusCard = styled(Card)`
  margin-bottom: 16px;
  border-radius: 12px;
  background: ${props => props.theme.surface};
  border: 2px solid ${props => 
    props.active ? props.theme.primary : 'transparent'
  };
`;

const VoiceButton = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: none;
  background: ${props => props.isActive ? props.theme.primary : props.theme.secondary};
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.listening {
    background: ${props => props.theme.primary};
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(104, 211, 145, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(104, 211, 145, 0); }
    100% { box-shadow: 0 0 0 0 rgba(104, 211, 145, 0); }
  }
`;

const StatusText = styled.div`
  text-align: center;
  margin: 16px 0;
  font-size: 16px;
  color: ${props => props.theme.text};
`;

const TranscriptText = styled.div`
  background: ${props => props.theme.background};
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  color: ${props => props.theme.text};
  min-height: 60px;
  border: 1px solid ${props => props.theme.border};
`;

/**
 * 统一的语音接口组件
 * 集成所有语音交互功能：录音、识别、确认、执行、播报
 */
const VoiceInterface = ({ 
  onResult,
  onError,
  mode = 'full', // 'full' | 'simple' | 'dialog'
  autoStart = false,
  showProgress = true,
  className,
  testMode = false // 新增测试模式
}) => {
  const { theme } = useTheme();
  
  // 状态管理 - 简化为4个核心状态
  const [currentState, setCurrentState] = useState(STATES.IDLE);
  const [sessionId] = useState(() => uuidv4());
  const [userInput, setUserInput] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [processingStep, setProcessingStep] = useState(''); // 处理步骤提示
  const [testListening, setTestListening] = useState(false); // 测试模式下的listening状态
  
  // Hooks
  const { 
    isListening, 
    transcript, 
    error: voiceError, 
    startListening, 
    stopListening,
    reset: resetVoice
  } = useVoice();
  
  const { speak, cancel: cancelTTS, isSpeaking } = useTTS();
  const { classifyIntent } = useIntent();
  
  // Refs
  const processingRef = useRef(false);
  const confirmationTimeoutRef = useRef(null);
  
  // 获取当前状态的进度和文本
  const getStateInfo = () => {
    const effectiveListening = testMode ? testListening : isListening;
    
    switch (currentState) {
      case STATES.IDLE:
        return { progress: 0, text: '准备就绪，点击开始语音对话' };
      case STATES.PROCESSING:
        if (effectiveListening) return { progress: 25, text: '正在聆听您的指令...' };
        if (processingStep === 'interpreting') return { progress: 50, text: '正在理解您的需求...' };
        if (processingStep === 'executing') return { progress: 75, text: '正在执行操作...' };
        return { progress: 30, text: '正在处理中...' };
      case STATES.CONFIRMING:
        return { progress: 60, text: '请确认是否执行此操作' };
      case STATES.ERROR:
        return { progress: 0, text: '出现错误，请重试' };
      default:
        return { progress: 0, text: '' };
    }
  };
  
  // 开始语音交互
  const startVoiceInteraction = useCallback(async () => {
    if (processingRef.current) return;
    
    try {
      // 重置状态
      setError(null);
      setUserInput('');
      setConfirmText('');
      setResultData(null);
      setProcessingStep('');
      resetVoice();
      
      // 设置为处理状态
      setCurrentState(STATES.PROCESSING);
      
      if (testMode) {
        // 测试模式：直接模拟语音识别成功
        console.log('[VoiceInterface] 测试模式启动，设置listening状态');
        setTestListening(true);
      } else {
        // 正常模式：启动真实的语音识别
        await startListening();
      }
    } catch (err) {
      console.error('启动语音交互失败:', err);
      setError('启动语音识别失败，请重试');
      setCurrentState(STATES.ERROR);
    }
  }, [startListening, resetVoice, testMode]);
  
  // 处理语音识别结果
  useEffect(() => {
    const effectiveListening = testMode ? testListening : isListening;
    const effectiveTranscript = testMode ? userInput : transcript;
    
    if (!effectiveListening && effectiveTranscript && effectiveTranscript.trim() && currentState === STATES.PROCESSING) {
      if (!testMode) {
        setUserInput(effectiveTranscript);
      }
      processUserInput(effectiveTranscript);
    }
  }, [isListening, testListening, transcript, userInput, currentState, testMode]);
  
  // 处理用户输入
  const processUserInput = useCallback(async (text) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    try {
      setProcessingStep('interpreting');
      
      // 调用意图解析API
      console.log('正在解析用户意图:', text);
      const response = await apiClient.interpret(text, sessionId, 1);
      
      // 处理解析结果
      if (response.type === 'confirm' && response.confirmText) {
        // 需要确认的操作
        setConfirmText(response.confirmText);
        setActionData({
          action: response.action,
          params: response.params,
          toolId: response.tool_id || response.action
        });
        
        // 切换到确认状态
        setCurrentState(STATES.CONFIRMING);
        
        // 播放确认文本
        await speakConfirmation(response.confirmText);
      } else if (response.content) {
        // 直接响应，不需要确认
        setResultData({ content: response.content });
        await speakResult(response.content);
        setCurrentState(STATES.IDLE);
      } else {
        throw new Error('无法理解您的请求');
      }
    } catch (err) {
      console.error('处理用户输入失败:', err);
      setError(err.message || '处理失败，请重试');
      setCurrentState(STATES.ERROR);
    } finally {
      processingRef.current = false;
    }
  }, [sessionId]);
  
  // 播放确认文本并等待用户确认
  const speakConfirmation = useCallback(async (text) => {
    return new Promise((resolve) => {
      speak(text, 'zh-CN', 1, 1, () => {
        // TTS播放完成后，开始等待用户确认
        startListeningForConfirmation();
        resolve();
      });
    });
  }, [speak]);
  
  // 开始监听用户确认
  const startListeningForConfirmation = useCallback(async () => {
    try {
      resetVoice();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await startListening();
      
      // 设置超时
      confirmationTimeoutRef.current = setTimeout(() => {
        stopListening();
        setError('确认超时，请重试');
        setCurrentState(STATES.ERROR);
      }, 15000);
    } catch (err) {
      console.error('启动确认监听失败:', err);
      setError('启动语音确认失败');
      setCurrentState(STATES.ERROR);
    }
  }, [startListening, stopListening, resetVoice]);
  
  // 处理确认响应
  useEffect(() => {
    const effectiveListening = testMode ? testListening : isListening;
    const effectiveTranscript = testMode ? userInput : transcript;
    
    if (!effectiveListening && effectiveTranscript && currentState === STATES.CONFIRMING) {
      clearTimeout(confirmationTimeoutRef.current);
      
      const intent = classifyIntent(effectiveTranscript, userInput);
      console.log('确认意图分类结果:', intent);
      
      switch (intent) {
        case 'CONFIRM':
          executeAction();
          break;
        case 'CANCEL':
          handleCancel();
          break;
        case 'RETRY':
          handleRetry();
          break;
        default:
          speak('请明确说"确认"、"取消"或"重试"', 'zh-CN', 1, 1, () => {
            if (!testMode) {
              startListeningForConfirmation();
            }
          });
          break;
      }
    }
  }, [isListening, testListening, transcript, userInput, currentState, classifyIntent, testMode]);
  
  // 执行操作
  const executeAction = useCallback(async () => {
    if (!actionData) return;
    
    try {
      setProcessingStep('executing');
      setCurrentState(STATES.PROCESSING);
      
      console.log('正在执行操作:', actionData);
      const result = await apiClient.execute(
        actionData.toolId || actionData.action, 
        actionData.params, 
        sessionId, 
        1
      );
      
      setResultData(result);
      
      // 播放执行结果
      const resultText = formatResultForSpeech(result);
      await speakResult(resultText);
      
      setCurrentState(STATES.IDLE);
      
      if (onResult) {
        onResult(result);
      }
    } catch (err) {
      console.error('执行操作失败:', err);
      setError(err.message || '执行失败，请重试');
      setCurrentState(STATES.ERROR);
    }
  }, [actionData, sessionId, onResult]);
  
  // 播放结果
  const speakResult = useCallback(async (text) => {
    return new Promise((resolve) => {
      speak(text, 'zh-CN', 1, 1, () => {
        resolve();
      });
    });
  }, [speak]);
  
  // 格式化结果用于语音播报
  const formatResultForSpeech = (data) => {
    if (!data) return '操作完成';
    if (typeof data === 'string') return data;
    if (data.tts_message) return data.tts_message;
    if (data.message) return data.message;
    if (data.content) return data.content;
    if (data.result) return data.result;
    return '操作已完成';
  };
  
  // 处理取消
  const handleCancel = () => {
    setCurrentState(STATES.IDLE);
    speak('操作已取消');
    resetSession();
  };
  
  // 处理重试
  const handleRetry = () => {
    if (userInput) {
      processUserInput(userInput);
    } else {
      startVoiceInteraction();
    }
  };
  
  // 重置会话
  const resetSession = () => {
    setCurrentState(STATES.IDLE);
    setError(null);
    setUserInput('');
    setConfirmText('');
    setResultData(null);
    setActionData(null);
    setProcessingStep('');
    cancelTTS();
    stopListening();
    resetVoice();
    clearTimeout(confirmationTimeoutRef.current);
    processingRef.current = false;
  };

  // 测试模式：手动触发语音结果
  const simulateVoiceResult = useCallback((text) => {
    if (!testMode) return;
    
    console.log('[VoiceInterface] 测试模式模拟语音结果:', text);
    setUserInput(text);
    setTestListening(false); // 模拟语音识别结束
    
    // 延时一点让状态更新，然后直接处理结果
    setTimeout(() => {
      if (currentState === STATES.PROCESSING) {
        console.log('[VoiceInterface] 测试模式：处理用户输入', text);
        processUserInput(text);
      } else if (currentState === STATES.CONFIRMING) {
        console.log('[VoiceInterface] 测试模式：处理确认响应', text);
        clearTimeout(confirmationTimeoutRef.current);
        
        const intent = classifyIntent(text, userInput);
        console.log('确认意图分类结果:', intent);
        
        switch (intent) {
          case 'CONFIRM':
            executeAction();
            break;
          case 'CANCEL':
            handleCancel();
            break;
          case 'RETRY':
            handleRetry();
            break;
          default:
            speak('请明确说"确认"、"取消"或"重试"', 'zh-CN', 1, 1);
            break;
        }
      }
    }, 100);
  }, [testMode, currentState, processUserInput, classifyIntent, userInput, executeAction, handleCancel, handleRetry, speak]);
  
  // 处理语音错误
  useEffect(() => {
    if (voiceError) {
      setError(`语音识别错误: ${voiceError}`);
      setCurrentState(STATES.ERROR);
      if (onError) {
        onError(voiceError);
      }
    }
  }, [voiceError, onError]);
  
  // 自动启动
  useEffect(() => {
    if (autoStart && currentState === STATES.IDLE) {
      startVoiceInteraction();
    }
  }, [autoStart, currentState, startVoiceInteraction]);
  
  // 在测试模式下，将方法暴露到window对象
  useEffect(() => {
    if (testMode) {
      window.voiceInterfaceTestHelper = {
        simulateVoiceResult,
        getCurrentState: () => currentState,
        isListening: () => testListening
      };
      console.log('[VoiceInterface] 测试助手已添加到window对象');
    }
    return () => {
      if (testMode && window.voiceInterfaceTestHelper) {
        delete window.voiceInterfaceTestHelper;
      }
    };
  }, [testMode, simulateVoiceResult, currentState, testListening]);
  
  // 清理函数
  useEffect(() => {
    return () => {
      clearTimeout(confirmationTimeoutRef.current);
      cancelTTS();
      stopListening();
    };
  }, [cancelTTS, stopListening]);
  
  const stateInfo = getStateInfo();
  
  return (
    <VoiceContainer className={className} data-testid="voice-interface">
      {/* 进度条 */}
      {showProgress && (
        <StatusCard theme={theme}>
          <Progress 
            percent={stateInfo.progress} 
            status={currentState === STATES.ERROR ? 'exception' : 'active'}
            strokeColor={theme.primary}
          />
          <StatusText theme={theme} data-testid="status-text">{stateInfo.text}</StatusText>
        </StatusCard>
      )}
      
      {/* 错误提示 */}
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 用户输入显示 */}
      {userInput && (
        <StatusCard theme={theme} title="您的指令">
          <TranscriptText theme={theme}>
            {userInput}
          </TranscriptText>
        </StatusCard>
      )}
      
      {/* 确认文本显示 */}
      {confirmText && currentState === STATES.CONFIRMING && (
        <StatusCard theme={theme} active title="系统确认">
          <TranscriptText theme={theme}>
            {confirmText}
          </TranscriptText>
          
          {/* 确认按钮 (可选，也可以完全依赖语音) */}
          {mode === 'full' && (
            <Space style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={executeAction}
              >
                确认
              </Button>
              <Button 
                icon={<CloseCircleOutlined />}
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                重试
              </Button>
            </Space>
          )}
        </StatusCard>
      )}
      
      {/* 实时语音识别显示 */}
      {isListening && transcript && (
        <StatusCard theme={theme} active title="正在识别">
          <TranscriptText theme={theme}>
            {transcript}
          </TranscriptText>
        </StatusCard>
      )}
      
      {/* 结果显示 */}
      {resultData && currentState === STATES.IDLE && (
        <StatusCard theme={theme} title="执行结果">
          <TranscriptText theme={theme}>
            {formatResultForSpeech(resultData)}
          </TranscriptText>
        </StatusCard>
      )}
      
      {/* 语音控制按钮 */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {(() => {
          const effectiveListening = testMode ? testListening : isListening;
          
          return currentState === STATES.IDLE || currentState === STATES.ERROR ? (
            <VoiceButton
              theme={theme}
              isActive={false}
              onClick={startVoiceInteraction}
              data-testid="voice-recorder-button"
              className={`voice-button ${currentState === STATES.IDLE ? 'idle' : 'error'}`}
              data-state={currentState}
            >
              <SoundOutlined />
            </VoiceButton>
          ) : (
            <VoiceButton
              theme={theme}
              isActive={effectiveListening}
              onClick={effectiveListening ? (testMode ? () => {} : stopListening) : resetSession}
              data-testid="voice-recorder-button"
              className={`voice-button ${effectiveListening ? 'listening' : 'processing'}`}
              data-state={currentState}
              data-listening={effectiveListening}
            >
              {effectiveListening ? <AudioMutedOutlined /> : <AudioOutlined />}
            </VoiceButton>
          );
        })()}
        
        {/* 重置按钮 */}
        {currentState !== STATES.IDLE && (
          <Button 
            style={{ marginLeft: 16 }}
            onClick={resetSession}
          >
            重新开始
          </Button>
        )}
      </div>
    </VoiceContainer>
  );
};

export default VoiceInterface; 