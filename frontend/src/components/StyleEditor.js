import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

// 样式编辑器容器
const EditorContainer = styled.div`
  padding: 0;
  max-width: 100%;
  overflow-x: hidden;
`;

// 变量组
const VariableGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// 分组标题
const GroupTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: var(--text-color);
  font-weight: 600;
  line-height: 1.4;
  text-align: left; /* 确保分组标题左对齐 */
`;

// 变量行
const VariableRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: ${props => props.theme?.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid var(--border-color);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// 变量名
const VariableName = styled.div`
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: left; /* 确保变量名左对齐 */
`;

// 颜色输入
const ColorInput = styled.input`
  width: 120px;
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: var(--surface);
  color: var(--text-color);
  font-size: 0.9rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
  }
`;

// 按钮基础样式
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
  }
`;

// 重置按钮
const ResetButton = styled(Button)`
  background-color: ${props => props.theme?.isDark ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme?.isDark ? 'white' : '#1a202c'};
  
  &:hover {
    background-color: ${props => props.theme?.isDark ? '#5a6578' : '#d2d8e0'};
    opacity: 1;
    transform: translateY(-1px);
  }
`;

// 按钮组 - 水平居中
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
    
    ${Button}, ${ResetButton} {
      width: 100%;
      min-width: 200px;
    }
  }
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
    const defaultVariables = {
      '--primary-color': theme.isDark ? '#4FD1C5' : '#38B2AC',
      '--secondary-color': theme.isDark ? '#805AD5' : '#6B46C1',
      '--text-color': theme.isDark ? '#F8F8F8' : '#1A202C',
      '--background': theme.isDark ? '#1E1E2F' : '#FFFFFF',
      '--surface': theme.isDark ? '#27293D' : '#F7FAFC',
      '--border-color': theme.isDark ? '#2D3748' : '#E2E8F0',
    };

    // 更新所有变量
    Object.entries(defaultVariables).forEach(([varName, value]) => {
      updateThemeVariable(varName, value);
    });

    // 更新状态
    setVariables(defaultVariables);
  };

  return (
    <EditorContainer>
      <VariableGroup>
        <GroupTitle>颜色变量</GroupTitle>
        {Object.entries(variables).map(([varName, value]) => (
          <VariableRow key={varName} theme={theme}>
            <VariableName>{varName}</VariableName>
            <ColorInput
              type="text"
              value={value}
              onChange={(e) => handleVarChange(varName, e.target.value)}
              aria-label={`设置 ${varName} 的值`}
              id={`input-${varName.replace('--', '')}`}
              placeholder="输入颜色值"
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