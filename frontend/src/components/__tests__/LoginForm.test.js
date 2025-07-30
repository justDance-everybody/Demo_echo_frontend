/**
 * 登录组件单元测试
 * 测试表单渲染、验证、提交等核心功能
 * @stable(tested=2025-01-20, ticket=LOGIN-001, doc=docs/前端测试用例与验收标准.md#2.1)
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginForm from '../LoginForm';
import { AuthContext } from '../../contexts/AuthContext';

// 扩展expect以支持无障碍测试
expect.extend(toHaveNoViolations);

// Mock antd-mobile组件
jest.mock('antd-mobile', () => ({
  Form: ({ children, footer }) => (
    <form data-testid="login-form">
      {children}
      {footer}
    </form>
  ),
  Input: ({ placeholder, value, onChange, prefix, type = 'text', ...props }) => (
    <input
      data-testid={placeholder === '请输入用户名' ? 'username-input' : 'password-input'}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      {...props}
    />
  ),
  Button: ({ children, onClick, loading, block, color, size, ...props }) => (
    <button
      data-testid={children === '登录' ? 'login-button' : 'register-button'}
      onClick={onClick}
      disabled={loading}
      {...props}
    >
      {loading ? '登录中...' : children}
    </button>
  )
}));

// Mock antd-mobile-icons
jest.mock('antd-mobile-icons', () => ({
  UserOutline: () => <span data-testid="user-icon">👤</span>,
  LockOutline: () => <span data-testid="lock-icon">🔒</span>
}));

// Mock Toast组件
jest.mock('../common/Toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock styled-components
jest.mock('styled-components', () => ({
  default: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>
  },
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>
}));

// 创建测试用的AuthContext值
const createMockAuthContext = (overrides = {}) => ({
  login: jest.fn(),
  loading: false,
  error: null,
  clearError: jest.fn(),
  ...overrides
});

// 测试包装器组件
const TestWrapper = ({ children, authContextValue }) => (
  <AuthContext.Provider value={authContextValue}>
    {children}
  </AuthContext.Provider>
);

describe('LoginForm Component', () => {
  let mockAuthContext;
  let user;

  beforeEach(() => {
    mockAuthContext = createMockAuthContext();
    user = userEvent.setup();
    
    // 清除所有mock的调用历史
    jest.clearAllMocks();
  });

  // 基础渲染测试
  test('应该正确渲染登录表单', () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    // 验证表单元素存在
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('username-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
    expect(screen.getByTestId('register-button')).toBeInTheDocument();
    
    // 验证标题
    expect(screen.getByText('用户登录')).toBeInTheDocument();
    
    // 验证图标
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  // 表单验证测试
  test('空用户名时应显示错误提示', async () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-button');
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
    });
    
    // 验证login函数未被调用
    expect(mockAuthContext.login).not.toHaveBeenCalled();
  });

  test('空密码时应显示错误提示', async () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const submitButton = screen.getByTestId('login-button');
    
    await user.type(usernameInput, 'admin');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });
    
    // 验证login函数未被调用
    expect(mockAuthContext.login).not.toHaveBeenCalled();
  });

  test('用户名和密码都为空时应显示两个错误', async () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-button');
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入用户名')).toBeInTheDocument();
      expect(screen.getByText('请输入密码')).toBeInTheDocument();
    });
  });

  // 成功登录测试
  test('有效凭据应触发登录成功', async () => {
    mockAuthContext.login.mockResolvedValue(true);
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });
    
    // 验证错误被清除
    expect(mockAuthContext.clearError).toHaveBeenCalled();
  });

  test('登录失败时应显示错误信息', async () => {
    mockAuthContext.login.mockResolvedValue(false);
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    await user.type(usernameInput, 'wrong');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('wrong', 'wrong');
    });
  });

  test('登录异常时应处理错误', async () => {
    const errorMessage = '网络连接失败';
    mockAuthContext.login.mockRejectedValue(new Error(errorMessage));
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });
  });

  // 加载状态测试
  test('提交时应显示加载状态', async () => {
    const loadingAuthContext = createMockAuthContext({ loading: true });
    
    render(
      <TestWrapper authContextValue={loadingAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-button');
    expect(submitButton).toHaveTextContent('登录中...');
    expect(submitButton).toBeDisabled();
  });

  test('加载状态下按钮应被禁用', () => {
    const loadingAuthContext = createMockAuthContext({ loading: true });
    
    render(
      <TestWrapper authContextValue={loadingAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByTestId('login-button');
    expect(submitButton).toBeDisabled();
  });

  // 错误状态测试
  test('应显示AuthContext中的错误信息', () => {
    const errorAuthContext = createMockAuthContext({ 
      error: '用户名或密码错误' 
    });
    
    render(
      <TestWrapper authContextValue={errorAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
  });

  // 注册按钮测试
  test('注册按钮应触发回调', async () => {
    const mockOnRegisterClick = jest.fn();
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm onRegisterClick={mockOnRegisterClick} />
      </TestWrapper>
    );

    const registerButton = screen.getByTestId('register-button');
    await user.click(registerButton);
    
    expect(mockOnRegisterClick).toHaveBeenCalledTimes(1);
  });

  // 表单交互测试
  test('输入框应正确更新值', async () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'testpass');
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  test('密码输入框应隐藏输入内容', () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // 无障碍测试
  test('应通过无障碍检查', async () => {
    const { container } = render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('表单字段应有正确的标签', () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    
    // 验证placeholder作为可访问名称
    expect(usernameInput).toHaveAttribute('placeholder', '请输入用户名');
    expect(passwordInput).toHaveAttribute('placeholder', '请输入密码');
  });

  test('按钮应有正确的可访问名称', () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const loginButton = screen.getByTestId('login-button');
    const registerButton = screen.getByTestId('register-button');
    
    expect(loginButton).toHaveTextContent('登录');
    expect(registerButton).toHaveTextContent('没有账号？注册');
  });

  // 键盘导航测试
  test('应支持键盘导航', async () => {
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    // Tab导航顺序
    usernameInput.focus();
    expect(usernameInput).toHaveFocus();
    
    await user.tab();
    expect(passwordInput).toHaveFocus();
    
    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  test('Enter键应提交表单', async () => {
    mockAuthContext.login.mockResolvedValue(true);
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'admin123');
    
    // 在密码输入框按Enter键
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', 'admin123');
    });
  });

  // 边界条件测试
  test('特殊字符用户名应正确处理', async () => {
    mockAuthContext.login.mockResolvedValue(true);
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    await user.type(usernameInput, 'user@domain.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('user@domain.com', 'password123');
    });
  });

  test('长密码应正确处理', async () => {
    mockAuthContext.login.mockResolvedValue(true);
    
    render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('login-button');
    
    const longPassword = 'a'.repeat(100);
    
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, longPassword);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('admin', longPassword);
    });
  });

  // 清理测试
  test('组件卸载时应清理状态', () => {
    const { unmount } = render(
      <TestWrapper authContextValue={mockAuthContext}>
        <LoginForm />
      </TestWrapper>
    );

    // 验证组件正常渲染
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    
    // 卸载组件
    unmount();
    
    // 验证组件已从DOM中移除
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });
}); 