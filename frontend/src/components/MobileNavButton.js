import React, { useState } from 'react';
import styled from 'styled-components';
import './MobileNavButton.css';
import { Link } from 'react-router-dom';

const ButtonContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1060;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// MobileNavButton 组件内部负责管理菜单打开状态，并渲染移动端菜单列表
const MobileNavButton = ({ items = [], onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 切换菜单打开状态
  const toggleMenu = () => setIsOpen((prev) => !prev);

  // 处理菜单项点击
  const handleItemClick = (url) => {
    setIsOpen(false); // 关闭菜单
    if (typeof onNavigate === 'function') {
      // 提供给父组件的回调（可选）
      onNavigate(url);
    }
  };

  return (
    <>
      {/* 汉堡按钮 */}
      <ButtonContainer
        onClick={toggleMenu}
        aria-label={isOpen ? '关闭导航菜单' : '打开导航菜单'}
        className={isOpen ? 'open' : ''}
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </ButtonContainer>

      {/* 移动端菜单 */}
      <div className={`mobile-menu ${isOpen ? 'is-open' : ''}`}>
        {items.map((item, index) => (
          <Link
            key={index}
            to={item.url}
            className={`menu-item ${item.isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(item.url)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
};

export default MobileNavButton; 