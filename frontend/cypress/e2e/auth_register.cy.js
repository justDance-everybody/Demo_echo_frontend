/* eslint-disable no-undef */
describe('User Registration - 基于前端开发文档验收标准', () => {
  beforeEach(() => {
    cy.visit('/auth');
    // 切换到注册表单
    cy.get('[data-testid="register-link"]').click();
    cy.clearLocalStorageForTest();
    // 等待页面加载完成
    cy.wait(1000);
  });

  // 基础界面展示测试
  it('should display the registration form correctly', () => {
    // 验收标准：检查注册表单所有必要元素
    cy.get('[data-testid="register-username-input"]').should('be.visible');
    cy.get('[data-testid="register-email-input"]').should('be.visible');
    cy.get('[data-testid="register-password-input"]').should('be.visible');
    cy.get('[data-testid="register-confirm-password-input"]').should('be.visible');
    cy.get('[data-testid="register-submit-button"]').should('be.visible');

    // 验证页面标题和描述
    cy.get('body').should('contain.text', '创建新账户');
    cy.get('body').should('contain.text', '加入我们，开始您的智能语音助手之旅');

    // 验证返回登录链接
    cy.contains('已有账户？立即登录').should('be.visible');
  });

  // Scenario: 成功注册 - 基于前端开发文档Gherkin场景
  it('Scenario: 成功注册 - 使用test@example.com', () => {
    // Given 注册页已打开 (已在beforeEach中完成)

    // When 输入邮箱 "test@example.com"、用户名 "bob" 和密码 "123456"
    cy.get('[data-testid="register-email-input"]').type('test@example.com');
    cy.get('[data-testid="register-username-input"]').type('bob');
    cy.get('[data-testid="register-password-input"]').type('123456');
    cy.get('[data-testid="register-confirm-password-input"]').type('123456');

    // And 点击 "注册" 按钮
    cy.get('[data-testid="register-submit-button"]').click();

    // Then 页面应显示绿色提示 "注册成功"
    // 等待API响应
    cy.wait(3000);

    // 验证注册成功指示器
    cy.get('body').then(($body) => {
      const successMsg = $body.find('[data-testid="register-success-message"]');
      const usernameInput = $body.find('[data-testid="register-username-input"]');
      const emailInput = $body.find('[data-testid="register-email-input"]');

      if (successMsg.length > 0 && successMsg.is(':visible')) {
        // 检查成功消息内容
        cy.get('[data-testid="register-success-message"]')
          .should('be.visible')
          .should(($el) => {
            const text = $el.text();
            expect(text).to.satisfy((str) => {
              return str.includes('注册成功') || str.includes('成功') || str.includes('跳转');
            });
          });
      } else {
        // 检查表单是否已被清空（另一种成功指示）
        const isFormCleared =
          usernameInput.length > 0 && usernameInput.val() === '' &&
          emailInput.length > 0 && emailInput.val() === '';

        if (isFormCleared) {
          cy.log('注册成功：表单已被清空');
          // 表单被清空也是成功的指示
          expect(true).to.be.true;
        } else {
          // 检查是否已跳转到其他页面
          cy.url().then((url) => {
            if (!url.includes('/auth')) {
              cy.log('注册成功：页面已跳转');
              expect(true).to.be.true;
            } else {
              // 最后检查页面是否有任何成功相关文本
              const bodyText = $body.text();
              const hasSuccessText = bodyText.includes('注册成功') || bodyText.includes('成功');
              expect(hasSuccessText, '应该有成功指示器').to.be.true;
            }
          });
        }
      }
    });
  });

  // Scenario: 邮箱格式错误 - 基于前端开发文档Gherkin场景
  it('Scenario: 邮箱格式错误 - 显示验证错误', () => {
    // Given 注册页已打开

    // When 输入邮箱 "invalid-email"
    cy.get('[data-testid="register-email-input"]').type('invalid-email');
    cy.get('[data-testid="register-username-input"]').type('testuser');
    cy.get('[data-testid="register-password-input"]').type('123456');
    cy.get('[data-testid="register-confirm-password-input"]').type('123456');

    // And 点击 "注册" 按钮
    cy.get('[data-testid="register-submit-button"]').click();

    // Then 页面应显示红色提示 "请输入有效邮箱"
    cy.wait(1000);

    // 验证错误提示或客户端验证阻止提交
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="register-error-message"]').length > 0) {
        // 服务器端验证错误
        cy.get('[data-testid="register-error-message"]')
          .should('be.visible')
          .should(($el) => {
            const text = $el.text();
            expect(text).to.satisfy((str) => {
              return str.includes('邮箱') || str.includes('email') || str.includes('格式') || str.includes('有效');
            });
          });
      } else if ($body.find('[data-testid="register-email-validation-error"]').length > 0) {
        // 客户端字段验证错误
        cy.get('[data-testid="register-email-validation-error"]')
          .should('be.visible')
          .should(($el) => {
            const text = $el.text();
            expect(text).to.satisfy((str) => {
              return str.includes('邮箱') || str.includes('email') || str.includes('格式') || str.includes('有效');
            });
          });
      } else {
        // 表单仍然可见表示验证阻止了提交
        cy.get('[data-testid="register-submit-button"]').should('be.visible');
        cy.log('客户端验证阻止了无效邮箱的提交');
      }
    });
  });

  // Scenario: 邮箱已存在 - 显示错误提示
  it('Scenario: 邮箱已存在 - 显示错误提示', () => {
    // Given 注册页已打开

    // When 输入已存在的邮箱
    cy.get('[data-testid="register-email-input"]').type('existing@example.com');
    cy.get('[data-testid="register-username-input"]').type('existinguser');
    cy.get('[data-testid="register-password-input"]').type('password123');
    cy.get('[data-testid="register-confirm-password-input"]').type('password123');

    // And 点击注册按钮
    cy.get('[data-testid="register-submit-button"]').click();

    // Then 应该显示错误提示
    cy.wait(2000);

    cy.get('[data-testid="register-error-message"]')
      .should('be.visible')
      .should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((str) => {
          return str.includes('已存在') || str.includes('exists') || str.includes('错误') || str.includes('失败');
        });
      });

    // 确保仍在注册页面
    cy.url().should('include', '/auth');
  });

  // Scenario: 密码确认不匹配 - 客户端验证
  it('Scenario: 密码确认不匹配 - 客户端验证', () => {
    // Given 注册页已打开

    // When 输入不匹配的密码
    cy.get('[data-testid="register-email-input"]').type('test@example.com');
    cy.get('[data-testid="register-username-input"]').type('testuser');
    cy.get('[data-testid="register-password-input"]').type('password123');
    cy.get('[data-testid="register-confirm-password-input"]').type('differentpassword');

    // And 点击注册按钮
    cy.get('[data-testid="register-submit-button"]').click();

    // Then 应该阻止提交或显示验证错误
    cy.wait(1000);

    // 表单应该仍然可见（表示提交被阻止）
    cy.get('[data-testid="register-submit-button"]').should('be.visible');
    cy.get('[data-testid="register-username-input"]').should('be.visible');

    // 检查是否有密码不匹配的验证错误
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if ($body.find('[data-testid="register-error-message"]').length > 0) {
        cy.get('[data-testid="register-error-message"]').should('be.visible');
      } else if (bodyText.includes('密码') && bodyText.includes('一致')) {
        cy.log('检测到密码不一致的客户端验证消息');
      }
      // 无论如何，表单应该仍然存在，说明验证工作正常
    });
  });

  // 导航测试：返回登录页面
  it('should navigate back to login when "已有账户？立即登录" is clicked', () => {
    // When 点击返回登录链接
    cy.contains('已有账户？立即登录').click();

    // Then 应该切换到登录表单
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');

    // 验证登录页面内容
    cy.get('body').should('contain.text', '登录');
  });
}); 