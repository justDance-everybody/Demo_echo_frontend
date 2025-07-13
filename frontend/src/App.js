import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import HomePage from './pages/user/HomePage';
import AuthPage from './pages/AuthPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Settings from './pages/Settings/index';
import NotFoundPage from './pages/NotFoundPage';
import { ToastService } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import UserCenter from './pages/user/UserCenter';
import TestPage from './tests/TestPage';
import DeveloperConsole from './pages/DeveloperConsolePage/DeveloperConsolePage';
import DebugPage from './pages/DebugPage';
import VoiceFlowTestPage from './pages/VoiceFlowTestPage';
import SimpleTestPage from './pages/SimpleTestPage';
import './App.css';

// 内部组件，用于根据路由显示/隐藏导航栏
function AppContent() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/auth'
    || location.pathname === '/404'
    || location.pathname.startsWith('/services');

  return (
    <div className="App">
      {/* 临时服务器标识 - 用于确认端口转发 - 测试模式下隐藏 */}
      {/* <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#4FD1C5',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #38B2AC'
      }}>
        🌐 远程服务器: 10.109.129.119
      </div> */}
      
      {!hideNavBar && <NavBar />}
      <div className="content-wrapper" aria-label="主要内容">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/services" element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="/services/:id" element={
              <ProtectedRoute>
                <ServiceDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/user" element={
              <ProtectedRoute>
                <UserCenter />
              </ProtectedRoute>
            } />
            <Route path="/developer" element={
              <ProtectedRoute requireRole="developer">
                <DeveloperConsole />
              </ProtectedRoute>
            } />
            <Route path="/developer/services/:id" element={
              <ProtectedRoute requireRole="developer">
                <DeveloperConsole />
              </ProtectedRoute>
            } />
            <Route path="/developer/apps/:id" element={
              <ProtectedRoute requireRole="developer">
                <DeveloperConsole />
              </ProtectedRoute>
            } />
            <Route path="/test" element={<TestPage />} />
            <Route path="/voice-test" element={<VoiceFlowTestPage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/simple-test" element={<SimpleTestPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
      {!hideNavBar && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastService />
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
