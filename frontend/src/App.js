import { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PageLoader, ToastProvider } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AppSidebar from './components/Layout/AppSidebar';
import SEO from './components/SEO';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Logo from './components/brand/Logo';
// The pages most visitors land on ship in the main bundle...
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForcedPasswordChangePage from './pages/ForcedPasswordChangePage';
import NotFoundPage from './pages/NotFoundPage';

// ...everything else (dashboards with charts, the application wizard, admin tools)
// downloads on demand, which keeps first load light on mobile data.
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const BursaryPage = lazy(() => import('./pages/BursaryPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudentApplicationPage = lazy(() => import('./pages/StudentApplicationPage'));
const CreateReviewPage = lazy(() => import('./pages/CreateReviewPage'));
const MFASetupPage = lazy(() => import('./pages/MFASetupPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PropertyAdminsPage = lazy(() => import('./pages/PropertyAdminsPage'));
const PropertyRoomsPage = lazy(() => import('./pages/PropertyRoomsPage'));

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/bursaries" element={<BursaryPage />} />
      <Route path="/opportunities" element={<OpportunitiesPage />} />
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
      <Route path="/admin/properties/:id/rooms" element={<AdminRoute><PropertyRoomsPage /></AdminRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

const AppLayout = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith('/admin');
  const isHome = pathname === '/';
  const showSidebar = isAuthenticated && !isHome && !isAuthRoute && !isAdminRoute;
  const showPublicShell = isHome || (!isAuthenticated && !isAuthRoute && !isAdminRoute);

  if (isAuthenticated && user?.must_change_password) {
    return <ForcedPasswordChangePage />;
  }

  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
          <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="-ml-1 rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo markClassName="h-8 w-8" />
          </div>
          <main id="main-content" className="min-w-0 flex-1">
            <AppRoutes />
          </main>
        </div>
      </div>
    );
  }

  if (showPublicShell) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main id="main-content" className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    );
  }

  // Auth screens (AuthShell) and the admin console render their own <main> landmark.
  if (isAuthRoute || pathname === '/admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <AppRoutes />
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppRoutes />
    </main>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <a href="#main-content" className="skip-link">Skip to content</a>
              <SEO />
              <ScrollToTop />
              <AppLayout />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
