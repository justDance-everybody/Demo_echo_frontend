// frontend/src/pages/MainPage/MainPage.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import VoiceRecorder from '../../components/VoiceRecorder/VoiceRecorder';
import StatusBar from '../../components/StatusBar/StatusBar';
import InteractionProgressIndicator from '../../components/InteractionProgressIndicator';
import apiClient from '../../services/apiClient'; 
import useTTS from '../../hooks/useTTS'; 
import useVoice from '../../hooks/useVoice';

import ResultDisplay from '../../components/ResultDisplay';
import { motion } from 'framer-motion';
import { AuthContext } from '../../contexts/AuthContext';
import { useInteraction, INTERACTION_STATES } from '../../contexts/InteractionContext';
import { useVoiceCoordinator } from '../../hooks/useVoiceCoordinator';
import { createUnifiedErrorHandler, ERROR_TYPES } from '../../utils/unifiedErrorHandler';
import './MainPage.css'; 
import { 
    shouldShowResetButton, 
    getContainerClassName, 
    getAnimationProps, 
    getComponentProps 
} from './MainPageStyles';
import { UI_CONFIG } from '../../config/uiConfig';

console.log('Test persistence');

const MainPage = () => {
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
    
    // 使用统一的交互状态管理
    const {
        currentState,
        lastTranscript,
        lastResponse,
        pendingAction,
        resultData,
        sessionId,
        setState,
        setTranscript,
        setResponse,
        setPendingAction,
        setResultData,
        setError,
        reset
    } = useInteraction();
    
    // 语音相关hooks
    const voiceCoordinator = useVoiceCoordinator();
    
    // 统一错误处理器
    const errorHandlerRef = useRef(null);
    if (!errorHandlerRef.current) {
        errorHandlerRef.current = createUnifiedErrorHandler({
            interactionActions: {
                setState,
                setError,
                reset
            },
            voiceCoordinator,
            onUserAction: (message, errorType, context) => {
                console.log('User action required:', message, errorType);
                // 可以在这里添加特殊的用户操作处理逻辑
            },
            enableLogging: true
        });
    }

    // 流式对话消息状态
    const [streamMessages, setStreamMessages] = useState([]);

    useEffect(() => {
        if (!sessionId) {
            // sessionId由InteractionContext管理，这里不需要手动设置
            console.log('Session ID from context:', sessionId);
        }
        
        // 移除复杂的工具获取逻辑，简化为MVP需求
    }, [isAuthenticated, authLoading, sessionId]);
    
    // 添加重置函数
    const resetUIState = useCallback(() => {
        console.log('重置界面状态...');
        setState(INTERACTION_STATES.IDLE);
        setPendingAction(null);
        setResultData(null);
        setStreamMessages([]); // 清空流式消息
        voiceCoordinator.forceStopAll();
        // 保留最后一次的文本记录，但可以选择清除
    }, [setState, setPendingAction, setResultData, voiceCoordinator]);

    // 添加流式消息
    const addStreamMessage = useCallback((type, content, options = {}) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            type, // 'user' 或 'ai'
            content,
            timestamp: new Date().toLocaleTimeString(),
            ...options
        };
        setStreamMessages(prev => [...prev, newMessage]);
    }, []);

    // 更新最后一条AI消息
    const updateLastAIMessage = useCallback((content, options = {}) => {
        setStreamMessages(prev => {
            const newMessages = [...prev];
            const lastAIIndex = newMessages.findLastIndex(msg => msg.type === 'ai');
            if (lastAIIndex !== -1) {
                newMessages[lastAIIndex] = {
                    ...newMessages[lastAIIndex],
                    content,
                    ...options
                };
            }
            return newMessages;
        });
    }, []);

    // 处理语音结果
    const handleVoiceResult = useCallback(async (transcript) => {
        console.log('收到语音结果:', transcript);
        
        if (!transcript || transcript.trim() === '') {
            console.log('语音结果为空，忽略');
            return;
        }

        // 添加用户消息到流式对话
        addStreamMessage('user', transcript);
        
        setTranscript(transcript);
        setState(INTERACTION_STATES.THINKING);
        
        try {
            // 添加AI思考消息
            addStreamMessage('ai', '正在理解您的需求...');
            
            const response = await apiClient.interpret(transcript, sessionId, 1);
            console.log('意图解析结果:', response);
            
            setResponse(response);
            
            // 更新AI消息内容
            updateLastAIMessage(response.content || '我理解了您的需求');
            
            if (response.type === 'tool_call' && response.tool_calls && response.tool_calls.length > 0) {
                // 需要确认的操作 - 保持THINKING状态直到用户确认
                setPendingAction(response);
                // 不立即改变状态，保持THINKING状态
                
                // 添加确认消息，不弹出模态框
                addStreamMessage('ai', response.confirm_text || '请确认是否执行此操作？', {
                    isConfirm: true,
                    toolCalls: response.tool_calls
                });
                
                // 移除模态框弹出
                // openConfirmModal(response.confirm_text || '请确认是否执行此操作？');
            } else {
                // 直接响应 - 保持THINKING状态直到播报完成
                voiceCoordinator.speak(response.content || '处理完成', () => {
                    setState(INTERACTION_STATES.IDLE);
                });
            }
        } catch (error) {
            console.error('处理语音结果失败:', error);
            setError(error.message || '处理失败，请重试');
            setState(INTERACTION_STATES.ERROR);
            
            // 添加错误消息
            addStreamMessage('ai', '抱歉，处理您的请求时出现了问题，请重试。');
        }
    }, [sessionId, setTranscript, setResponse, setPendingAction, setState, setError, addStreamMessage, updateLastAIMessage, voiceCoordinator]);

    // 工具执行和结果处理
    const executeToolAndHandleResult = useCallback(async (toolId, params, currentSessionId, userId) => {
        console.log(`[Session: ${currentSessionId}] 开始执行工具: ${toolId}`);
        
        try {
            setState(INTERACTION_STATES.EXECUTING);
            const execResult = await apiClient.execute(currentSessionId, toolId, params, userId);
            
            if (execResult.success && execResult.data) {
                setResultData({ status: 'success', data: execResult.data });
                
                // 简化的文本提取逻辑
                const textToSpeak = execResult.data?.summary || 
                                  execResult.data?.tts_message || 
                                  execResult.data?.message || 
                                  execResult.data?.result || 
                                  '操作已完成';
                
                // 更新最后一条AI消息为执行结果
                updateLastAIMessage(textToSpeak);
                
                setState(INTERACTION_STATES.SPEAKING);
                voiceCoordinator.speak(textToSpeak, () => {
                    console.log('工具执行结果播报完毕，重置状态');
                    // 播报完成后重置到初始状态
                    resetUIState();
                });
            } else {
                throw new Error(execResult.error?.message || '工具执行失败');
            }
        } catch (error) {
            errorHandlerRef.current.handleError(error, ERROR_TYPES.TOOL_EXECUTION, {
                toolId,
                params,
                sessionId: currentSessionId,
                retryCallback: () => executeToolAndHandleResult(toolId, params, currentSessionId, userId)
            });
            
            // 添加错误消息
            updateLastAIMessage('执行失败，请重试。');
        }
    }, [setState, setResultData, voiceCoordinator, resetUIState, updateLastAIMessage]);

    // 处理语音错误
    const handleVoiceError = useCallback((error) => {
        console.error('VoiceRecorder Error:', error);
        setError(error.message || '语音识别失败');
        setState(INTERACTION_STATES.ERROR);
        
        // 添加错误消息
        addStreamMessage('ai', '语音识别失败，请重试。');
    }, [setError, setState, addStreamMessage]);

    // 处理用户确认
    const handleUserConfirm = useCallback(() => {
        console.log(`[Session: ${sessionId}] 用户确认了操作`);
        // 移除模态框关闭，因为不再使用模态框
        // closeConfirmModal();
        
        // 从pendingAction获取工具信息
        let toolId, params, userId = 1;
        
        if (pendingAction?.tool_calls && pendingAction.tool_calls.length > 0) {
            const firstToolCall = pendingAction.tool_calls[0];
            toolId = firstToolCall.tool_id;
            params = firstToolCall.parameters || {};
        } else {
            toolId = pendingAction?.action || 'default_confirm_action';
            params = pendingAction?.params || {};
        }
        
        console.log(`[Session: ${sessionId}] 准备执行工具: ${toolId}，参数:`, params);
        
        // 设置状态为CONFIRMING，表示正在等待确认
        setState(INTERACTION_STATES.CONFIRMING);
        
        // 添加执行消息
        addStreamMessage('ai', '正在执行操作...');
        
        // 执行工具调用
        executeToolAndHandleResult(toolId, params, sessionId, userId);
    }, [pendingAction, sessionId, addStreamMessage, executeToolAndHandleResult]);



    // 处理用户取消
    const handleUserCancel = useCallback(() => {
        console.log(`[Session: ${sessionId}] 用户取消了操作`);
        // 移除模态框关闭，因为不再使用模态框
        // closeConfirmModal();
        setPendingAction(null);
        setState(INTERACTION_STATES.IDLE);
        
        // 添加取消消息
        addStreamMessage('ai', '好的，操作已取消。');
        
        voiceCoordinator.speak("好的，操作已取消。", () => {
            console.log('取消操作播报完毕，重新启动语音监听');
            // 延迟启动语音监听，确保TTS完全结束
            setTimeout(() => {
                voiceCoordinator.startListening();
            }, UI_CONFIG.delays.voiceActivation);
        });
    }, [setPendingAction, setState, sessionId, voiceCoordinator, addStreamMessage]);

    // 处理重置
    const handleReset = useCallback(() => {
        console.log('用户点击重置');
        resetUIState();
        setStreamMessages([]); // 清空流式消息
    }, [resetUIState]);

    // 监听语音协调器错误
    useEffect(() => {
        if (voiceCoordinator.errorMessage) {
            console.error("语音协调器报告错误:", voiceCoordinator.errorMessage);
            
            // 根据错误类型决定是否向用户播报
            if (currentState === INTERACTION_STATES.CONFIRMING) {
                 voiceCoordinator.speak("抱歉，我没听清，请说确认或取消。", () => {
                    setState(INTERACTION_STATES.CONFIRMING);
                    // TTS完成后检查语音状态再重新启动
                    setTimeout(() => {
                        voiceCoordinator.startListening();
                    }, UI_CONFIG.delays.voiceActivation);
                 });
            } else {
                 // 其他情况下的错误，可能需要重置
                 reset();
            }
        }
    }, [voiceCoordinator.errorMessage, currentState, voiceCoordinator, reset, setState]);

    // 渲染流式消息
    const renderStreamMessages = () => {
        return streamMessages.map((message, index) => (
            <motion.div
                key={message.id}
                className={`stream-item ${message.type} ${message.isConfirm ? 'confirm' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <div className="message-content">{message.content}</div>
                <div className="message-timestamp">{message.timestamp}</div>
                
                {message.isConfirm && message.toolCalls && (
                    <div className="stream-item-buttons">
                        <button 
                            className="confirm-btn"
                            onClick={handleUserConfirm}
                        >
                            确认
                        </button>
                        <button 
                            className="cancel-btn"
                            onClick={handleUserCancel}
                        >
                            取消
                        </button>
                    </div>
                )}
            </motion.div>
        ));
    };





    // UI Rendering
    return (
        <motion.div
            className={getContainerClassName(currentState)}
            data-testid="main-page"
            {...getAnimationProps('pageTransition')}
        >
            {/* 交互进度指示器 */}
            <InteractionProgressIndicator 
                data-testid="interaction-progress"
                currentState={currentState}
                showDetailedInfo={true}
                compact={false}
            />
            
            <StatusBar 
                {...getComponentProps('statusBar')}
                data-testid="status-bar"
                currentStatus={currentState} 
                lastTranscript={lastTranscript} 
                lastResponse={lastResponse} 
            />
            
            <div {...getComponentProps('contentWrapper')}>
                {/* 主内容区 */}
                <div {...getComponentProps('contentArea')}>
                    {/* 流式对话容器 */}
                    <div className="stream-container">
                        {renderStreamMessages()}
                        
                        {/* 结果显示 */}
                        {resultData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="result-container"
                                data-testid="result-display"
                            >
                                <ResultDisplay 
                                    status={resultData.status}
                                    data={resultData.data} 
                                    message={resultData.message}
                                    autoSpeak={true}
                                    onDismiss={handleReset}
                                />
                            </motion.div>
                        )}
                    </div>
        
                    {/* 重置按钮 */}
                    {shouldShowResetButton(currentState) && (
                        <motion.button 
                            {...getComponentProps('resetButton')}
                            data-testid="reset-button"
                            onClick={handleReset}
                            {...getAnimationProps('resetButton')}
                        >
                            重新开始
                        </motion.button>
                    )}
                    
                    {/* 语音输入按钮 */}
                    <VoiceRecorder 
                        {...getComponentProps('voiceRecorder')}
                        data-testid="voice-recorder"
                        onResult={handleVoiceResult} 
                        onError={handleVoiceError}
                        setStatus={setState}
                        disabled={currentState !== INTERACTION_STATES.IDLE && currentState !== INTERACTION_STATES.LISTENING} // 允许在idle和listening状态下使用
                    />
                </div>
            </div>
            

        </motion.div>
    );
};

export default MainPage;