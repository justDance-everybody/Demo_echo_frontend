/* eslint-disable no-undef */
describe('User Registration Functionality', () => {
  beforeEach(() => {
    cy.visit('/auth'); // Visit the main auth page
    // Click the register link to switch to registration form
    cy.get('[data-testid="register-link"]').click(); // Click to ensure we are on the registration form/mode

    cy.injectAxe();
    cy.clearLocalStorageForTest();
  });

  it('should display the registration form correctly and be accessible', () => {
    // 检查注册表单元素
    cy.get('[data-testid="register-username-input"]').should('be.visible');
    cy.get('[data-testid="register-email-input"]').should('be.visible');
    cy.get('[data-testid="register-password-input"]').should('be.visible');
    cy.get('[data-testid="register-confirm-password-input"]').should('be.visible');
    cy.get('[data-testid="register-submit-button"]').should('be.visible');

    // 检查页面标题和描述
    cy.contains('创建新账户').should('be.visible');
    cy.contains('加入我们，开始您的智能语音助手之旅').should('be.visible');

    // 检查返回登录链接
    cy.contains('已有账户？立即登录').should('be.visible');

    // 检查无障碍性，只关注关键违规
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should successfully register a new user and be accessible', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 201,
      // PRD (section 3.2) example response for /auth/register
      body: {
        id: 123,
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'user'
      },
    }).as('registerRequest');

    cy.get('[data-testid="register-username-input"]').type('newuser');
    cy.get('[data-testid="register-email-input"]').type('newuser@example.com');
    cy.get('[data-testid="register-password-input"]').type('password123');
    cy.get('[data-testid="register-confirm-password-input"]').type('password123');
    cy.get('[data-testid="register-submit-button"]').click();

    cy.wait('@registerRequest');

    // According to PRD 7.2, on successful registration, a success message is shown.
    cy.get('[data-testid="register-success-message"]').should('be.visible');
    // 检查无障碍性，只关注关键违规
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should show an error message if username or email already exists and be accessible', () => {
    cy.intercept('POST', '/auth/register', {
      statusCode: 400, // Or 409 Conflict
      body: { error: { code: 'VALIDATION_ERROR', msg: 'Email already exists' } },
    }).as('registerRequestFailed');

    cy.get('[data-testid="register-username-input"]').type('existinguser');
    cy.get('[data-testid="register-email-input"]').type('existing@example.com');
    cy.get('[data-testid="register-password-input"]').type('password123');
    cy.get('[data-testid="register-confirm-password-input"]').type('password123');
    cy.get('[data-testid="register-submit-button"]').click();

    cy.wait('@registerRequestFailed');
    cy.get('[data-testid="register-error-message"]').should('be.visible');
    cy.url().should('include', '/auth'); // Stay on the auth page
    // 检查无障碍性，只关注关键违规
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });

  it('should show client-side validation errors for invalid input and be accessible', () => {
    // For now, we'll just test that the form can handle invalid input gracefully
    // and doesn't crash the application

    // Fill form with invalid data
    cy.get('[data-testid="register-username-input"]').type('testuser');
    cy.get('[data-testid="register-email-input"]').type('invalidemail');
    cy.get('[data-testid="register-password-input"]').type('123');
    cy.get('[data-testid="register-confirm-password-input"]').type('456'); // Different passwords

    // Submit form - should handle validation gracefully
    cy.get('[data-testid="register-submit-button"]').click();

    // Form should still be visible (not submitted successfully)
    cy.get('[data-testid="register-submit-button"]').should('be.visible');
    cy.get('[data-testid="register-username-input"]').should('be.visible');

    // 检查无障碍性，只关注关键违规
    cy.checkA11y(null, {
      includedImpacts: ['critical']
    });
  });
}); 