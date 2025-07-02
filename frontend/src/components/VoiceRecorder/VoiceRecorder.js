import React, { useState, useEffect, useCallback, useRef } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onResult, onError, setStatus, disabled, className, maxRecordingTime = 60 }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [time, setTime] = useState(0);
    const [visualizerBars] = useState(48);
    const [timeoutMessage, setTimeoutMessage] = useState('');

    // 使用 ref 来跟踪超时状态，避免状态同步问题
    const timeoutRef = useRef(false);
    const timerRef = useRef(null);

    // 统一的状态重置函数
    const resetState = useCallback(() => {
        console.log('VoiceRecorder: resetState called');
        setIsListening(false);
        setTime(0);
        setTimeoutMessage('');
        timeoutRef.current = false;
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // 当外部disabled状态变化时，如果组件被禁用且正在录音，则停止录音
    useEffect(() => {
        if (disabled && isListening && recognition) {
            console.log('VoiceRecorder: Component disabled while listening, stopping recording');
            try {
                recognition.stop();
            } catch (e) {
                console.warn("Error stopping recognition due to disabled:", e);
                resetState();
            }
        }
    }, [disabled, isListening, recognition, resetState]);

    useEffect(() => {
        // Feature detection for SpeechRecognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recog = new SpeechRecognition();

            // Configuration for the recognition instance
            recog.continuous = false; // Stop listening after the first pause in speech
            recog.lang = 'zh-CN'; // Set language to Chinese (Mandarin, Simplified)
            recog.interimResults = false; // We only want final results
            recog.maxAlternatives = 1; // Get only the most likely transcript

            // Event handler when recognition starts
            recog.onstart = () => {
                console.log('VoiceRecorder: Voice recognition started');
                setIsListening(true);
                setTimeoutMessage('');
                timeoutRef.current = false;
                if (typeof setStatus === 'function') {
                    setStatus('listening');
                }
            };

            // Event handler when a final result is received
            recog.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('VoiceRecorder: Transcript received:', transcript);
                resetState();
                onResult(transcript);
            };

            // Event handler for recognition errors
            recog.onerror = (event) => {
                console.error('VoiceRecorder: Speech recognition error:', event.error);
                resetState();
                onError(event.error);
            };

            // Event handler when recognition ends
            recog.onend = () => {
                console.log('VoiceRecorder: Voice recognition ended');

                // 检查是否是超时导致的结束
                if (timeoutRef.current) {
                    console.log('VoiceRecorder: Recognition ended due to timeout');
                    setTimeoutMessage('录音超时');
                    if (onError) {
                        onError('录音超时');
                    }
                }

                // 清理状态
                setIsListening(false);
                setTime(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                // 通知外部状态变化
                if (typeof setStatus === 'function') {
                    setStatus('idle');
                }
            };

            setRecognition(recog);
        } else {
            console.error('Speech Recognition not supported in this browser.');
            onError('Speech Recognition not supported');
        }

        return () => {
            console.log('VoiceRecorder: Component unmounting, cleaning up');
            resetState();
            if (recognition && recognition.stop) {
                try {
                    recognition.stop();
                } catch (e) {
                    console.warn("Error stopping recognition on unmount:", e);
                }
            }
        };
    }, [resetState, onError, setStatus]);

    // Timer effect with timeout handling
    useEffect(() => {
        if (isListening && !disabled) {
            console.log('VoiceRecorder: Starting timer');
            timerRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1;

                    // 检查超时
                    if (newTime >= maxRecordingTime) {
                        console.log('VoiceRecorder: Recording timeout reached');
                        timeoutRef.current = true;

                        // 通过正常的recognition.stop()来触发结束流程
                        if (recognition && recognition.stop) {
                            try {
                                recognition.stop();
                            } catch (e) {
                                console.warn("Error stopping recognition on timeout:", e);
                            }
                        }

                        return maxRecordingTime;
                    }

                    return newTime;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                console.log('VoiceRecorder: Clearing timer');
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (!isListening) {
                setTime(0);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isListening, disabled, maxRecordingTime, recognition]);

    // 清除超时消息
    useEffect(() => {
        if (timeoutMessage) {
            const timeoutId = setTimeout(() => {
                setTimeoutMessage('');
            }, 3000);
            return () => clearTimeout(timeoutId);
        }
    }, [timeoutMessage]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handler for the button click event
    const handleButtonClick = useCallback(() => {
        if (!recognition || disabled) {
            console.log('VoiceRecorder: Button click ignored - no recognition or disabled');
            return;
        }

        if (isListening) {
            console.log('VoiceRecorder: User manually stopping recognition');
            try {
                recognition.stop();
            } catch (e) {
                console.warn("Error stopping recognition:", e);
                resetState();
                if (typeof setStatus === 'function') {
                    setStatus('idle');
                }
            }
        } else {
            console.log('VoiceRecorder: User starting recognition');
            try {
                setTime(0); // 重置时间
                setTimeoutMessage(''); // 清除任何现有的超时消息
                recognition.start();
            } catch (e) {
                console.error("Error starting recognition:", e);
                if (e.name === 'InvalidStateError') {
                    console.warn("Recognition was already started");
                } else {
                    onError("Failed to start listening");
                    resetState();
                    if (typeof setStatus === 'function') {
                        setStatus('idle');
                    }
                }
            }
        }
    }, [recognition, isListening, disabled, onError, setStatus, resetState]);

    // 计算是否显示警告状态
    const isWarning = time >= maxRecordingTime - 10 && isListening && !disabled;

    return (
        <div className={`voice-recorder-container ${className || ''}`} data-testid="voice-recorder">
            <div className="voice-recorder-content">
                <button
                    className={`recorder-button ${isListening ? 'listening' : ''}`}
                    onClick={handleButtonClick}
                    disabled={!recognition || disabled}
                    aria-label={isListening ? '停止录音' : '开始录音'}
                    data-testid="voice-recorder-button"
                >
                    {isListening ? (
                        <div className="recording-icon" />
                    ) : (
                        <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                    )}
                </button>

                <span className={`time-display ${isListening ? 'active' : ''} ${isWarning ? 'warning' : ''}`} data-testid="time-display">
                    {formatTime(time)}
                    {isWarning && (
                        <span className="time-warning" data-testid="time-warning"> / {formatTime(maxRecordingTime)}</span>
                    )}
                </span>

                <div className="visualizer-container">
                    {[...Array(visualizerBars)].map((_, i) => (
                        <div
                            key={i}
                            className={`visualizer-bar ${isListening ? 'active' : ''}`}
                            style={
                                isListening
                                    ? {
                                        height: `${20 + Math.random() * 80}%`,
                                        animationDelay: `${i * 0.05}s`,
                                    }
                                    : undefined
                            }
                        />
                    ))}
                </div>

                <p className="status-text" data-testid="status-text">
                    {timeoutMessage || (isListening ? '正在聆听...' : '点击开始说话')}
                </p>
            </div>

            {!recognition && (
                <div className="unsupported-message">
                    <p>语音识别不可用</p>
                    <p>请使用支持语音识别的浏览器</p>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder; 