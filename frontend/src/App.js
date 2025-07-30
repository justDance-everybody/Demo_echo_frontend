import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
import AuthPage from './pages/AuthPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Settings from './pages/Settings/index';
import { ToastService } from './components/common/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { InteractionProvider } from './contexts/InteractionContext';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import UserCenter from './pages/user/UserCenter';
import TestPage from './tests/TestPage';
import ApiTestPage from './pages/ApiTestPage';
import TestProgressBar from './pages/TestProgressBar';
import DeveloperConsole from './pages/DeveloperConsolePage/DeveloperConsolePage';
import './App.css';

// 导入API测试工具（仅在开发环境）
if (process.env.NODE_ENV === 'development') {
  import('./services/apiTest');
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <InteractionProvider>
            <ToastService />
            <div className="App">
              <NavBar />
              <div className="content-wrapper">
                <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/settings" element={<Settings />} />
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
                <Route path="/api-test" element={<ApiTestPage />} />
                <Route path="/test-progress" element={<TestProgressBar />} />
                <Route path="*" element={<div>页面不存在</div>} />
                </Routes>
              </div>
            </div>
          </InteractionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
