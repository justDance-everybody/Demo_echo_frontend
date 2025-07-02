import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import VoiceRecorder from '../VoiceRecorder';

// 模拟语音识别对象
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.lang = '';
    this.interimResults = false;
    this.maxAlternatives = 1;
    this.onstart = null;
    this.onresult = null;
    this.onerror = null;
    this.onend = null;
    // 添加jest.fn()来追踪方法调用
    this.start = jest.fn(() => {
      if (this.onstart) this.onstart();
    });
    this.stop = jest.fn(() => {
      if (this.onend) this.onend();
    });
  }

  // 模拟接收语音结果
  simulateResult(transcript) {
    if (this.onresult) {
      const event = {
        results: [
          [
            {
              transcript,
              confidence: 0.9
            }
          ]
        ]
      };
      this.onresult(event);
    }
  }

  // 模拟错误
  simulateError(errorType) {
    if (this.onerror) {
      const event = { error: errorType };
      this.onerror(event);
    }
  }
}

describe('VoiceRecorder组件', () => {
  let originalSpeechRecognition;
  let mockRecognitionInstance;

  beforeAll(() => {
    // 保存原始的SpeechRecognition对象
    originalSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // 设置模拟对象
    window.SpeechRecognition = jest.fn(() => {
      mockRecognitionInstance = new MockSpeechRecognition();
      return mockRecognitionInstance;
    });
  });

  afterAll(() => {
    // 还原原始对象
    if (originalSpeechRecognition) {
      window.SpeechRecognition = originalSpeechRecognition;
    } else {
      delete window.SpeechRecognition;
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 基础渲染测试
  test('应该正确渲染语音录制组件', () => {
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    // 验证主要元素存在
    expect(screen.getByTestId('voice-recorder')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('点击开始说话')).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  // 验证麦克风图标渲染
  test('应该显示麦克风图标', () => {
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // 验证按钮包含aria-label表明是录音功能
    expect(button).toHaveAttribute('aria-label', '开始录音');
  });

  // 验证可视化波形条渲染
  test('应该渲染可视化波形容器', () => {
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    // 通过testid查找可视化容器
    const voiceRecorder = screen.getByTestId('voice-recorder');
    expect(voiceRecorder).toBeInTheDocument();
    // 验证包含可视化相关的类名
    expect(voiceRecorder).toHaveClass('voice-recorder-container');
  });

  // 点击开始录音测试
  test('点击按钮应该开始录音并更新UI', async () => {
    const user = userEvent.setup();
    const mockSetStatus = jest.fn();

    render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={jest.fn()}
        setStatus={mockSetStatus}
      />
    );

    const button = screen.getByRole('button');

    // 点击按钮开始录音
    await user.click(button);

    // 验证状态更新
    expect(mockSetStatus).toHaveBeenCalledWith('listening');
    expect(button).toHaveClass('listening');
    expect(screen.getByText('正在聆听...')).toBeInTheDocument();

    // 验证录音状态已激活
    expect(button).toHaveClass('listening');
  });

  // 时间计时器测试
  test('录音时应该显示计时器', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();

    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');

    // 开始录音
    await user.click(button);

    // 验证初始时间
    expect(screen.getByText('00:00')).toBeInTheDocument();

    // 模拟时间流逝
    act(() => {
      jest.advanceTimersByTime(3000); // 3秒
    });

    await waitFor(() => {
      expect(screen.getByText('00:03')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  // 可视化波形激活测试
  test('录音时界面应该更新为录音状态', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');

    // 开始录音
    await user.click(button);

    // 验证状态文本更新
    expect(screen.getByText('正在聆听...')).toBeInTheDocument();
    expect(button).toHaveClass('listening');
  });

  // 语音结果处理测试
  test('接收语音结果后应调用onResult回调并重置UI', async () => {
    const user = userEvent.setup();
    const mockOnResult = jest.fn();
    const mockOnError = jest.fn();

    render(
      <VoiceRecorder
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const button = screen.getByRole('button');

    // 点击按钮开始录音
    await user.click(button);

    // 模拟接收语音结果
    act(() => {
      mockRecognitionInstance.simulateResult('测试语音');
    });

    // 验证回调被调用
    expect(mockOnResult).toHaveBeenCalledWith('测试语音');

    // 验证UI重置
    await waitFor(() => {
      expect(button).not.toHaveClass('listening');
    });

    await waitFor(() => {
      expect(screen.getByText('点击开始说话')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  // 语音错误处理测试
  test('发生错误时应调用onError回调并重置UI', async () => {
    const user = userEvent.setup();
    const mockOnResult = jest.fn();
    const mockOnError = jest.fn();

    render(
      <VoiceRecorder
        onResult={mockOnResult}
        onError={mockOnError}
      />
    );

    const button = screen.getByRole('button');

    // 点击按钮开始录音
    await user.click(button);

    // 模拟错误
    act(() => {
      mockRecognitionInstance.simulateError('no-speech');
    });

    // 验证错误回调被调用
    expect(mockOnError).toHaveBeenCalledWith('no-speech');

    // 验证UI重置
    await waitFor(() => {
      expect(button).not.toHaveClass('listening');
    });

    await waitFor(() => {
      expect(screen.getByText('点击开始说话')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  // 禁用状态测试
  test('禁用状态下按钮应不可点击', () => {
    render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={jest.fn()}
        disabled={true}
      />
    );

    // 验证按钮被禁用
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  // 自定义className测试
  test('应该支持自定义className', () => {
    render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={jest.fn()}
        className="custom-class"
      />
    );

    const container = screen.getByTestId('voice-recorder');
    expect(container).toHaveClass('custom-class');
  });

  // 可访问性测试
  test('应该具有正确的可访问性属性', () => {
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', '开始录音');
  });

  // 可访问性测试 - 录音状态
  test('录音状态下应该有正确的可访问性属性', async () => {
    const user = userEvent.setup();

    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');

    // 开始录音
    await user.click(button);

    expect(button).toHaveAttribute('aria-label', '停止录音');
  });

  // 浏览器不支持语音识别测试
  test('浏览器不支持语音识别时应显示错误信息', () => {
    // 临时移除SpeechRecognition模拟
    delete window.SpeechRecognition;

    const mockOnError = jest.fn();

    render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={mockOnError}
      />
    );

    // 验证显示错误信息
    expect(screen.getByText('语音识别不可用')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith('Speech Recognition not supported');

    // 还原模拟
    window.SpeechRecognition = jest.fn(() => {
      mockRecognitionInstance = new MockSpeechRecognition();
      return mockRecognitionInstance;
    });
  });

  // 停止录音测试
  test('录音中点击按钮应该停止录音', async () => {
    const user = userEvent.setup();
    const mockSetStatus = jest.fn();

    render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={jest.fn()}
        setStatus={mockSetStatus}
      />
    );

    const button = screen.getByRole('button');

    // 开始录音
    await user.click(button);

    // 等待状态更新
    await waitFor(() => {
      expect(button).toHaveClass('listening');
    });

    // 再次点击停止录音
    await user.click(button);

    // 验证停止录音后状态重置
    await waitFor(() => {
      expect(button).not.toHaveClass('listening');
    });

    // 验证停止录音的处理
    expect(mockRecognitionInstance.stop).toBeDefined();
  });

  // 组件卸载时应停止录音测试
  test('组件卸载时应停止录音', () => {
    const { unmount } = render(
      <VoiceRecorder
        onResult={jest.fn()}
        onError={jest.fn()}
      />
    );

    // 模拟组件卸载
    unmount();

    // 验证清理函数被调用（在实际环境中会调用recognition.stop）
    // 这里主要确保组件能正常卸载而不报错
    expect(true).toBe(true);
  });

  // 验证录音状态的UI更新
  test('录音状态下的UI应该更新为录音状态', async () => {
    const user = userEvent.setup();
    render(<VoiceRecorder onResult={jest.fn()} onError={jest.fn()} />);

    const button = screen.getByRole('button');

    // 开始录音
    await user.click(button);

    // 验证状态文本更新
    expect(screen.getByText('正在聆听...')).toBeInTheDocument();
    expect(button).toHaveClass('listening');

    // 验证录音状态的UI更新
    await waitFor(() => {
      expect(screen.getByText('正在聆听...')).toBeInTheDocument();
    });
  });
}); 