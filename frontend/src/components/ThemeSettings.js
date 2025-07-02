import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';
import StyleEditor from './StyleEditor';

// 移除外层容器样式，让父组件控制
const SettingsContent = styled.div`
  /* 内容区域，不需要额外的背景和边框 */
`;

// 设置部分
const Section = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

// 统一的设置行样式（与Settings页面保持一致）
const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
  
  /* 左侧标签区域 */
  .label-section {
    flex: 1;
    margin-right: 1rem;
  }
  
  /* 控件区域 */
  .control-section {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
`;

// 统一标签样式
const Label = styled.label`
  display: block;
  color: var(--text-color);
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  text-align: left; /* 确保标签左对齐 */
`;

// 统一描述样式
const Description = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  text-align: left; /* 确保描述左对齐 */
`;

// 颜色选择器
const ColorPicker = styled.input`
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  background-color: transparent;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: var(--border-radius, 6px);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
  }
`;

// 滑块容器
const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  
  input[type="range"] {
    width: 100%;
    margin-bottom: 0.5rem;
    
    &:focus {
      outline: none;
    }
  }
`;

// 滑块值显示
const SliderValue = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: right;
`;

// 按钮样式
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius, 8px);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
  }
`;

/**
 * 主题设置组件
 */
const ThemeSettings = () => {
  const { updateThemeVariable } = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 主题颜色
  const [primaryColor, setPrimaryColor] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#4FD1C5'
  );

  // 辅助颜色
  const [secondaryColor, setSecondaryColor] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#805AD5'
  );

  // 圆角大小
  const [borderRadius, setBorderRadius] = useState(
    () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--border-radius').trim();

      // 更智能的解析：提取数字并转换单位
      if (value.includes('rem')) {
        return Math.round(parseFloat(value) * 16); // 1rem = 16px
      } else if (value.includes('px')) {
        return parseInt(value);
      }

      // 如果没有值或解析失败，返回默认值8px
      return 8;
    }
  );

  // 更新主题色
  const handlePrimaryColorChange = (e) => {
    const value = e.target.value;
    setPrimaryColor(value);
    updateThemeVariable('--primary-color', value);
  };

  // 更新辅助色
  const handleSecondaryColorChange = (e) => {
    const value = e.target.value;
    setSecondaryColor(value);
    updateThemeVariable('--secondary-color', value);
  };

  // 更新圆角大小
  const handleBorderRadiusChange = (e) => {
    const value = e.target.value;
    setBorderRadius(value);
    updateThemeVariable('--border-radius', `${value}px`);

    // 调试信息：检查CSS变量是否成功设置
    console.log('圆角设置:', {
      sliderValue: value,
      cssVariable: `--border-radius: ${value}px`,
      computedValue: getComputedStyle(document.documentElement).getPropertyValue('--border-radius')
    });
  };

  const advancedSettingsId = "advanced-settings-panel";

  return (
    <SettingsContent>
      <Section>
        <SettingRow>
          <div className="label-section">
            <Label htmlFor="primary-color-picker">主色调</Label>
            <Description id="primary-color-desc">应用的主要颜色</Description>
          </div>
          <div className="control-section">
            <ColorPicker
              type="color"
              id="primary-color-picker"
              value={primaryColor}
              onChange={handlePrimaryColorChange}
              aria-describedby="primary-color-desc"
              aria-label="选择主色调"
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className="label-section">
            <Label htmlFor="secondary-color-picker">辅助色</Label>
            <Description id="secondary-color-desc">用于强调和高亮的颜色</Description>
          </div>
          <div className="control-section">
            <ColorPicker
              type="color"
              id="secondary-color-picker"
              value={secondaryColor}
              onChange={handleSecondaryColorChange}
              aria-describedby="secondary-color-desc"
              aria-label="选择辅助色"
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className="label-section">
            <Label htmlFor="border-radius-slider">圆角大小</Label>
            <Description id="border-radius-desc">按钮和卡片的圆角半径</Description>
          </div>
          <div className="control-section">
            <SliderContainer>
              <input
                type="range"
                id="border-radius-slider"
                min="0"
                max="20"
                value={borderRadius}
                onChange={handleBorderRadiusChange}
                aria-describedby="border-radius-desc"
                aria-label="调整圆角大小"
              />
              <SliderValue aria-live="polite">{borderRadius}px</SliderValue>
            </SliderContainer>
          </div>
        </SettingRow>
      </Section>

      <Section>
        <SettingRow>
          <div className="label-section">
            <Label id="advanced-settings-label">高级设置</Label>
            <Description id="advanced-settings-desc">更多自定义样式选项</Description>
          </div>
          <div className="control-section">
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-controls={advancedSettingsId}
              aria-expanded={showAdvanced}
              aria-labelledby="advanced-settings-label"
              aria-describedby="advanced-settings-desc"
            >
              {showAdvanced ? '隐藏' : '显示'}
            </Button>
          </div>
        </SettingRow>

        {showAdvanced && (
          <div id={advancedSettingsId} style={{ marginTop: '1rem' }}>
            <StyleEditor />
          </div>
        )}
      </Section>
    </SettingsContent>
  );
};

export default ThemeSettings;
