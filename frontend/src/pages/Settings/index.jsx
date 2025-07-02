import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../../components/ThemeToggle';
import ThemeSettings from '../../components/ThemeSettings';
import StyleEditor from '../../components/StyleEditor';
import { Tabs } from 'antd-mobile';

// 设置页面容器
const SettingsContainer = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 标题样式
const Title = styled.h1`
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  gap: 0.75rem;
  text-align: center; /* 确保文本居中 */
`;

// 设置卡片容器 - 优化间距
const SettingsCardContainer = styled.div`
  display: grid;
  gap: 1.5rem; /* 统一卡片间距 */
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  margin-bottom: 1.5rem; /* 与其他元素保持一致的间距 */
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem; /* 移动端稍小的间距 */
    margin-bottom: 1rem;
  }
`;

// 统一的设置卡片样式
const SettingsCard = styled.div`
  background-color: var(--surface);
  padding: 1.5rem;
  border-radius: var(--border-radius, 12px); /* 使用动态圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  /* 统一卡片标题样式 */
  h2 {
    font-size: 1.25rem;
    margin: 0 0 0.75rem 0;
    font-weight: 600;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    line-height: 1.4;
    text-align: left; /* 确保标题左对齐 */
  }
  
  /* 统一描述文字样式 */
  > p {
    margin: 0 0 1.25rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    text-align: left; /* 确保卡片描述左对齐 */
  }
  
  /* 统一分割线样式 */
  hr {
    margin: 1.25rem 0;
    border: none;
    border-top: 1px solid var(--border-color);
  }
`;

// 全宽卡片（用于主题设置和高级样式）- 优化间距
const FullWidthCard = styled(SettingsCard)`
  grid-column: 1 / -1;
  margin-bottom: 1.5rem; /* 与其他卡片保持一致的间距 */
  
  &:last-child {
    margin-bottom: 0; /* 最后一个卡片不需要底部间距 */
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;



const StyledTabs = styled(Tabs)`
  --active-line-color: var(--primary-color);
  --active-title-color: var(--primary-color);
  --title-font-size: 1rem;
  margin-bottom: 1.5rem;
  
  .adm-tabs-tab {
    color: var(--text-color) !important;
  }
  
  .adm-tabs-tab-active {
    color: var(--primary-color) !important;
  }
  
  /* 确保暗色模式下的文字可见性 */
  [data-theme="dark"] & {
    .adm-tabs-tab {
      color: var(--dark-text) !important;
    }
    
    .adm-tabs-tab-active {
      color: var(--primary-color) !important;
    }
  }
`;

// 统一的设置行样式
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
  
  /* 统一标签样式 */
  label {
    display: block;
    color: var(--text-color);
    font-weight: 500;
    font-size: 0.95rem;
    line-height: 1.4;
    margin-bottom: 0.25rem;
    text-align: left; /* 确保设置项标题左对齐 */
  }
  
  /* 统一描述样式 */
  .description {
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.4;
    margin: 0;
    text-align: left; /* 确保设置项描述左对齐 */
  }
  
  /* 控件区域 */
  .control-section {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  
  /* 选择框样式 */
  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius, 8px);
    background-color: var(--surface);
    color: var(--text-color);
    font-size: 0.9rem;
    min-width: 120px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(79, 209, 197, 0.2);
    }
  }
`;

// 设置页面主要内容
const Settings = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <SettingsContainer>
      <Title>
        <span aria-hidden="true">⚙️</span>
        设置
      </Title>

      <StyledTabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="外观和主题" key="appearance">
          <SettingsCardContainer>
            {/* 主题模式设置卡片 */}
            <SettingsCard>
              <h2>
                <span aria-hidden="true">🌓</span>
                主题模式
              </h2>
              <p>切换应用的亮色或暗色主题模式。</p>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="theme-toggle-button-instance">当前主题</label>
                  <div className="description">
                    {theme.isDark ? '暗色主题' : '亮色主题'}
                  </div>
                </div>
                <div className="control-section">
                  <ThemeToggle id="theme-toggle-button-instance" />
                </div>
              </SettingRow>
            </SettingsCard>

            {/* 字体设置卡片 */}
            <SettingsCard>
              <h2>
                <span aria-hidden="true">📝</span>
                字体设置
              </h2>
              <p>自定义应用中使用的字体和字体大小。</p>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="font-family-select">应用字体</label>
                  <div className="description">
                    修改整个应用的默认字体
                  </div>
                </div>
                <div className="control-section">
                  <select id="font-family-select" defaultValue="system" aria-label="选择应用字体">
                    <option value="system">系统默认</option>
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">等宽字体</option>
                  </select>
                </div>
              </SettingRow>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="font-size-select">字体大小</label>
                  <div className="description">
                    调整应用的整体字体大小
                  </div>
                </div>
                <div className="control-section">
                  <select id="font-size-select" defaultValue="medium" aria-label="选择字体大小">
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>
              </SettingRow>
            </SettingsCard>
          </SettingsCardContainer>

          {/* 主题设置 - 全宽卡片 */}
          <FullWidthCard>
            <h2>
              <span aria-hidden="true">🎨</span>
              主题自定义
            </h2>
            <p>自定义应用的颜色、圆角等主题参数。</p>
            <hr />
            <ThemeSettings />
          </FullWidthCard>

          {/* 高级样式编辑器 - 全宽卡片 */}
          <FullWidthCard>
            <h2>
              <span aria-hidden="true">✨</span>
              高级样式
            </h2>
            <p>直接编辑和应用自定义CSS样式。</p>
            <hr />
            <StyleEditor />
          </FullWidthCard>
        </Tabs.Tab>

        <Tabs.Tab title="高级设置" key="advanced">
          <SettingsCardContainer>
            <SettingsCard>
              <h2>
                <span aria-hidden="true">🔧</span>
                高级选项
              </h2>
              <p>配置应用的高级功能和性能选项。</p>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="cache-setting">缓存设置</label>
                  <div className="description">
                    控制应用数据的缓存策略
                  </div>
                </div>
                <div className="control-section">
                  <select id="cache-setting" defaultValue="auto">
                    <option value="auto">自动</option>
                    <option value="aggressive">积极缓存</option>
                    <option value="minimal">最小缓存</option>
                  </select>
                </div>
              </SettingRow>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="debug-mode">调试模式</label>
                  <div className="description">
                    启用开发者调试功能
                  </div>
                </div>
                <div className="control-section">
                  <select id="debug-mode" defaultValue="disabled">
                    <option value="disabled">禁用</option>
                    <option value="enabled">启用</option>
                  </select>
                </div>
              </SettingRow>
            </SettingsCard>
          </SettingsCardContainer>
        </Tabs.Tab>

        <Tabs.Tab title="账户设置" key="account">
          <SettingsCardContainer>
            <SettingsCard>
              <h2>
                <span aria-hidden="true">👤</span>
                账户信息
              </h2>
              <p>管理您的账户信息和隐私设置。</p>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="username-input">用户名</label>
                  <div className="description">
                    您的显示名称
                  </div>
                </div>
                <div className="control-section">
                  <input
                    id="username-input"
                    type="text"
                    defaultValue="用户"
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-color)',
                      fontSize: '0.9rem',
                      minWidth: '120px'
                    }}
                  />
                </div>
              </SettingRow>

              <SettingRow>
                <div className="label-section">
                  <label htmlFor="privacy-setting">隐私设置</label>
                  <div className="description">
                    控制数据收集和分析
                  </div>
                </div>
                <div className="control-section">
                  <select id="privacy-setting" defaultValue="standard">
                    <option value="strict">严格</option>
                    <option value="standard">标准</option>
                    <option value="relaxed">宽松</option>
                  </select>
                </div>
              </SettingRow>
            </SettingsCard>
          </SettingsCardContainer>
        </Tabs.Tab>
      </StyledTabs>
    </SettingsContainer>
  );
};

export default Settings; 