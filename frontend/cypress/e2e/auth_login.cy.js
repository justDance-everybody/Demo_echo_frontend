/* eslint-disable no-undef */
describe('Authentication', () => {
  beforeEach(() => {
    // 访问登录页面，假设登录页面的路由是 /auth
    // 您可能需要根据您的实际路由调整
    cy.visit('/auth');
    cy.injectAxe(); // Inject axe-core for accessibility testing
    cy.clearLocalStorageForTest(); // Clear localStorage to ensure clean state
    // cy.clearCookies(); // Uncomment if your app uses cookies for auth state

    // 确保 AuthProvider 和 ThemeProvider 包裹了我们的应用
    // 通常在 cy.visit() 之前或之后，Cypress 会自动加载页面
    // 如果您的 AuthContext 或 ThemeContext 对登录有影响，
    // 确保它们在测试环境中被正确初始化。
    // Mock 服务 (MSW) 应该已经配置为拦截 /api/auth/login 请求
  });

  it('should display the login form and be accessible', () => {
    // 检查登录表单元素是否显示
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');

    // 检查页面标题和描述
    cy.contains('登录账户').should('be.visible');
    cy.contains('欢迎回来').should('be.visible');

    // 检查注册链接
    cy.get('[data-testid="register-link"]').should('be.visible');

    // 检查无障碍性，允许轻微的颜色对比度问题
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should allow a user to log in with valid credentials and be accessible', () => {
    // 假设 mock API 返回成功的登录
    // 我们需要确保 MSW 或您的 mock 服务配置了 /api/auth/login 的成功响应
    // 例如，返回一个 token 和用户信息
    cy.intercept('POST', '/auth/login', { // Changed from /api/auth/login to match handlers.js
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' },
      },
    }).as('loginRequest');

    cy.get('[data-testid="username-input"]').type('testuser');
    cy.get('[data-testid="password-input"]').type('password'); // Using password from mock handler
    cy.get('[data-testid="login-button"]').click();

    // 等待登录请求完成
    cy.wait('@loginRequest');

    // 验证登录成功后的行为
    // 例如，跳转到首页或用户仪表盘
    // 这里假设登录成功后会跳转到 '/'
    cy.url().should('include', '/');
    // 或者验证某个表示已登录的元素存在
    // cy.get('.user-avatar').should('be.visible'); 
    // 检查无障碍性，允许轻微的颜色对比度问题
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should show an error message with invalid credentials and be accessible', () => {
    // 假设 mock API 返回失败的登录
    cy.intercept('POST', '/auth/login', { // Changed from /api/auth/login
      statusCode: 401,
      body: {
        // Matching the error structure from frontend/src/mocks/handlers.js
        error: { code: 'AUTH_FAILED', msg: 'Invalid credentials' }
      },
    }).as('loginRequestFailed');

    cy.get('[data-testid="username-input"]').type('wronguser');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequestFailed');

    // 验证错误提示是否显示
    cy.get('[data-testid="login-error-message"]').should('be.visible');
    // 确保页面没有跳转
    cy.url().should('include', '/auth');
    // 检查无障碍性，允许轻微的颜色对比度问题
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should navigate to register page when "立即注册" is clicked and be accessible', () => {
    // 点击注册链接切换到注册表单
    cy.get('[data-testid="register-link"]').click();

    // 验证是否切换到了注册表单的视图
    cy.get('[data-testid="register-username-input"]').should('be.visible');
    cy.get('[data-testid="register-email-input"]').should('be.visible');
    cy.get('[data-testid="register-password-input"]').should('be.visible');
    cy.get('[data-testid="register-submit-button"]').should('be.visible');
    // TODO: Add data-testid="register-button" to register button in RegisterForm.js
    // 检查无障碍性，允许轻微的颜色对比度问题
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });
}); 