import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';

// 导航栏容器 - 桌面端
const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--nav-bg, var(--surface));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

// Logo样式
const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  
  a {
    color: inherit;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  span {
    font-size: 1.8rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    
    span {
      font-size: 1.4rem;
    }
  }
`;

// 导航链接容器 - 桌面端
const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// 导航链接 - 桌面端
const NavLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  position: relative;
  transition: color 0.2s ease;
  
  &.active, &:hover {
    color: var(--primary-color);
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: var(--primary-color);
    transition: width 0.3s ease, left 0.3s ease;
  }
  
  &.active::after, &:hover::after {
    width: 100%;
    left: 0;
  }
`;

// 操作区域 - 桌面端
const ActionsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

// 按钮样式 - 桌面端
const Button = styled(Link)`
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius, 4px);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// 底部导航容器 - 移动端
const BottomNavContainer = styled.nav`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--nav-bg, var(--surface));
    border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
    padding: 0.5rem 0 env(safe-area-inset-bottom, 0.5rem);
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
`;

// 底部导航项容器
const BottomNavItems = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`;

// 底部导航项
const BottomNavItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary, rgba(0, 0, 0, 0.6))'};
  min-width: 60px;
  border-radius: 0.5rem;
  position: relative;
  
  &:hover {
    color: var(--primary-color);
    background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
  }
  
  [data-theme="dark"] & {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary, rgba(255, 255, 255, 0.6))'};
    
    &:hover {
      background-color: var(--hover-bg, rgba(255, 255, 255, 0.1));
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  ${props => props.active && `
    &::before {
      content: '';
      position: absolute;
      top: -0.25rem;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      background-color: var(--primary-color);
      border-radius: 0 0 2px 2px;
    }
  `}
`;

// 底部导航图标
const BottomNavIcon = styled.div`
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  transition: transform 0.2s ease;
  
  ${props => props.active && `
    transform: scale(1.1);
  `}
`;

// 底部导航标签
const BottomNavLabel = styled.span`
  font-size: 0.7rem;
  font-weight: ${props => props.active ? '600' : '400'};
`;

// 页面内容占位 - 移动端
const BottomNavSpacer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    height: 70px; /* 为底部导航留出空间 */
  }
`;

// 导航栏组件
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated, role } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // 导航图标映射
  const getNavIcon = (label) => {
    const icons = {
      '首页': '🏠',
      '服务': '🛠️',
      '关于': 'ℹ️',
      '设置': '⚙️',
      '开发者': '👨‍💻',
      '用户中心': '👤'
    };
    return icons[label] || '📄';
  };

  // 创建导航项
  const getNavItems = () => {
    // 基础导航项
    const baseItems = [
      { label: '首页', url: '/', isActive: location.pathname === '/' },
      { label: '服务', url: '/services', isActive: location.pathname === '/services' },
      { label: '设置', url: '/settings', isActive: location.pathname === '/settings' },
    ];

    // 根据用户角色添加特定导航项
    if (isAuthenticated && (role === 'developer' || role === 'admin')) {
      baseItems.push({
        label: '开发者',
        url: '/developer',
        isActive: location.pathname.startsWith('/developer')
      });
    }

    // 添加用户中心
    baseItems.push({
      label: '用户中心',
      url: '/user',
      isActive: location.pathname === '/user'
    });

    return baseItems;
  };

  // 获取桌面端导航项（包含关于页面）
  const getDesktopNavItems = () => {
    const baseItems = [
      { label: '首页', url: '/', isActive: location.pathname === '/' },
      { label: '服务', url: '/services', isActive: location.pathname === '/services' },
      { label: '关于', url: '/about', isActive: location.pathname === '/about' },
      { label: '设置', url: '/settings', isActive: location.pathname === '/settings' },
    ];

    if (isAuthenticated && (role === 'developer' || role === 'admin')) {
      baseItems.push({
        label: '开发者',
        url: '/developer',
        isActive: location.pathname.startsWith('/developer')
      });
    }

    return baseItems;
  };

  // 获取导航项
  const mobileNavItems = getNavItems();
  const desktopNavItems = getDesktopNavItems();

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 处理底部导航点击
  const handleBottomNavClick = (url) => {
    navigate(url);
  };

  return (
    <>
      {/* 桌面端顶部导航 */}
      <NavContainer
        role="navigation"
        aria-label="主导航"
        style={{
          boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}>
        <Logo>
          <Link to="/" aria-label="回到首页">
            <span role="img" aria-label="Echo logo">🔊</span>
            Echo
          </Link>
        </Logo>

        <NavLinks>
          {desktopNavItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.url}
              className={item.isActive ? 'active' : ''}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <ActionsArea>
          <ThemeToggle />
          <Button to="/user">用户中心</Button>
        </ActionsArea>
      </NavContainer>

      {/* 移动端底部导航 */}
      <BottomNavContainer role="navigation" aria-label="底部导航">
        <BottomNavItems>
          {mobileNavItems.map((item, index) => (
            <BottomNavItem
              key={index}
              active={item.isActive}
              onClick={() => handleBottomNavClick(item.url)}
              aria-label={`导航到${item.label}`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              <BottomNavIcon active={item.isActive}>
                {getNavIcon(item.label)}
              </BottomNavIcon>
              <BottomNavLabel active={item.isActive}>
                {item.label}
              </BottomNavLabel>
            </BottomNavItem>
          ))}
        </BottomNavItems>
      </BottomNavContainer>

      {/* 移动端页面内容占位 */}
      <BottomNavSpacer />
    </>
  );
};

export default NavBar;