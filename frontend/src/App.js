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

// Routes where the full homepage shell (Header + Footer) shows
const HOME_ROUTE = '/';

// Routes that have no sidebar (unauthenticated / full-screen pages)
const NO_SIDEBAR_ROUTES = [
  '/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email',
];

const AppLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHome = location.pathname === HOME_ROUTE;
  const isAdmin = location.pathname.startsWith('/admin');
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(location.pathname) && !isAdmin;

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

  // Homepage: full Header + content + Footer
  if (isHome) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{routes}</main>
        <Footer />
      </div>
    );
  }

  // App pages: persistent sidebar + content
  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Mobile top bar — hidden on lg+ where sidebar is always visible */}
          <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">oneApplyHub</span>
          </div>
          <div className="flex-1">{routes}</div>
        </div>
      </div>
    );
  }

  // Auth pages + admin: no shell, full-screen
  return <div className="min-h-screen">{routes}</div>;
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
