import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  AudioOutlined, 
  LoadingOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { INTERACTION_STATES } from '../../contexts/InteractionContext';
import { UI_CONFIG } from '../../config/uiConfig';

// 定义交互流程步骤 - 符合验收标准的四阶段
const INTERACTION_STEPS = [
  {
    key: INTERACTION_STATES.LISTENING,
    label: '识别中',
    icon: AudioOutlined,
    description: '正在识别您的语音指令'
  },
  {
    key: INTERACTION_STATES.THINKING,
    label: '理解中',
    icon: LoadingOutlined,
    description: 'AI正在理解和分析您的指令'
  },
  {
    key: INTERACTION_STATES.EXECUTING,
    label: '执行中',
    icon: PlayCircleOutlined,
    description: '正在执行您的指令'
  },
  {
    key: INTERACTION_STATES.SPEAKING,
    label: '完成',
    icon: CheckCircleOutlined,
    description: '指令执行完成'
  }
];

// 样式组件
const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${UI_CONFIG.spacing.medium};
  background: var(--color-surface);
  border-radius: ${UI_CONFIG.borderRadius.large};
  border: 1px solid var(--color-border);
  margin-bottom: ${UI_CONFIG.spacing.medium};
  box-shadow: var(--shadow-sm);
`;

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 2px;
    background: ${props => props.isCompleted ? 'var(--color-primary)' : 'var(--color-border)'};
    transition: background-color 0.3s ease;
  }
`;

const StepIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 60px;
  position: relative;
  z-index: 1;
  
  background: ${props => {
    if (props.isActive) return 'var(--color-primary)';
    if (props.isCompleted) return 'var(--color-success)';
    return 'var(--color-surface-secondary)';
  }};
  
  color: ${props => {
    if (props.isActive || props.isCompleted) return 'var(--color-on-primary)';
    return 'var(--color-text-secondary)';
  }};
  
  border: 2px solid ${props => {
    if (props.isActive) return 'var(--color-primary)';
    if (props.isCompleted) return 'var(--color-success)';
    return 'var(--color-border)';
  }};
  
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  position: absolute;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  font-size: ${UI_CONFIG.typography.sizes.small};
  font-weight: ${props => props.isActive ? UI_CONFIG.typography.weights.semibold : UI_CONFIG.typography.weights.normal};
  color: ${props => props.isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'};
  white-space: nowrap;
  text-align: center;
`;

const CurrentStepInfo = styled(motion.div)`
  margin-top: ${UI_CONFIG.spacing.large};
  text-align: center;
  padding: ${UI_CONFIG.spacing.medium};
  background: var(--color-surface-secondary);
  border-radius: ${UI_CONFIG.borderRadius.medium};
  border-left: 4px solid var(--color-primary);
`;

const CurrentStepTitle = styled.h4`
  margin: 0 0 ${UI_CONFIG.spacing.small} 0;
  color: var(--color-primary);
  font-size: ${UI_CONFIG.typography.sizes.medium};
  font-weight: ${UI_CONFIG.typography.weights.semibold};
`;

const CurrentStepDescription = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: ${UI_CONFIG.typography.sizes.small};
  line-height: ${UI_CONFIG.typography.lineHeights.relaxed};
`;

const ErrorIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${UI_CONFIG.spacing.small};
  padding: ${UI_CONFIG.spacing.medium};
  background: var(--color-error-alpha);
  color: var(--color-error);
  border-radius: ${UI_CONFIG.borderRadius.medium};
  border: 1px solid var(--color-error);
  margin-top: ${UI_CONFIG.spacing.medium};
  font-size: ${UI_CONFIG.typography.sizes.small};
`;

/**
 * 交互进度指示器组件
 * 显示当前交互流程的进度和状态
 */
const InteractionProgressIndicator = ({ 
  currentState, 
  showDetailedInfo = true,
  compact = false 
}) => {
  // 状态到阶段的映射 - 根据实际交互流程
  const getStageFromState = (state) => {
    switch (state) {
      case INTERACTION_STATES.IDLE:
        return 0; // 初始状态，显示第一阶段但未激活
      case INTERACTION_STATES.LISTENING:
        return 0; // 识别中 - 第一阶段
      case INTERACTION_STATES.THINKING:
        return 1; // 理解中 - 第二阶段
      case INTERACTION_STATES.CONFIRMING:
        return 2; // 执行中 - 第三阶段（等待确认后执行）
      case INTERACTION_STATES.EXECUTING:
        return 2; // 执行中 - 第三阶段
      case INTERACTION_STATES.SPEAKING:
        return 3; // 完成 - 第四阶段
      case INTERACTION_STATES.ERROR:
        return -1; // 错误状态，不显示进度
      default:
        return 0; // 默认显示第一阶段
    }
  };

    const currentStageIndex = getStageFromState(currentState);
  const isError = currentState === INTERACTION_STATES.ERROR;
  const isIdle = currentState === INTERACTION_STATES.IDLE;
  

  

  

  
  // 如果是空闲状态，显示初始状态（第一阶段但未激活）
  if (isIdle) {
    return (
      <div>
        <ProgressContainer>
          {INTERACTION_STEPS.map((step, index) => (
            <StepContainer key={step.key} isCompleted={false}>
              <StepIcon
                isActive={false}
                isCompleted={false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <step.icon />
              </StepIcon>
              <StepLabel isActive={false}>
                {step.label}
              </StepLabel>
            </StepContainer>
          ))}
        </ProgressContainer>
        
        {showDetailedInfo && (
          <CurrentStepInfo
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CurrentStepTitle>等待语音输入</CurrentStepTitle>
            <CurrentStepDescription>请点击麦克风开始语音交互</CurrentStepDescription>
          </CurrentStepInfo>
        )}
      </div>
    );
  }
  
  // 如果是紧凑模式，只显示当前状态
  if (compact) {
    const currentStep = INTERACTION_STEPS[currentStageIndex] || INTERACTION_STEPS[0];
    return (
      <ProgressContainer>
        <StepIcon
          isActive={!isError && currentStageIndex >= 0}
          isCompleted={false}
          animate={{
            scale: isError ? [1, 1.1, 1] : [1, 1.05, 1],
            rotate: currentState === INTERACTION_STATES.LISTENING ? [0, 5, -5, 0] : 0
          }}
          transition={{
            duration: 1.5,
            repeat: currentState === INTERACTION_STATES.LISTENING ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isError ? (
            <ExclamationCircleOutlined />
          ) : (
            React.createElement(currentStep.icon, {
              spin: currentState === INTERACTION_STATES.THINKING || currentState === INTERACTION_STATES.EXECUTING
            })
          )}
        </StepIcon>
        <StepLabel isActive={!isError && currentStageIndex >= 0}>
          {isError ? '出现错误' : currentStep.label}
        </StepLabel>
      </ProgressContainer>
    );
  }

  return (
    <div>
      <ProgressContainer>
        {INTERACTION_STEPS.map((step, index) => {
          // 判断是否为当前活跃阶段
          const isActive = index === currentStageIndex && currentStageIndex >= 0 && currentState !== INTERACTION_STATES.IDLE;
          // 判断是否为已完成阶段
          const isCompleted = index < currentStageIndex && currentStageIndex >= 0;
          const IconComponent = step.icon;
          
          return (
            <StepContainer key={step.key} isCompleted={isCompleted}>
              <StepIcon
                isActive={isActive}
                isCompleted={isCompleted}
                animate={{
                  scale: isActive ? [1, 1.05, 1] : 1,
                  rotate: isActive && step.key === INTERACTION_STATES.LISTENING ? [0, 5, -5, 0] : 0
                }}
                transition={{
                  duration: 1.5,
                  repeat: isActive && step.key === INTERACTION_STATES.LISTENING ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {isCompleted ? (
                  <CheckCircleOutlined />
                ) : (
                  <IconComponent 
                    spin={isActive && (step.key === INTERACTION_STATES.THINKING || step.key === INTERACTION_STATES.EXECUTING)}
                  />
                )}
              </StepIcon>
              <StepLabel isActive={isActive}>
                {step.label}
              </StepLabel>
            </StepContainer>
          );
        })}
      </ProgressContainer>

      {/* 错误状态显示 */}
      {isError && (
        <ErrorIndicator
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ExclamationCircleOutlined />
          <span>操作过程中出现错误，请重试</span>
        </ErrorIndicator>
      )}

      {/* 当前步骤详细信息 */}
      {showDetailedInfo && !isError && currentStageIndex >= 0 && (
        <CurrentStepInfo
          key={currentState} // 添加key确保状态变化时重新渲染动画
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CurrentStepTitle>{INTERACTION_STEPS[currentStageIndex].label}</CurrentStepTitle>
          <CurrentStepDescription>{INTERACTION_STEPS[currentStageIndex].description}</CurrentStepDescription>
        </CurrentStepInfo>
      )}
    </div>
  );
};

export default InteractionProgressIndicator;