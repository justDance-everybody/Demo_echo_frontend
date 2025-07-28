import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

// 样式编辑器容器
const EditorContainer = styled.div`
  padding: 0.5rem;
  max-width: 100%;
  overflow-x: hidden;
`;

// 变量组
const VariableGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// 标题
const GroupTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
`;

// 变量行
const VariableRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--border-radius, 4px);
  background-color: ${props => props.theme?.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
`;

// 变量名
const VariableName = styled.div`
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
`;

// 颜色输入
const ColorInput = styled.input`
  width: 100px;
  border: 1px solid var(--border-color);
  padding: 0.25rem;
  border-radius: var(--border-radius, 4px);
  background-color: var(--input-bg);
  color: var(--text-color);
`;

// 按钮
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius, 4px);
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

// 重置按钮
const ResetButton = styled(Button)`
  background-color: ${props => props.theme?.isDark ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme?.isDark ? 'white' : '#1a202c'};
`;

// 按钮组
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  gap: 0.5rem;
`;

// 获取CSS变量的值
const getCssVar = (varName, defaultValue = '') => {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  }
  return defaultValue;
};

const StyleEditor = () => {
  const { theme, updateThemeVariable } = useTheme();
  const [variables, setVariables] = useState({});
  
  // 加载所有CSS变量
  useEffect(() => {
    const colors = {
      '--primary-color': getCssVar('--primary-color', '#4FD1C5'),
      '--secondary-color': getCssVar('--secondary-color', '#805AD5'),
      '--text-color': getCssVar('--text-color', '#F8F8F8'),
      '--background': getCssVar('--background', '#1E1E2F'),
      '--surface': getCssVar('--surface', '#27293D'),
      '--border-color': getCssVar('--border-color', '#2D3748'),
    };
    
    setVariables(colors);
  }, [theme.isDark]);
  
  // 处理变量值变化
  const handleVarChange = (varName, value) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value
    }));
    
    // 更新文档中的CSS变量
    updateThemeVariable(varName, value);
  };
  
  // 导出为JSON
  const exportVarsAsJson = () => {
    const jsonContent = JSON.stringify(variables, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-variables.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // 重置为默认值
  const resetToDefault = () => {
    // 1. 移除之前通过 StyleEditor 写入的行内 CSS 变量覆盖，恢复 tokens.css 的默认控制
    Object.keys(variables).forEach(varName => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.removeProperty(varName);
      }
    });

    // 2. 清除本地存储中的自定义主题配置，防止刷新后仍被重新应用
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('customTheme');
    }

    // 3. 重新从当前计算样式读取变量，刷新编辑器面板显示
    const refreshed = Object.fromEntries(
      Object.keys(variables).map(varName => [varName, getCssVar(varName)])
    );
    setVariables(refreshed);
  };
  
  return (
    <EditorContainer>
      <GroupTitle>样式编辑器</GroupTitle>
      
      <VariableGroup>
        <GroupTitle>颜色变量</GroupTitle>
        {Object.entries(variables).map(([varName, value]) => (
          <VariableRow key={varName}>
            <VariableName>{varName}</VariableName>
            <ColorInput
              type="text"
              value={value}
              onChange={(e) => handleVarChange(varName, e.target.value)}
            />
          </VariableRow>
        ))}
      </VariableGroup>
      
      <ButtonGroup>
        <ResetButton onClick={resetToDefault} theme={theme}>
          重置为默认值
        </ResetButton>
        <Button onClick={exportVarsAsJson}>
          导出主题配置
        </Button>
      </ButtonGroup>
    </EditorContainer>
  );
};

export default StyleEditor; 