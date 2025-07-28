import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext'; // Assuming AuthContext is needed for user info or token
import apiClient from '../../services/apiClient'; // Assuming a central apiClient exists
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import AddServiceForm from './AddServiceForm'; // Form component

// 自定义常量: 侧栏宽度，方便统一调整
const SIDEBAR_WIDTH = '400px';

// NEW: 服务器状态侧栏相关样式
const LayoutWrapper = styled.div`
  display: flex;
  gap: 1.5rem; /* 原 var(--spacing-lg) */
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0; /* 避免在窄屏下溢出 */
`;

const Sidebar = styled.aside`
  flex: 0 0 ${SIDEBAR_WIDTH};
  width: ${SIDEBAR_WIDTH};
  background-color: #FFFFFF; /* 原 var(--color-surface) */
  border: solid 1px var(--color-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1rem; /* 原 var(--spacing-md) */
  max-height: 80vh;
  overflow-y: auto;

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  p {
    margin: var(--spacing-xxs) 0;
    font-size: var(--font-size-sm);
  }

  @media (max-width: 900px) {
    width: 100%;
    flex: unset; /* 在移动端让侧栏自然撑满 */
  }
`;

// NEW: 刷新按钮样式
const RefreshButton = styled.button`
  background-color: var(--color-primary);
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background-color: var(--color-primary-dark);
  }
`;

// Modal overlay for AddServiceForm popup
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem; /* 原 var(--spacing-lg) */
`;

const ModalContent = styled(motion.div)`
  background-color: #FFFFFF; /* 原 var(--color-surface) */
  width: 100%;
  max-width: 600px;
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-lg);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem; /* 原 var(--spacing-sm) */
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #1A202C; /* 原 var(--text-color) */
  border: 2px solid var(--color-primary);
  border-radius: 9999px; /* 原 var(--border-radius-full) */
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  z-index: 10;
  transition: all 0.3s ease; /* 原 var(--transition-default) */

  &:hover {
    background: var(--color-primary);
    color: #1A202C;
    transform: translateY(-1px);
  }
`;

// Basic styling for the page and list (can be moved to a separate CSS file or enhanced)
const PageWrapper = styled.div`
  padding: 3rem; /* 原 var(--spacing-xxlarge) */
  max-width: 1200px; /* 原 var(--content-max-width) */
  margin: 0 auto;
`;

const ToolList = styled.ul`
  width: ${SIDEBAR_WIDTH};
  list-style: none;
  padding: 0;
  margin-top: 3rem; /* 原 var(--spacing-xxlarge) */
`;

// NEW: Sort button and header wrapper with mobile-friendly layout
const SortButton = styled.button`
  /* Visible bordered style */
  background-color: #FFFFFF; /* 原 var(--color-surface) */
  color: var(--color-primary);
  padding: 0.25rem 1rem; /* 原 var(--spacing-xs) var(--spacing-md) */
  border:  solid var(--color-primary);
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  font-size: 0.875rem; /* 原 var(--font-size-sm) */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* 原 var(--shadow-xs) */
  transition: all 0.3s ease; /* 原 var(--transition-default) */
  &:hover {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    transform: translateY(-1px);
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const ToolsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem; /* 原 var(--spacing-sm) */

  h2 { margin: 0; }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// Enhance responsiveness for each list item
const ToolListItem = styled.li`
  background-color: #FFFFFF; /* 原 var(--color-surface) */
  border:  solid var(--color-primary);
  border-radius: var(--radius-lg, 12px);
  /* Increase left padding to accommodate accent bar */
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
  position: relative;
  transition: var(--transition-default);

  /* Decorative accent bar on the left */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    border-top-left-radius: var(--radius-lg, 12px);
    border-bottom-left-radius: var(--radius-lg, 12px);
    background-color: ${(props) => props.accentColor || 'var(--color-primary)'};
  }

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 0.25rem 0; /* 原 var(--spacing-xs) */
    color: #1A202C; /* 原 var(--color-text-primary) */
  }
  p {
    margin: 0.125rem 0; /* 原 var(--spacing-xxs) */
    font-size: 0.875rem; /* 原 var(--font-size-sm) */
    color: #4A5568; /* 原 var(--color-text-secondary) */
  }
  span {
    font-weight: var(--font-weight-semibold);
  }

  /* Mobile layout */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.25rem; /* 原 var(--spacing-xs) */

  button {
    padding: 0.25rem 0.5rem; /* 原 var(--spacing-xs) var(--spacing-sm) */
    border: none;
    border-radius: 4px; /* 原 var(--border-radius-sm) */
    cursor: pointer;
    font-size: var(--font-size-xs);
    transition: all 0.3s ease; /* 原 var(--transition-default) */
  }
`;

const EditButton = styled.button`
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  &:hover { background-color: var(--color-primary-hover); }
`;

const ToggleStatusButton = styled.button`
  background-color: ${props => props.disabled ? 'var(--color-warning)' : 'var(--color-success)'};
  color: var(--color-on-primary);
  &:hover { opacity: var(--opacity-hover); }
`;

const DeleteButton = styled.button`
  background-color: var(--color-error);
  color: var(--color-on-error);
  &:hover { background-color: var(--color-error-hover); }
`;

const AddToolButton = styled.button`
  background-color: var(--color-primary);
  padding: 0.5rem 1.5rem; /* 原 var(--spacing-sm) var(--spacing-lg) */
  font-size: 1rem; /* 原 var(--font-size-base) */
  margin-bottom: 1.5rem; /* 原 var(--spacing-lg) */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover { background-color: var(--color-primary-dark); }
`;

// --- 新增: 平台颜色映射 & 服务器状态卡片样式 ---
// Color mapping for different platform types (used for accent bar)
const PLATFORM_COLORS = {
  wechat: '#1AAD19',
  alipay: '#1677FF',
  miniprogram: '#24292E',
  android: '#3DDC84',
  ios: '#0A84FF',
};

const getAccentColor = (platform) => {
  if (!platform) return 'var(--color-primary)';
  const key = platform.toLowerCase();
  return PLATFORM_COLORS[key] || 'var(--color-primary)';
};

// Card-like container for each server entry with colored border based on status
const ServerCard = styled.div`
  border: 1px solid var(--color-primary);
  border-left: 4px solid
    
    ${(props) =>
      props.status === 'running' ? 'var(--color-success)' : 'var(--color-warning)'};
  border-radius: var(--radius-lg, 12px);
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background-color: #F7FAFC;
  box-shadow: var(--shadow-xs);
`;


const DeveloperConsolePage = () => {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // NEW: 服务器状态相关 state
  const [serverData, setServerData] = useState(null);
  const [serverDataError, setServerDataError] = useState(null);
  // NEW: sort order state (desc = newest first)
  const [sortOrder, setSortOrder] = useState('desc');
  // NEW: modal visibility state
  const [showAddModal, setShowAddModal] = useState(false);
  // NEW: currently editing service (null when adding new)
  const [editingService, setEditingService] = useState(null);
  const { user } = useContext(AuthContext); // Get user info, potentially for filtering or display

  // NEW: helper to sort by created_at
  const sortToolsByDate = (toolArray, order) => {
    return [...toolArray].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  const fetchDeveloperTools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 使用现有的 /api/tools 端点而不是 /api/dev/tools
      const response = await apiClient.getDeveloperServices(); 
      console.log("开发者服务列表响应:", response);
      // NEW: sort according to current order
      const sorted = sortToolsByDate(response.tools || [], sortOrder);
      setTools(sorted);
    } catch (err) {
      console.error("Failed to fetch developer tools:", err);
      setError('无法加载您的工具，请稍后再试。');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && (user.role === 'developer' || user.role === 'admin')) { // Allow developers and admins
        fetchDeveloperTools();
    }
  }, [user]); // Refetch if user changes, though role change during session is unlikely

  const handleServiceAdded = () => {
    fetchDeveloperTools(); // Refresh list
    setShowAddModal(false); // Close modal after successful save
  };

  const handleServiceUpdated = () => {
    fetchDeveloperTools();
    setShowAddModal(false);
    setEditingService(null);
  };

  const openAddModal = () => {
    setEditingService(null); // ensure create mode
    setShowAddModal(true);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingService(null);
  };

  const handleToggleStatus = async (toolId, currentStatus) => {
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    try {
      // 注意：当前后端可能不支持工具状态更新，这里先显示警告
      console.warn('工具状态更新功能需要后端支持');
      alert('工具状态更新功能暂未实现，请联系管理员。');
      // const response = await apiClient.put(`/api/tools/${toolId}`, { status: newStatus });
      // setTools(prevTools => 
      //   prevTools.map(tool => tool.tool_id === toolId ? { ...tool, status: newStatus } : tool)
      // );
    } catch (err) {
      console.error("Failed to toggle tool status:", err);
      setError(`更新工具 ${toolId} 状态失败。`);
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (window.confirm('您确定要删除这个工具吗？此操作无法撤销。')) {
      try {
        // 注意：当前后端可能不支持工具删除，这里先显示警告
        console.warn('工具删除功能需要后端支持');
        const response = await apiClient.deleteDeveloperService(toolId);
        alert(response.data.message);
        fetchDeveloperTools();
        // setTools(prevTools => prevTools.filter(tool => tool.tool_id !== toolId));
      } catch (err) {
        console.error("Failed to delete tool:", err);
        setError(`删除工具 ${toolId} 失败。`);
      }
    }
  };

  // Placeholder for future navigation or modal for adding/editing tools
  // const handleAddTool = () => { // This button and handler will be removed
  //   console.log("Navigate to Add Tool form or open modal.");
  // };

  const handleEditTool = (toolId) => {
    const tool = tools.find(t => t.tool_id === toolId);
    if (tool) {
      setEditingService(tool);
      setShowAddModal(true);
    } else {
      console.warn('未找到指定的工具用于编辑:', toolId);
    }
  };

  // NEW: 获取服务器状态
  const fetchServerStatus = async () => {
    try {
      const response = await apiClient.getMcpHealth();
      // 后端返回 { success: true, data: { servers: { ... } } }
      const servers = response?.data?.servers || response?.servers || {};
      setServerData(servers);
      setServerDataError(null);
    } catch (err) {
      console.error('Failed to fetch server status:', err);
      setServerDataError('无法获取服务器状态，请稍后再试。');
    }
  };

  // NEW: 周期性刷新服务器状态 (30s)
  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // NEW: toggle sort order handler
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setTools(prev => sortToolsByDate(prev, newOrder));
  };

  if (!user || (user.role !== 'developer' && user.role !== 'admin')) {
    return (
      <PageWrapper>
        <h1>访问受限</h1>
        <p>您需要以开发者或管理员身份登录才能访问此页面。</p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return <PageWrapper><p>正在加载工具...</p></PageWrapper>;
  }

  if (error && tools.length === 0) {
    return <PageWrapper><p style={{ color: 'var(--color-error)' }}>{error}</p></PageWrapper>;
  }

  return (
    <PageWrapper>
      <LayoutWrapper>
        <ContentArea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>开发者控制台</h1>
            <AddToolButton onClick={openAddModal}>添加服务</AddToolButton>
          </div>

          {/* Modal for adding service */}
          <AnimatePresence>
            {showAddModal && (
              <ModalOverlay
                onClick={closeAddModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ModalContent
                  onClick={e => e.stopPropagation()}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CloseButton onClick={closeAddModal} aria-label="关闭">×</CloseButton>
                  <AddServiceForm 
                    onServiceAdded={handleServiceAdded}
                    serviceData={editingService}
                    onServiceUpdated={handleServiceUpdated}
                    onCancel={closeAddModal}
                  />
                </ModalContent>
              </ModalOverlay>
            )}
          </AnimatePresence>

          {/* Replace simple heading with header that contains sort button */}
          <ToolsHeader>
            <h2>已上传的服务</h2>
            <SortButton onClick={toggleSortOrder}>
              {sortOrder === 'asc' ? '按创建时间：最早' : '按创建时间：最新'}
            </SortButton>
          </ToolsHeader>
          {error && <p style={{ color: 'var(--color-error)' }}>列表更新错误: {error}</p>}
          {isLoading && tools.length === 0 && <p>正在加载列表...</p>} {/* Show loading only if tools aren't there yet */}
          {!isLoading && tools.length === 0 && !error && (
            <p>暂无已上传的服务。</p>
          )}
          {tools.length > 0 && (
            <ToolList>
              {tools.map(tool => (
                <ToolListItem 
                  key={tool.tool_id}
                  accentColor={getAccentColor(tool.endpoint?.platform_type)}
                >
                  <div>
                    <h3>{tool.name}</h3>
                    <p>ID: <span>{tool.tool_id}</span></p>
                    <p>平台: <span>{tool.endpoint?.platform_type?.toUpperCase() || 'N/A'}</span></p>
                    <p>状态: <span style={{ color: tool.status === 'enabled' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                      {tool.status === 'enabled' ? '已启用' : '已禁用'}
                    </span></p>
                    {/* NEW: created_at display */}
                    {tool.created_at && (
                      <p>创建时间: <span>{new Date(tool.created_at).toLocaleDateString()}</span></p>
                    )}
                    <p>描述: {tool.description || '无描述'}</p>
                  </div>
                  <ActionsContainer>
                    <EditButton onClick={() => handleEditTool(tool.tool_id)}>编辑</EditButton>
                    <ToggleStatusButton 
                      onClick={() => handleToggleStatus(tool.tool_id, tool.status)}
                      disabled={tool.status === 'disabled'}
                    >
                      {tool.status === 'enabled' ? '禁用' : '启用'}
                    </ToggleStatusButton>
                    <DeleteButton onClick={() => handleDeleteTool(tool.tool_id)}>删除</DeleteButton>
                  </ActionsContainer>
                </ToolListItem>
              ))}
            </ToolList>
          )}
        </ContentArea>

        {/* Sidebar showing server status */}
        <Sidebar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 , color: 'black'}}>服务器状态</h3>
            <RefreshButton onClick={fetchServerStatus}>刷新</RefreshButton>
          </div>
          {serverDataError && <p style={{ color: 'var(--color-error)' }}>{serverDataError}</p>}
          {!serverData && !serverDataError && <p>加载中...</p>}
          {serverData && Object.entries(serverData).map(([name, info]) => (
            <ServerCard key={name} status={info.status}>
              <p style={{ margin: '0 0 var(--spacing-xxs)', color: 'black'}}><strong>{name}</strong></p>
              <p style={{ margin: '0 0 var(--spacing-xxs)', color: 'black'}}>
                状态: <span style={{ color: info.status === 'running' ? 'var(--color-success)' : 'var(--color-warning)' }}>{info.status}</span>
              </p>
              <p style={{ margin: '0 0 var(--spacing-xxs)', color: 'black' }}>重启次数: {info.restart_count}</p>
              <p style={{ margin: 0 , color: 'black'}}>连续失败: {info.consecutive_failures}</p>
            </ServerCard>
          ))}
        </Sidebar>
      </LayoutWrapper>
    </PageWrapper>
  );
};

export default DeveloperConsolePage;