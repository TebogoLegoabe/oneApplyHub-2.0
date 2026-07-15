import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AppSidebar from './components/Layout/AppSidebar';
import SEO from './components/SEO';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import CreateReviewPage from './pages/CreateReviewPageFinal';
import ReviewsPage from './pages/ReviewsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentApplicationPage from './pages/StudentApplicationPage';
import BursaryPage from './pages/BursaryPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminDashboard from './pages/AdminDashboard';
import PropertyAdminsPage from './pages/PropertyAdminsPage';
import MFASetupPage from './pages/MFASetupPage';
import LegalPage from './pages/LegalPage';
import logoImg from './assets/OneHubLogo.png';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

const isPublicRoute = (pathname) => (
  pathname === '/' ||
  pathname === '/properties' ||
  pathname.startsWith('/properties/') ||
  pathname === '/reviews' ||
  pathname === '/bursaries' ||
  pathname === '/privacy' ||
  pathname === '/terms'
);

const AppLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = location.pathname;
  const isAuth = AUTH_ROUTES.includes(pathname);
  const isAdmin = pathname.startsWith('/admin');
  const hasSession = Boolean(localStorage.getItem('token'));
  const isHome = pathname === '/';
  const showSidebar = hasSession && !isHome && !isAuth && !isAdmin;
  const showPublicShell = isHome || (!hasSession && isPublicRoute(pathname) && !isAuth);

  const routes = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/bursaries" element={<BursaryPage />} />
      <Route path="/privacy" element={<LegalPage type="privacy" />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/application" element={<ProtectedRoute><StudentApplicationPage /></ProtectedRoute>} />
      <Route path="/properties/:id/review" element={<ProtectedRoute><CreateReviewPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/mfa-setup" element={<ProtectedRoute><MFASetupPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/property-admins" element={<AdminRoute><PropertyAdminsPage /></AdminRoute>} />
    </Routes>
  );

  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img src={logoImg} alt="oneApplyHub logo" className="h-8 w-8 object-contain" />
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">oneApplyHub</span>
          </div>
          <main className="min-w-0 flex-1">{routes}</main>
        </div>
      </div>
    );
  }

  if (showPublicShell) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="flex-1">{routes}</main>
        <Footer />
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
            <SEO />
            <AppLayout />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
