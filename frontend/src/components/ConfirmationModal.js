import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { QuestionCircleOutlined, CheckOutlined, CloseOutlined, UndoOutlined, AudioOutlined } from '@ant-design/icons';
import useVoice from '../hooks/useVoice';
import useIntent from '../hooks/useIntent';
import { useTheme } from '../contexts/ThemeContext';
import useTTS from '../hooks/useTTS';

// 模态框容器
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.dialogOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 模态框内容
const ModalContent = styled.div`
  background-color: ${props => props.theme.dialogBackground};
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  padding: 24px;
  box-shadow: 0 4px 20px ${props => props.theme.shadowColor};
  position: relative;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// 模态框图标
const ModalIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.theme.primary}22;
  color: ${props => props.theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 16px;
`;

// 模态框标题
const ModalTitle = styled.h3`
  color: ${props => props.theme.text};
  text-align: center;
  margin-bottom: 16px;
  font-size: 18px;
`;

// 模态框文本
const ModalText = styled.div`
  color: ${props => props.theme.text};
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
  font-size: 16px;
`;

// 按钮容器
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

// 按钮
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px ${props => props.theme.shadowColor};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 确认按钮
const ConfirmButton = styled(Button)`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
`;

// 取消按钮
const CancelButton = styled(Button)`
  background-color: transparent;
  color: ${props => props.theme.textSecondary};
  border: 1px solid ${props => props.theme.border};
`;

// 重试按钮
const RetryButton = styled(Button)`
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.buttonText};
  border: none;
`;

// 语音识别状态
const ListeningStatus = styled.div`
  color: ${props => props.theme.primary};
  text-align: center;
  font-size: 14px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  span {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.theme.primary};
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(0.8); opacity: 0.5; }
  }
`;

/**
 * 确认对话框组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.isOpen - 是否显示对话框
 * @param {string} props.confirmText - 确认文本
 * @param {Function} props.onConfirm - 确认回调
 * @param {Function} props.onRetry - 重试回调
 * @param {Function} props.onCancel - 取消回调
 * @param {boolean} props.useVoiceConfirmation - 是否使用语音确认
 * @param {boolean} props.isListening - 语音监听状态（从父组件传入）
 * @param {boolean} props.isTTSSpeaking - TTS播放状态（从父组件传入）
 * @param {Function} props.startSTTListening - 开始语音监听的函数（从父组件传入）
 * @param {Function} props.stopSTTListening - 停止语音监听的函数（从父组件传入）
 */
const ConfirmationModal = ({
  isOpen,
  confirmText,
  onConfirm,
  onRetry,
  onCancel,
  useVoiceConfirmation = true,
  isListening,
  isTTSSpeaking,
  startSTTListening,
  stopSTTListening,
  onTTSCompleted,
  voiceTranscript
}) => {
  const { theme } = useTheme();
  // 仅在组件内部使用时才使用useVoice hook
  const voiceHook = useVoice();
  const { classifyIntent } = useIntent();
  const { speak, cancel: cancelTTS } = useTTS();

  // 为了兼容性，如果没有传入外部的语音控制函数，则使用内部的hook
  const isSTTListening = isListening !== undefined ? isListening : voiceHook.isListening;
  const transcript = voiceTranscript || voiceHook.transcript; // 优先使用传入的transcript
  const startListening = startSTTListening || voiceHook.startListening;
  const stopListening = stopSTTListening || voiceHook.stopListening;

  const [isConfirmListening, setIsConfirmListening] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [ttsFinished, setTtsFinished] = useState(false);
  const ttsStartedRef = useRef(false); // 使用ref来避免无限循环
  const lastProcessedTranscript = useRef(''); // 记录最后处理的语音结果

  // 当modal状态变化时重置状态
  useEffect(() => {
    if (isOpen) {
      // Modal打开时重置所有状态
      setIsConfirmListening(false);
      setShowButtons(false);
      setTtsFinished(false);
      ttsStartedRef.current = false; // 重置TTS启动标记
      lastProcessedTranscript.current = ''; // 重置最后处理的语音结果
    }
  }, [isOpen]);

  // 手动启动语音识别
  const handleStartVoiceListening = () => {
    console.log("ConfirmationModal: 用户手动点击启动语音识别");
    setIsConfirmListening(true);
    // 确保先停止之前可能在进行的识别
    try {
      stopListening();
    } catch (e) {
      console.log("停止之前的识别时出错:", e);
    }

    // 短暂延迟后启动新的识别，防止冲突
    setTimeout(() => {
      startListening();
    }, 100);

    // 10秒后自动停止，避免无限等待
    setTimeout(() => {
      if (isConfirmListening) {
        console.log("ConfirmationModal: 语音识别超时自动停止");
        stopListening();
        setIsConfirmListening(false);
      }
    }, 10000);
  };

  // 对话框打开时朗读确认文本
  useEffect(() => {
    if (isOpen && confirmText && !ttsStartedRef.current) {
      console.log("ConfirmationModal: 准备播放确认文本");
      ttsStartedRef.current = true; // 标记TTS已启动，避免重复
      setTtsFinished(false);
      setShowButtons(false); // 初始不显示按钮

      // 使用函数版本设置状态，防止引用旧状态
      const timer = setTimeout(() => {
        console.log("ConfirmationModal: 开始播放确认文本...");
        // 添加回调函数，在TTS结束后设置状态
        speak(confirmText, 'zh-CN', 1, 1, () => {
          console.log("ConfirmationModal: TTS播放完成，设置ttsFinished=true");
          setTtsFinished(true);
          setShowButtons(true);
          console.log("ConfirmationModal: 显示按钮和语音输入选项");

          // 通知MainPage TTS完成
          if (onTTSCompleted) {
            onTTSCompleted();
          }

          // 如果启用了语音确认，自动启动语音监听
          if (useVoiceConfirmation) {
            console.log("ConfirmationModal: 自动启动语音监听");
            setTimeout(() => {
              handleStartVoiceListening();
            }, 300);
          }
        });
      }, 300);

      return () => {
        clearTimeout(timer);
        cancelTTS();
      };
    }

    if (!isOpen) {
      console.log("ConfirmationModal: 对话框已关闭，取消TTS和语音识别");
      cancelTTS();
      setIsConfirmListening(false);
      setShowButtons(false);
      setTtsFinished(false);
      ttsStartedRef.current = false; // 重置TTS启动标记
      // 停止正在进行的语音识别
      if (isSTTListening) {
        stopListening();
      }
    }
  }, [isOpen, confirmText, useVoiceConfirmation, speak, cancelTTS, isSTTListening, stopListening, handleStartVoiceListening]);

  // 安全超时，确保即使TTS回调失败也会显示按钮
  useEffect(() => {
    if (isOpen && confirmText && ttsStartedRef.current && !ttsFinished && !showButtons) {
      const safetyTimer = setTimeout(() => {
        console.log("ConfirmationModal: 安全定时器触发，强制显示按钮");
        setTtsFinished(true);
        setShowButtons(true);
      }, 5000); // 5秒后如果按钮还没显示，强制显示

      return () => clearTimeout(safetyTimer);
    }
  }, [isOpen, confirmText, ttsFinished, showButtons]);

  // 监听 STT 结果并进行意图分类
  useEffect(() => {
    console.log("ConfirmationModal: useEffect triggered with transcript:", transcript, "isOpen:", isOpen);

    // 当接收到语音识别结果时处理，无论isConfirmListening状态如何
    if (transcript && transcript !== lastProcessedTranscript.current && isOpen) {
      console.log("ConfirmationModal: Received transcript for confirmation:", transcript);
      console.log("ConfirmationModal: isConfirmListening:", isConfirmListening);

      // 更新最后处理的语音结果
      lastProcessedTranscript.current = transcript;

      const intent = classifyIntent(transcript);
      console.log("ConfirmationModal: Classified intent:", intent);

      // 停止语音识别
      if (isConfirmListening) {
        stopListening();
        setIsConfirmListening(false);
      }

      switch (intent) {
        case 'CONFIRM':
          console.log("ConfirmationModal: Executing CONFIRM action");
          onConfirm();
          break;
        case 'RETRY':
          console.log("ConfirmationModal: Executing RETRY action");
          onRetry();
          break;
        case 'CANCEL':
          console.log("ConfirmationModal: Executing CANCEL action");
          onCancel();
          break;
        case 'IGNORE':
          console.log("ConfirmationModal: Ignoring recognized text");
          setShowButtons(true);
          break;
        default:
          console.log("ConfirmationModal: Unclear intent or unrelated speech, showing buttons");
          setShowButtons(true);
          break;
      }
    } else {
      console.log("ConfirmationModal: useEffect condition not met - transcript:", transcript, "lastProcessed:", lastProcessedTranscript.current, "isOpen:", isOpen);
    }
  }, [transcript, isConfirmListening, isOpen, classifyIntent, stopListening, onConfirm, onRetry, onCancel]);

  // 手动按钮处理函数
  const handleConfirm = () => {
    cancelTTS();
    if (isConfirmListening) {
      stopListening();
    }
    onConfirm();
  };

  const handleRetry = () => {
    cancelTTS();
    if (isConfirmListening) {
      stopListening();
    }
    onRetry();
  };

  const handleCancel = () => {
    cancelTTS();
    if (isConfirmListening) {
      stopListening();
    }
    onCancel();
  };

  // 移除每次渲染的日志输出，避免控制台噪音

  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay theme={theme}>
      <ModalContent theme={theme}>
        <ModalIcon theme={theme}>
          <QuestionCircleOutlined />
        </ModalIcon>
        <ModalTitle theme={theme}>确认操作</ModalTitle>
        <ModalText theme={theme}>
          {confirmText}
        </ModalText>



        {/* 使用普通HTML元素和内联样式，避免样式组件可能的问题 */}
        {(ttsFinished || !isTTSSpeaking) && !isConfirmListening && (
          <div style={{
            textAlign: 'center',
            margin: '20px 0',
          }}>
            <button
              id="voice-input-button"
              onClick={handleStartVoiceListening}
              style={{
                backgroundColor: '#8A2BE2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                width: '80%',
              }}
            >
              <AudioOutlined style={{ marginRight: '8px', fontSize: '18px' }} />
              点击开始语音输入
            </button>
          </div>
        )}

        {isConfirmListening && (
          <ListeningStatus theme={theme}>
            <span></span> 正在聆听您的回答...
          </ListeningStatus>
        )}

        {transcript && !isConfirmListening && (
          <ModalText theme={theme} style={{ fontStyle: 'italic', marginTop: '16px' }}>
            识别结果: {transcript}
          </ModalText>
        )}

        {showButtons && !isConfirmListening && (
          <ButtonGroup>
            <ConfirmButton theme={theme} onClick={handleConfirm}>
              <CheckOutlined /> 确认
            </ConfirmButton>
            <RetryButton theme={theme} onClick={handleRetry}>
              <UndoOutlined /> 重试
            </RetryButton>
            <CancelButton theme={theme} onClick={handleCancel}>
              <CloseOutlined /> 取消
            </CancelButton>
          </ButtonGroup>
        )}


      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 