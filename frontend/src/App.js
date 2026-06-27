import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AppSidebar from './components/Layout/AppSidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import CreateReviewPage from './pages/CreateReviewPage';
import ReviewsPage from './pages/ReviewsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentApplicationPage from './pages/StudentApplicationPage';
import BursaryPage from './pages/BursaryPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboard from './pages/AdminDashboard';
import MFASetupPage from './pages/MFASetupPage';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const APP_ROUTES = ['/dashboard', '/application', '/mfa-setup'];

const isPublicRoute = (pathname) => (
  pathname === '/' ||
  pathname === '/properties' ||
  pathname.startsWith('/properties/') ||
  pathname === '/reviews' ||
  pathname === '/bursaries'
);

const isAppRoute = (pathname) => APP_ROUTES.some((route) => pathname === route);

const AppLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = location.pathname;
  const isAdmin = pathname.startsWith('/admin');
  const isAuth = AUTH_ROUTES.includes(pathname);
  const showSidebar = isAppRoute(pathname);
  const showPublicShell = isPublicRoute(pathname) && !isAdmin && !isAuth;

  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/bursaries" element={<BursaryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/application"
        element={<ProtectedRoute><StudentApplicationPage /></ProtectedRoute>}
      />
      <Route
        path="/properties/:id/review"
        element={<ProtectedRoute><CreateReviewPage /></ProtectedRoute>}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/mfa-setup"
        element={<ProtectedRoute><MFASetupPage /></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<AdminRoute><AdminDashboard /></AdminRoute>}
      />
    </Routes>
  );

  if (showPublicShell) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="flex-1">{routes}</main>
        <Footer />
      </div>
    );
  }

  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">oneApplyHub</span>
          </div>
          <div className="flex-1">{routes}</div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-gray-50 dark:bg-gray-950">{routes}</div>;
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppLayout />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
