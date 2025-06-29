import React, { useContext } from 'react';
import { Switch } from 'antd';
import styled from 'styled-components';
import { ThemeContext } from '../contexts/ThemeContext';

// 主题切换容器
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px; /* 确保容器有最小宽度 */
  
  @media (max-width: 768px) {
    min-width: 100px; /* 移动端稍小的最小宽度 */
    gap: 0.25rem;
  }
`;

// 主题图标
const ThemeIcon = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0; /* 防止图标被压缩 */
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// 自定义Switch样式
const StyledSwitch = styled(Switch)`
  /* 确保Switch有固定尺寸 */
  min-width: 44px !important;
  height: 22px !important;
  flex-shrink: 0; /* 防止被压缩 */
  
  /* 移动端优化 */
  @media (max-width: 768px) {
    min-width: 40px !important;
    height: 20px !important;
    
    /* 确保内部文字不会被压缩 */
    .ant-switch-inner {
      font-size: 10px !important;
      line-height: 18px !important;
      padding: 0 4px !important;
    }
    
    /* 确保滑块尺寸适当 */
    .ant-switch-handle {
      width: 16px !important;
      height: 16px !important;
      top: 2px !important;
    }
    
    .ant-switch-handle::before {
      border-radius: 8px !important;
    }
  }
  
  /* 暗色模式下的样式优化 */
  &.ant-switch-checked {
    background-color: var(--primary-color) !important;
  }
  
  /* 确保文字显示正常 */
  .ant-switch-inner {
    color: white !important;
    font-weight: 500;
  }
  
  /* 防止高度异变 - 确保所有状态下高度一致 */
  &, &.ant-switch-checked, &:hover, &:focus, &:active {
    height: 22px !important;
    
    @media (max-width: 768px) {
      height: 20px !important;
    }
  }
`;

const ThemeToggle = ({ themeOverride = null, toggleThemeOverride = null, id = null }) => {
  // 优先使用传入的覆盖属性，这样在测试中可以直接传入模拟值
  // 如果没有覆盖属性，则使用上下文中的值
  const contextValue = useContext(ThemeContext);
  const theme = themeOverride || contextValue?.theme;
  const toggleTheme = toggleThemeOverride || contextValue?.toggleTheme;

  const isDark = theme?.isDark;

  return (
    <ToggleContainer>
      <ThemeIcon aria-hidden="true">
        {isDark ? '🌙' : '☀️'}
      </ThemeIcon>
      <StyledSwitch
        id={id}
        checked={isDark}
        onChange={toggleTheme}
        checkedChildren="暗色"
        unCheckedChildren="亮色"
        aria-label="切换主题模式"
        aria-describedby={id ? `${id}-description` : undefined}
        role="switch"
        aria-checked={isDark}
      />
      {id && (
        <span id={`${id}-description`} className="sr-only">
          当前使用{isDark ? '暗色' : '亮色'}主题，点击切换到{isDark ? '亮色' : '暗色'}主题
        </span>
      )}
    </ToggleContainer>
  );
};

export default ThemeToggle; 