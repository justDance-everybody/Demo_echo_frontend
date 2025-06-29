import React, { useState, useEffect, useCallback } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onResult, onError, setStatus, disabled, className }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [time, setTime] = useState(0);
    const [visualizerBars] = useState(48);

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
                console.log('Voice recognition started (initial input).');
                setIsListening(true); // Update local listening state
                if (typeof setStatus === 'function') {
                    setStatus('listening'); // Update global status passed from parent
                }
            };

            // Event handler when a final result is received
            recog.onresult = (event) => {
                const transcript = event.results[0][0].transcript; // Extract the transcript
                console.log('Transcript received (initial input):', transcript);
                setIsListening(false); // Recognition automatically stops on result (continuous=false)
                setTime(0); // Reset timer
                onResult(transcript); // Pass the transcript back to the parent component (MainPage)
                // Note: Status (e.g., 'thinking') is set in MainPage after this callback completes
            };

            // Event handler for recognition errors
            recog.onerror = (event) => {
                console.error('Speech recognition error (initial input):', event.error);
                setIsListening(false); // Ensure listening state is reset
                setTime(0); // Reset timer
                onError(event.error); // Pass the error to the parent component
                // Note: Status (e.g., 'error' or 'idle') is handled in MainPage's onError callback
            };

            // Event handler when recognition ends
            recog.onend = () => {
                console.log('Voice recognition ended (initial input).');
                // Always reset the listening state when recognition ends
                // This ensures proper cleanup regardless of how the recognition ended
                setIsListening(false);
                setTime(0); // Reset timer
                if (typeof setStatus === 'function') {
                    setStatus('idle');
                }
            };

            // Store the configured recognition instance in state
            setRecognition(recog);
        } else {
            // Handle browsers that don't support SpeechRecognition
            console.error('Speech Recognition not supported in this browser.');
            onError('Speech Recognition not supported'); // Notify parent
        }

        // Cleanup function: Ensure recognition is stopped if the component unmounts
        return () => {
            if (recognition && recognition.stop) {
                try {
                    recognition.stop();
                } catch (e) {
                    console.warn("Error stopping recognition on unmount:", e);
                }
            }
        };
        // Run this effect only once on component mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Timer effect
    useEffect(() => {
        let intervalId;

        if (isListening) {
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            setTime(0);
        }

        return () => clearInterval(intervalId);
    }, [isListening]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handler for the button click event
    const handleButtonClick = useCallback(() => {
        // Do nothing if recognition isn't supported or the button is disabled
        if (!recognition || disabled) return;

        if (isListening) {
            // If currently listening, stop it
            console.log('User manually stopping recognition...');
            try {
                recognition.stop();
                // Note: onend handler will reset the state
            } catch (e) {
                console.warn("Error stopping recognition:", e);
                // If stop() fails, manually reset the state
                setIsListening(false);
                setTime(0);
                if (typeof setStatus === 'function') {
                    setStatus('idle');
                }
            }
        } else {
            // If not listening, start it
            console.log('User starting recognition...');
            try {
                recognition.start();
            } catch (e) {
                // Handle potential errors when starting (e.g., trying to start while already started)
                console.error("Error explicitly starting initial recognition:", e);
                if (e.name === 'InvalidStateError') {
                    // If it's already started, maybe do nothing or log it.
                    console.warn("Recognition was already started, likely due to a previous event.");
                } else {
                    // For other errors, notify the parent and reset state
                    onError("Failed to start listening");
                    setIsListening(false);
                    setTime(0);
                    if (typeof setStatus === 'function') {
                        setStatus('idle');
                    }
                }
            }
        }
        // Dependencies for the button click handler
    }, [recognition, isListening, disabled, onError, setStatus]);

    return (
        <div className={`voice-recorder-container ${className || ''}`} data-testid="voice-recorder">
            <div className="voice-recorder-content">
                <button
                    className={`recorder-button ${isListening ? 'listening' : ''}`}
                    onClick={handleButtonClick}
                    // Disable the button if recognition isn't ready OR if the disabled prop is true
                    disabled={!recognition || disabled}
                    aria-label={isListening ? '停止录音' : '开始录音'}
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

                <span className={`time-display ${isListening ? 'active' : ''}`}>
                    {formatTime(time)}
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

                <p className="status-text">
                    {isListening ? '正在聆听...' : '点击开始说话'}
                </p>
            </div>

            {/* Display a message if speech recognition is not supported */}
            {!recognition && (
                <div className="error-message">
                    <p>语音识别不可用</p>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder; 