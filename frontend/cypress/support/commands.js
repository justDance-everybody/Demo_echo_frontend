// frontend/cypress/support/commands.js

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... }) 

// Helper command to get item from localStorage
Cypress.Commands.add("getLocalStorage", (key) => {
  return cy.window().then((window) => {
    return window.localStorage.getItem(key);
  });
});

// Helper command to set item in localStorage
Cypress.Commands.add("setLocalStorage", (key, value) => {
  cy.window().then((window) => {
    window.localStorage.setItem(key, value);
  });
});

// Helper command to clear localStorage for the current domain
Cypress.Commands.add("clearLocalStorageForTest", () => {
  cy.window().then((window) => {
    window.localStorage.clear();
  });
});

// Helper command to save localStorage snapshot for debugging
Cypress.Commands.add("saveLocalStorageSnapshot", (name) => {
  cy.window().then((window) => {
    const snapshot = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const storageKey = window.localStorage.key(i);
      if (storageKey) {
        snapshot[storageKey] = window.localStorage.getItem(storageKey);
      }
    }
    // Ensure the directory exists
    cy.exec('mkdir -p cypress/localstorage-snapshots', { failOnNonZeroExit: false });
    cy.writeFile(`cypress/localstorage-snapshots/${name}.json`, snapshot);
  });
});

// Command to get an element by its data-testid attribute
Cypress.Commands.add("getByTestId", (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
}); 

// 通用认证设置命令
Cypress.Commands.add("setupAuth", (userType = 'user') => {
  const authData = {
    user: {
      token: 'abc',
      userRole: 'user'
    },
    developer: {
      token: 'abc-dev', 
      userRole: 'developer'
    }
  };
  
  const auth = authData[userType] || authData.user;
  
  cy.setLocalStorage('token', auth.token);
  cy.setLocalStorage('userRole', auth.userRole);
  
  // 可选：验证设置成功
  cy.getLocalStorage('token').should('eq', auth.token);
  cy.getLocalStorage('userRole').should('eq', auth.userRole);
});

// 模拟语音输入结果
Cypress.Commands.add("simulateSpeechResult", (text) => {
  cy.window().then((win) => {
    if (win.voiceInterfaceTestHelper) {
      console.log(`[Cypress] 调用语音模拟: ${text}`);
      win.voiceInterfaceTestHelper.simulateVoiceResult(text);
    } else {
      console.error('[Cypress] 语音测试助手未找到，确保VoiceInterface处于testMode');
      throw new Error('VoiceInterface test helper not available');
    }
  });
});

// 检查语音接口状态
Cypress.Commands.add("getVoiceInterfaceState", () => {
  return cy.window().then((win) => {
    if (win.voiceInterfaceTestHelper) {
      return {
        currentState: win.voiceInterfaceTestHelper.getCurrentState(),
        isListening: win.voiceInterfaceTestHelper.isListening()
      };
    }
    return null;
  });
});

// ==== Web Speech API Mock 支持 ====

// 设置Mock Web Speech API
Cypress.Commands.add("setupMockSpeechAPI", (options = {}) => {
  cy.window().then((win) => {
    // 导入并安装Mock
    const mockOptions = {
      shouldReturnResult: options.shouldReturnResult || false,
      mockResult: options.mockResult || '你好',
      shouldSimulateError: options.shouldSimulateError || false,
      mockError: options.mockError || 'not-allowed',
      autoStopTimeout: options.autoStopTimeout || null,
      synthesisEnabled: options.synthesisEnabled !== false,
      ...options
    };

    // 设置全局Mock状态
    win.mockSpeechState = mockOptions;

    // 创建Mock SpeechRecognition
    win.MockSpeechRecognition = class MockSpeechRecognition {
      constructor() {
        this.continuous = false;
        this.lang = 'zh-CN';
        this.interimResults = false;
        this.maxAlternatives = 1;
        this.onstart = null;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
        this._isStarted = false;
        this._timeoutId = null;
        win.mockRecognitionInstance = this;
      }

      start() {
        if (this._isStarted) {
          const error = new Error('recognition already started');
          error.name = 'InvalidStateError';
          throw error;
        }

        this._isStarted = true;
        console.log('🎤 Mock SpeechRecognition: Starting...');

        setTimeout(() => {
          if (this.onstart) {
            this.onstart();
            console.log('🎤 Mock SpeechRecognition: Started');
          }
        }, 100);

        if (mockOptions.autoStopTimeout) {
          this._timeoutId = setTimeout(() => {
            if (this._isStarted) {
              this.stop();
            }
          }, mockOptions.autoStopTimeout);
        }

        if (mockOptions.shouldSimulateError) {
          setTimeout(() => {
            if (this._isStarted && this.onerror) {
              this.onerror({ error: mockOptions.mockError });
              console.log('🎤 Mock SpeechRecognition: Error -', mockOptions.mockError);
            }
          }, 200);
        }
      }

      stop() {
        if (!this._isStarted) return;

        this._isStarted = false;
        console.log('🎤 Mock SpeechRecognition: Stopping...');

        if (this._timeoutId) {
          clearTimeout(this._timeoutId);
          this._timeoutId = null;
        }

        if (mockOptions.shouldReturnResult && this.onresult) {
          setTimeout(() => {
            const event = {
              results: [{
                0: { transcript: mockOptions.mockResult },
                isFinal: true
              }],
              resultIndex: 0
            };
            this.onresult(event);
            console.log('🎤 Mock SpeechRecognition: Result -', mockOptions.mockResult);
          }, 50);
        }

        setTimeout(() => {
          if (this.onend) {
            this.onend();
            console.log('🎤 Mock SpeechRecognition: Ended');
          }
        }, 100);
      }

      abort() {
        this._isStarted = false;
        if (this._timeoutId) {
          clearTimeout(this._timeoutId);
          this._timeoutId = null;
        }
        if (this.onend) {
          this.onend();
        }
      }

      simulateResult(transcript) {
        if (this._isStarted && this.onresult) {
          const event = {
            results: [{
              0: { transcript: transcript },
              isFinal: true
            }],
            resultIndex: 0
          };
          this.onresult(event);
          console.log('🎤 Mock SpeechRecognition: Manual Result -', transcript);
        }
      }

      simulateError(error) {
        if (this._isStarted && this.onerror) {
          this.onerror({ error: error });
          console.log('🎤 Mock SpeechRecognition: Manual Error -', error);
        }
      }
    };

    // 创建Mock SpeechSynthesis
    win.MockSpeechSynthesis = class MockSpeechSynthesis {
      constructor() {
        this.pending = false;
        this.speaking = false;
        this.paused = false;
        this.onvoiceschanged = null;
        this._voices = [
          { name: 'Chinese Female', lang: 'zh-CN', voiceURI: 'zh-CN-Female', localService: true },
          { name: 'Chinese Male', lang: 'zh-CN', voiceURI: 'zh-CN-Male', localService: true }
        ];
      }

      speak(utterance) {
        if (!mockOptions.synthesisEnabled) {
          console.log('🔊 Mock SpeechSynthesis: Disabled');
          return;
        }

        console.log('🔊 Mock SpeechSynthesis: Speaking -', utterance.text);
        this.speaking = true;
        this.pending = true;

        setTimeout(() => {
          if (utterance.onstart) {
            utterance.onstart();
          }
        }, 50);

        setTimeout(() => {
          this.speaking = false;
          this.pending = false;
          if (utterance.onend) {
            utterance.onend();
          }
        }, 1000 + utterance.text.length * 50);
      }

      cancel() {
        this.speaking = false;
        this.pending = false;
        console.log('🔊 Mock SpeechSynthesis: Cancelled');
      }

      pause() {
        this.paused = true;
        console.log('🔊 Mock SpeechSynthesis: Paused');
      }

      resume() {
        this.paused = false;
        console.log('🔊 Mock SpeechSynthesis: Resumed');
      }

      getVoices() {
        return this._voices;
      }
    };

    // 创建Mock SpeechSynthesisUtterance
    win.MockSpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text || '';
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
    };

    // 安装Mock到全局
    win.SpeechRecognition = win.MockSpeechRecognition;
    win.webkitSpeechRecognition = win.MockSpeechRecognition;
    
    // speechSynthesis是只读属性，需要使用defineProperty重写
    try {
      Object.defineProperty(win, 'speechSynthesis', {
        value: new win.MockSpeechSynthesis(),
        writable: false,
        configurable: true
      });
    } catch (e) {
      console.warn('无法重写speechSynthesis，使用现有实例');
    }
    
    win.SpeechSynthesisUtterance = win.MockSpeechSynthesisUtterance;

    win.mockWebSpeechAPIInstalled = true;
    console.log('✅ Cypress Mock Web Speech API installed successfully!');
  });
});

// 配置Mock行为的命令
Cypress.Commands.add("configureMockSpeech", (config) => {
  cy.window().then((win) => {
    if (win.mockSpeechState) {
      Object.assign(win.mockSpeechState, config);
      console.log('🎯 Mock配置已更新:', config);
    }
  });
});

// 手动触发语音识别结果
Cypress.Commands.add("simulateSpeechResult", (transcript) => {
  cy.window().then((win) => {
    if (win.mockRecognitionInstance) {
      win.mockRecognitionInstance.simulateResult(transcript);
    }
  });
});

// 手动触发语音识别错误
Cypress.Commands.add("simulateSpeechError", (error) => {
  cy.window().then((win) => {
    if (win.mockRecognitionInstance) {
      win.mockRecognitionInstance.simulateError(error);
    }
  });
}); 