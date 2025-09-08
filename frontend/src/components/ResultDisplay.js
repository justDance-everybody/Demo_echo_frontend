import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import useTTS from '../hooks/useTTS';
import { useTheme } from '../contexts/ThemeContext';

// 结果容器
const ResultContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 16px;
  margin-bottom: 16px;
  animation: fadeIn 0.5s ease;
  max-width: 600px;
  width: 100%;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// 结果标题行
const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

// 结果图标
const ResultIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  color: ${props => {
    switch (props.status) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#f5222d';
      case 'error':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  }};
`;

// 结果标题
const ResultTitle = styled.h3`
  margin: 0 0 0 8px;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#222222'};
  font-size: 16px;
  font-weight: 600;
`;

// 结果内容
const ResultContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  word-break: break-word;
  text-shadow: ${props => props.theme === 'dark' ? '0 0 1px rgba(0,0,0,0.5)' : 'none'};
  letter-spacing: 0.02em;
`;

// 结果详情
const ResultDetails = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2c2c2c' : '#f5f5f5'};
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme === 'dark' ? '#444444' : '#e0e0e0'};
  color: ${props => props.theme === 'dark' ? '#e6e6e6' : '#333333'};
  font-size: 14px;
  white-space: pre-wrap;
  line-height: 1.5;
`;

// 动作按钮
const ActionButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px ${props => props.theme.shadowColor};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/**
 * 结果显示组件
 * @param {Object} props - 组件属性
 * @param {Object} props.data - 结果数据
 * @param {string} props.status - 结果状态 (success, warning, error, info)
 * @param {string} props.title - 结果标题
 * @param {string} props.message - 结果消息
 * @param {boolean} props.autoSpeak - 是否自动朗读结果
 * @param {Function} props.onDismiss - 关闭结果回调
 * @param {Function} props.onAction - 动作按钮回调
 * @param {string} props.actionText - 动作按钮文本
 */
const ResultDisplay = ({
  data = {},
  status = 'success',
  title,
  message,
  autoSpeak = true,
  onDismiss,
  onAction,
  actionText = '继续'
}) => {
  const { theme } = useTheme();
  const { speak, cancel: cancelTTS, isSpeaking } = useTTS();
  
  // 根据status获取图标
  const getStatusIcon = useCallback(() => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined data-testid="success-icon" style={{ color: '#52c41a', fontSize: 24 }} />;
      case 'warning':
        return <WarningOutlined data-testid="warning-icon" style={{ color: '#f5222d', fontSize: 24 }} />;
      case 'error':
        return <ExclamationCircleOutlined data-testid="error-icon" style={{ color: '#f5222d', fontSize: 24 }} />;
      default:
        return <InfoCircleOutlined data-testid="info-icon" style={{ color: '#1890ff', fontSize: 24 }} />;
    }
  }, [status]);
  
  // 提取并确认要播报的消息
  const ttsMessage = message || (data && data.tts_message) || (
    status === 'success' ? '操作成功完成。' :
    status === 'error' ? '操作失败，请稍后重试。' :
    '已完成。'
  );
  
  // 自动朗读结果消息
  useEffect(() => {
    if (autoSpeak && ttsMessage && !isSpeaking) {
      console.log("ResultDisplay: Attempting to speak result message.");
      speak(ttsMessage);
    }
    // 组件卸载时停止 TTS
    return () => {
      cancelTTS();
    };
  }, [ttsMessage, autoSpeak, speak, isSpeaking, cancelTTS]);
  
  // 格式化结果详情（优先展示 raw_data，其次 summary，再回退到结构化格式）
  const formatDetails = useCallback(() => {
    if (!data) return null;

    try {
      const formatObject = (obj, level = 0) => {
        if (typeof obj !== 'object' || obj === null) return String(obj);

        if (Array.isArray(obj)) {
          if (obj.length === 0) return '[]';
          return obj.map(item => (typeof item === 'object' && item !== null) ? formatObject(item, level + 1) : String(item)).join(', ');
        }

        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';

        const keyFields = ['name', 'value', 'text', 'result', 'description', 'title', 'address', 'date', 'time', 'status'];
        const importantEntries = entries.filter(([key]) => keyFields.includes(key));
        if (importantEntries.length > 0) {
          return importantEntries.map(([key, value]) => {
            const formattedValue = (typeof value === 'object' && value !== null) ? formatObject(value, level + 1) : String(value);
            return `${key}: ${formattedValue}`;
          }).join(', ');
        }

        if (obj.content) return obj.content;
        if (obj.message) return obj.message;

        const simple = entries.slice(0, 3).map(([key, value]) => {
          const formattedValue = (typeof value === 'object' && value !== null) ? (level < 2 ? formatObject(value, level + 1) : '[Object]') : String(value);
          return `${key}: ${formattedValue}`;
        }).join(', ');
        return simple + (entries.length > 3 ? '...' : '');
      };

      // 1) 优先 raw_data
      const raw = data.raw_data ?? data.raw ?? null;
      if (raw) {
        // 优先抽取常见结构 raw.data.content[*].text
        const contentArr = raw?.data?.content;
        if (Array.isArray(contentArr) && contentArr.length > 0) {
          const texts = contentArr
            .map(item => {
              if (typeof item === 'string') return item;
              if (item && typeof item === 'object') {
                return item.text || item.value || item.description || null;
              }
              return null;
            })
            .filter(Boolean);
          if (texts.length > 0) {
            return texts.join('\n');
          }
        }
        return formatObject(raw);
      }

      // 2) 次选 summary（仅用于详情，不重复 tts_message）
      if (data.summary) return data.summary;

      // 3) 回退到格式化整个 data（避免重复读 tts_message，可做浅拷贝剔除）
      const { tts_message, ...rest } = data || {};
      return formatObject(rest);
    } catch (e) {
      return JSON.stringify(data, null, 2);
    }
  }, [data]);
  
  const detailsContent = formatDetails();
  
  // 提取标题
  const displayTitle = title || (
    status === 'success' ? '操作成功' :
    status === 'warning' ? '注意' :
    status === 'error' ? '操作失败' : '信息'
  );
  
  return (
    <ResultContainer theme={theme}>
      <ResultHeader>
        <ResultIcon theme={theme} status={status}>
          {getStatusIcon()}
        </ResultIcon>
        <ResultTitle theme={theme}>{displayTitle}</ResultTitle>
      </ResultHeader>
      
      <ResultContent theme={theme}>{ttsMessage}</ResultContent>
      
      {detailsContent && (
        <ResultDetails theme={theme}>
          {detailsContent}
        </ResultDetails>
      )}
      
      {(onDismiss || onAction) && (
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          {onDismiss && (
            <button 
              onClick={() => { cancelTTS(); onDismiss(); }} 
              style={{ marginRight: '10px' }}
            >
              关闭
            </button>
          )}
        {onAction && (
            <ActionButton 
              theme={theme} 
              onClick={() => { cancelTTS(); onAction(); }}
            >
            {actionText}
          </ActionButton>
        )}
      </div>
      )}
    </ResultContainer>
  );
};

export default ResultDisplay; 