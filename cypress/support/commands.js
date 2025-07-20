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

import 'cypress-axe';

// 添加Web Speech API Mock支持
Cypress.Commands.add('setupMockSpeechAPI', () => {
  cy.window().then((win) => {
    // Mock SpeechRecognition
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
        
        // 存储实例到window以便测试控制
        win.mockSpeechRecognitionInstance = this;
      }

      start() {
        this.isListening = true;
        setTimeout(() => {
          if (this.onstart) this.onstart();
        }, 100);
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

    // Mock SpeechSynthesis
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

      getVoices() {
        return [
          { name: 'Mock Chinese Voice', lang: 'zh-CN', default: true }
        ];
      }
    }

    // Mock SpeechSynthesisUtterance
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
      }
    }

    // 替换原生API
    win.SpeechRecognition = MockSpeechRecognition;
    win.webkitSpeechRecognition = MockSpeechRecognition;
    win.speechSynthesis = new MockSpeechSynthesis();
    win.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    
    console.log('🎤 Mock Web Speech API setup complete');
  });
});

// 模拟语音识别结果
Cypress.Commands.add('mockSpeechResult', (transcript) => {
  cy.window().then((win) => {
    const mockResult = {
      results: [{
        0: { transcript },
        isFinal: true
      }],
      resultIndex: 0
    };
    
    if (win.mockSpeechRecognitionInstance && win.mockSpeechRecognitionInstance.onresult) {
      win.mockSpeechRecognitionInstance.onresult(mockResult);
    }
  });
});

// 检查语音识别状态
Cypress.Commands.add('checkSpeechRecognitionState', (expectedState) => {
  cy.window().then((win) => {
    expect(win.mockSpeechRecognitionInstance.isListening).to.equal(expectedState);
  });
});