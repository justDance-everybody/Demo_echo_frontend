// Mock Web Speech API for testing environments
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = 'zh-CN';
    this.onstart = null;
    this.onend = null;
    this.onresult = null;
    this.onerror = null;
    this.isListening = false;
  }

  start() {
    this.isListening = true;
    setTimeout(() => {
      if (this.onstart) this.onstart();
    }, 100);

    // 模拟语音识别结果
    setTimeout(() => {
      if (this.onresult) {
        const mockResult = {
          results: [{
            0: { transcript: '查询天气' },
            isFinal: true
          }],
          resultIndex: 0
        };
        this.onresult(mockResult);
      }
    }, 1000);

    setTimeout(() => {
      this.isListening = false;
      if (this.onend) this.onend();
    }, 1500);
  }

  stop() {
    this.isListening = false;
    setTimeout(() => {
      if (this.onend) this.onend();
    }, 100);
  }

  abort() {
    this.isListening = false;
    setTimeout(() => {
      if (this.onend) this.onend();
    }, 100);
  }
}

class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.pending = false;
    this.paused = false;
  }

  speak(utterance) {
    this.speaking = true;
    
    setTimeout(() => {
      if (utterance.onstart) utterance.onstart();
    }, 100);

    setTimeout(() => {
      this.speaking = false;
      if (utterance.onend) utterance.onend();
    }, 2000);
  }

  cancel() {
    this.speaking = false;
    this.pending = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  getVoices() {
    return [
      { name: 'Mock Chinese Voice', lang: 'zh-CN', default: true },
      { name: 'Mock English Voice', lang: 'en-US', default: false }
    ];
  }
}

class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.lang = 'zh-CN';
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
    this.onmark = null;
    this.onboundary = null;
  }
}

// 在测试环境中替换Web Speech API
export function setupMockWebSpeechAPI() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'test') {
    window.SpeechRecognition = MockSpeechRecognition;
    window.webkitSpeechRecognition = MockSpeechRecognition;
    window.speechSynthesis = new MockSpeechSynthesis();
    window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    
    console.log('🎤 Mock Web Speech API initialized for testing');
  }
}

// 在Cypress测试中使用
export function setupCypressMockWebSpeechAPI() {
  return {
    setupMockSpeechRecognition: () => {
      cy.window().then((win) => {
        win.SpeechRecognition = MockSpeechRecognition;
        win.webkitSpeechRecognition = MockSpeechRecognition;
        win.speechSynthesis = new MockSpeechSynthesis();
        win.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
      });
    },
    
    mockSpeechRecognitionResult: (transcript) => {
      cy.window().then((win) => {
        // 触发模拟语音识别结果
        const mockResult = {
          results: [{
            0: { transcript },
            isFinal: true
          }],
          resultIndex: 0
        };
        
        // 如果有活动的语音识别实例，触发结果
        if (win.mockSpeechRecognitionInstance) {
          win.mockSpeechRecognitionInstance.onresult(mockResult);
        }
      });
    }
  };
}

export { MockSpeechRecognition, MockSpeechSynthesis, MockSpeechSynthesisUtterance }; 