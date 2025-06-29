import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from './common/Toast';
import apiClient from '../services/apiClient';
import styled from 'styled-components';

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  background: linear-gradient(to bottom, rgba(135, 206, 250, 0.05), rgba(255, 255, 255, 0.95));
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(10px);
  
  [data-theme="dark"] & {
    background: linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95));
    border: 1px solid rgba(148, 163, 184, 0.1);
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: white;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  
  [data-theme="dark"] & {
    background-color: var(--surface);
  }
`;

const Icon = styled.div`
  font-size: 1.75rem;
  color: var(--primary-color);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
  color: var(--text-color);
`;

const Subtitle = styled.p`
  color: var(--text-secondary, rgba(107, 114, 128, 1));
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.5;
  
  [data-theme="dark"] & {
    color: rgba(156, 163, 175, 1);
  }
`;

const FormFields = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary, rgba(156, 163, 175, 1));
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(229, 231, 235, 1));
  background-color: var(--input-bg, rgba(249, 250, 251, 1));
  color: var(--text-color);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: rgba(59, 130, 246, 0.2);
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: var(--text-secondary, rgba(156, 163, 175, 1));
  }
  
  [data-theme="dark"] & {
    background-color: var(--surface);
    border-color: var(--border-color, rgba(75, 85, 99, 1));
    
    &:focus {
      ring-color: rgba(59, 130, 246, 0.3);
    }
  }
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: var(--error-color, #ef4444);
  text-align: left;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(to bottom, rgba(55, 65, 81, 1), rgba(17, 24, 39, 1));
  color: white;
  font-weight: 500;
  padding: 12px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  [data-theme="dark"] & {
    background: linear-gradient(to bottom, var(--primary-color), rgba(59, 130, 246, 0.8));
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex-grow: 1;
    border-top: 1px dashed var(--border-color, rgba(229, 231, 235, 1));
  }
  
  span {
    margin: 0 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary, rgba(156, 163, 175, 1));
  }
`;

const SwitchButton = styled.button`
  width: 100%;
  background: none;
  border: 1px solid var(--border-color, rgba(229, 231, 235, 1));
  color: var(--text-color);
  font-weight: 500;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--hover-bg, rgba(249, 250, 251, 1));
  }
  
  [data-theme="dark"] & {
    border-color: var(--border-color, rgba(75, 85, 99, 1));
    
    &:hover {
      background-color: var(--hover-bg, rgba(55, 65, 81, 0.5));
    }
  }
`;

const SuccessMessage = styled.div`
  color: white;
  background-color: var(--success-color, #10b981);
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--success-color, #10b981);
`;

const GlobalError = styled.div`
  color: var(--error-color, #ef4444);
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  padding: 0.75rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const RegisterForm = ({ onLoginClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { clearError } = useContext(AuthContext);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证
    const errors = {};
    if (!username) errors.username = '请输入用户名';
    if (!password) errors.password = '请输入密码';
    if (password.length < 6) errors.password = '密码长度不能少于6位';
    if (password !== confirmPassword) errors.confirmPassword = '两次密码输入不一致';
    if (!email) errors.email = '请输入邮箱';
    if (email && !validateEmail(email)) errors.email = '请输入有效的邮箱地址';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // 清除错误和成功消息
    setFormErrors({});
    setSuccessMessage('');
    setError('');
    setLoading(true);

    try {
      // 直接调用API而不通过AuthContext，避免立即重定向
      const response = await apiClient.register(username, password, email);
      if (response.success) {
        setSuccessMessage('注册成功！正在为您跳转...');
        // 清空表单
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        // 延迟2秒后再设置认证状态，让用户看到成功消息
        setTimeout(() => {
          // 手动设置认证状态
          localStorage.setItem('token', response.token);
          if (response.user?.role) {
            localStorage.setItem('userRole', response.user.role);
          }
          // 这里可以触发页面重定向或其他逻辑
          window.location.href = '/'; // 简单的重定向到首页
        }, 2000);
      } else {
        setError(response.message || '注册失败');
        toast.error(response.message || '注册失败');
      }
    } catch (err) {
      const errorMessage = err.message || '注册失败，请重试';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <IconContainer>
        <Icon>📝</Icon>
      </IconContainer>

      <Title>创建新账户</Title>
      <Subtitle>
        加入我们，开始您的智能语音助手之旅
      </Subtitle>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <FormFields>
          <InputGroup>
            <InputIcon>👤</InputIcon>
            <Input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="register-username-input"
              aria-label="用户名"
            />
            {formErrors.username && (
              <ErrorMessage>{formErrors.username}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputIcon>📧</InputIcon>
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="register-email-input"
              aria-label="邮箱地址"
            />
            {formErrors.email && (
              <ErrorMessage data-testid="register-email-validation-error">
                {formErrors.email}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputIcon>🔒</InputIcon>
            <Input
              type="password"
              placeholder="密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="register-password-input"
              aria-label="密码"
            />
            {formErrors.password && (
              <ErrorMessage data-testid="register-password-validation-error">
                {formErrors.password}
              </ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <InputIcon>🔒</InputIcon>
            <Input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="register-confirm-password-input"
              aria-label="确认密码"
            />
            {formErrors.confirmPassword && (
              <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>
            )}
          </InputGroup>
        </FormFields>

        <SubmitButton
          type="submit"
          disabled={loading}
          data-testid="register-submit-button"
        >
          {loading ? '注册中...' : '立即注册'}
        </SubmitButton>
      </form>

      <Divider>
        <span>或者</span>
      </Divider>

      <SwitchButton
        type="button"
        onClick={onLoginClick}
      >
        已有账户？立即登录
      </SwitchButton>

      {successMessage && (
        <SuccessMessage
          role="alert"
          aria-live="polite"
          data-testid="register-success-message"
        >
          {successMessage}
        </SuccessMessage>
      )}

      {error && (
        <GlobalError
          role="alert"
          aria-live="polite"
          data-testid="register-error-message"
        >
          {error}
        </GlobalError>
      )}
    </FormContainer>
  );
};

export default RegisterForm; 