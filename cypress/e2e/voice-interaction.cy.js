describe('语音交互功能', () => {
  beforeEach(() => {
    // 设置Mock API
    cy.setupMockSpeechAPI();
    
    // 登录为普通用户
    cy.visit('/auth');
    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    
    // 等待跳转到首页
    cy.url().should('include', '/');
  });

  it('CORE-001: 成功完成一次任务 (使用Mock)', () => {
    // 1. 点击录音按钮
    cy.get('[data-testid="voice-record-button"]').click();
    
    // 2. 验证按钮状态变为"停止"
    cy.get('[data-testid="voice-record-button"]').should('contain', '停止');
    
    // 3. 验证语音识别已启动
    cy.checkSpeechRecognitionState(true);
    
    // 4. 模拟语音识别结果
    cy.mockSpeechResult('查询天气');
    
    // 5. 验证识别结果显示
    cy.get('[data-testid="voice-result"]').should('contain', '查询天气');
    
    // 6. 验证进度条更新
    cy.get('[data-testid="progress-bar"]').should('be.visible');
    cy.get('[data-testid="progress-text"]').should('contain', '理解中');
    
    // 7. 等待API调用完成
    cy.intercept('POST', '/v1/api/interpret', {
      statusCode: 200,
      body: {
        type: 'confirm',
        action: 'weather',
        params: { location: '北京' },
        confirmText: '您想查询北京的天气，是否确认？'
      }
    }).as('interpretApi');
    
    cy.wait('@interpretApi');
    
    // 8. 验证确认阶段
    cy.get('[data-testid="confirm-text"]').should('contain', '您想查询北京的天气，是否确认？');
    
    // 9. 模拟用户确认
    cy.mockSpeechResult('确认');
    
    // 10. 验证执行API调用
    cy.intercept('POST', '/v1/api/execute', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          weather: '北京今天晴天，温度20°C'
        }
      }
    }).as('executeApi');
    
    cy.wait('@executeApi');
    
    // 11. 验证最终结果展示
    cy.get('[data-testid="result-display"]').should('contain', '北京今天晴天，温度20°C');
    cy.get('[data-testid="progress-text"]').should('contain', '完成');
  });

  it('CORE-002: 用户在确认环节取消操作 (使用Mock)', () => {
    // 1-6. 重复CORE-001的步骤1-6
    cy.get('[data-testid="voice-record-button"]').click();
    cy.mockSpeechResult('查询天气');
    
    // 7. 等待解析API
    cy.intercept('POST', '/v1/api/interpret', {
      statusCode: 200,
      body: {
        type: 'confirm',
        action: 'weather',
        params: { location: '北京' },
        confirmText: '您想查询北京的天气，是否确认？'
      }
    }).as('interpretApi');
    
    cy.wait('@interpretApi');
    
    // 8. 用户选择取消
    cy.mockSpeechResult('取消');
    
    // 9. 验证流程中断
    cy.get('[data-testid="cancel-message"]').should('contain', '操作已取消');
    
    // 10. 验证未调用执行API
    cy.intercept('POST', '/v1/api/execute', { statusCode: 200 }).as('executeApi');
    cy.get('@executeApi').should('not.exist');
    
    // 11. 验证页面状态重置
    cy.get('[data-testid="voice-record-button"]').should('contain', '开始录音');
    cy.get('[data-testid="progress-bar"]').should('not.exist');
  });

  it('CORE-003: 意图理解失败 (使用Mock)', () => {
    // 1. 开始录音
    cy.get('[data-testid="voice-record-button"]').click();
    cy.mockSpeechResult('这是一个无法理解的指令');
    
    // 2. 模拟解析失败
    cy.intercept('POST', '/v1/api/interpret', {
      statusCode: 400,
      body: {
        error: {
          code: 'INTENT_PARSE_FAILED',
          message: '无法理解您的指令，请重新说明'
        }
      }
    }).as('interpretApi');
    
    cy.wait('@interpretApi');
    
    // 3. 验证错误提示
    cy.get('[data-testid="error-toast"]').should('contain', '无法理解您的指令，请重新说明');
    
    // 4. 验证页面状态重置
    cy.get('[data-testid="voice-record-button"]').should('contain', '开始录音');
    cy.get('[data-testid="progress-bar"]').should('not.exist');
  });

  it('CORE-004: 录音超时 (使用Mock)', () => {
    // 1. 开始录音
    cy.get('[data-testid="voice-record-button"]').click();
    
    // 2. 验证录音开始
    cy.checkSpeechRecognitionState(true);
    
    // 3. 等待超时时间 (模拟60秒超时)
    cy.wait(60000);
    
    // 4. 验证超时提示
    cy.get('[data-testid="timeout-message"]').should('contain', '录音超时');
    
    // 5. 验证录音自动停止
    cy.checkSpeechRecognitionState(false);
    cy.get('[data-testid="voice-record-button"]').should('contain', '开始录音');
  });

  it('语音权限测试：验证Mock API正常工作', () => {
    // 验证Mock API已正确设置
    cy.window().then((win) => {
      expect(win.SpeechRecognition).to.exist;
      expect(win.speechSynthesis).to.exist;
      expect(win.SpeechSynthesisUtterance).to.exist;
    });
    
    // 验证可以创建语音识别实例
    cy.window().then((win) => {
      const recognition = new win.SpeechRecognition();
      expect(recognition).to.exist;
      expect(recognition.start).to.be.a('function');
      expect(recognition.stop).to.be.a('function');
    });
  });
}); 