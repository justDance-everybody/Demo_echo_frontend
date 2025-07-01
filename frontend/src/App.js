import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage/MainPage';
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
import './App.css';

// 内部组件，用于根据路由显示/隐藏导航栏
function AppContent() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/auth'
    || location.pathname === '/404'
    || location.pathname.startsWith('/services');

  return (
    <div className="App">
      {!hideNavBar && <NavBar />}
      <div className="content-wrapper" aria-label="主要内容">
        <ErrorBoundary>
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
            <Route path="/debug" element={<DebugPage />} />
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
