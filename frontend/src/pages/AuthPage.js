import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../contexts/AuthContext';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(147, 51, 234, 0.1) 25%, 
    rgba(236, 72, 153, 0.1) 50%, 
    rgba(245, 158, 11, 0.1) 75%, 
    rgba(16, 185, 129, 0.1) 100%
  );
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  
  [data-theme="dark"] & {
    background: linear-gradient(135deg, 
      rgba(15, 23, 42, 0.95) 0%, 
      rgba(30, 41, 59, 0.95) 25%, 
      rgba(51, 65, 85, 0.95) 50%, 
      rgba(71, 85, 105, 0.95) 75%, 
      rgba(30, 41, 59, 0.95) 100%
    );
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(147, 51, 234, 0.05) 0%, transparent 70%);
    animation: float 15s ease-in-out infinite reverse;
    z-index: 0;
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  span {
    font-size: 2.5rem;
  }
  
  @media (max-width: 640px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    
    span {
      font-size: 2rem;
    }
  }
`;

const WelcomeText = styled.p`
  color: var(--text-secondary, rgba(107, 114, 128, 1));
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 400px;
  
  [data-theme="dark"] & {
    color: rgba(156, 163, 175, 1);
  }
  
  @media (max-width: 640px) {
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
`;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 如果已经登录，重定向到来源页面或首页
  useEffect(() => {
    console.log('AuthPage useEffect - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      let from = location.state?.from || '/';
      // TODO 暂时无user页面
      if (from === '/user') {
        from = '/';
      }
      console.log('用户已认证，准备跳转到:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <PageContainer aria-label="用户认证页面">
      <ContentWrapper>
        <Logo aria-label="应用标识">
          <span role="img" aria-label="Echo logo">🔊</span>
          Echo AI
        </Logo>

        <WelcomeText>
          {isLogin
            ? '欢迎回来！登录您的账户以继续使用智能语音助手服务'
            : '加入我们的智能语音助手平台，开启全新的AI体验之旅'
          }
        </WelcomeText>

        <section aria-labelledby={isLogin ? "login-title" : "register-title"}>
          {isLogin ? (
            <LoginForm onRegisterClick={toggleAuthMode} />
          ) : (
            <RegisterForm onLoginClick={toggleAuthMode} />
          )}
        </section>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AuthPage; 