import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import ThemeToggle from '../ThemeToggle';
import { ThemeContext } from '../../contexts/ThemeContext';

expect.extend(toHaveNoViolations);

// 模拟antd的Switch组件
jest.mock('antd', () => ({
  Switch: ({ checked, onChange, checkedChildren, unCheckedChildren, ...props }) => (
    <button
      {...props}
      onClick={() => onChange && onChange(!checked)}
      data-testid="theme-switch"
      role="switch"
      aria-checked={checked}
    >
      <span>{checked ? checkedChildren : unCheckedChildren}</span>
    </button>
  )
}));

describe('ThemeToggle组件', () => {
  const mockToggleTheme = jest.fn();

  // 模拟暗色主题
  const darkThemeContextValue = {
    theme: { isDark: true },
    toggleTheme: mockToggleTheme,
    updateThemeVariable: jest.fn()
  };

  // 模拟亮色主题
  const lightThemeContextValue = {
    theme: { isDark: false },
    toggleTheme: mockToggleTheme,
    updateThemeVariable: jest.fn()
  };

  beforeEach(() => {
    mockToggleTheme.mockClear();
  });

  test('暗色主题下正确渲染月亮图标且无障碍违规', async () => {
    const { container } = render(
      <ThemeContext.Provider value={darkThemeContextValue}>
        <ThemeToggle id="theme-toggle-dark" />
      </ThemeContext.Provider>
    );

    // 查找switch组件
    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
    expect(toggleSwitch).toHaveAttribute('aria-label', '切换主题模式');
    expect(toggleSwitch).toHaveAttribute('id', 'theme-toggle-dark');

    // 检查月亮图标
    const moonIcon = screen.getByText('🌙');
    expect(moonIcon).toBeInTheDocument();

    // 检查Switch显示的文字
    expect(toggleSwitch).toHaveTextContent('暗色');

    expect(await axe(container)).toHaveNoViolations();
  });

  test('亮色主题下正确渲染太阳图标且无障碍违规', async () => {
    const { container } = render(
      <ThemeContext.Provider value={lightThemeContextValue}>
        <ThemeToggle id="theme-toggle-light" />
      </ThemeContext.Provider>
    );

    // 查找switch组件
    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
    expect(toggleSwitch).toHaveAttribute('aria-label', '切换主题模式');
    expect(toggleSwitch).toHaveAttribute('id', 'theme-toggle-light');

    // 检查太阳图标
    const sunIcon = screen.getByText('☀️');
    expect(sunIcon).toBeInTheDocument();

    // 检查Switch显示的文字
    expect(toggleSwitch).toHaveTextContent('亮色');

    expect(await axe(container)).toHaveNoViolations();
  });

  test('点击按钮时调用toggleTheme函数', () => {
    render(
      <ThemeContext.Provider value={darkThemeContextValue}>
        <ThemeToggle />
      </ThemeContext.Provider>
    );

    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('接受themeOverride和toggleThemeOverride属性且无障碍违规', async () => {
    const customToggle = jest.fn();

    const { container } = render(
      <ThemeToggle
        id="theme-toggle-override"
        themeOverride={{ isDark: true }}
        toggleThemeOverride={customToggle}
      />
    );

    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);

    expect(customToggle).toHaveBeenCalledTimes(1);
    expect(mockToggleTheme).not.toHaveBeenCalled();
    expect(toggleSwitch).toHaveAttribute('id', 'theme-toggle-override');

    expect(await axe(container)).toHaveNoViolations();
  });
}); 