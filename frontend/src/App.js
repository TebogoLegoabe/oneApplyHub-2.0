import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
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

const noShellRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin'];

const AppLayout = () => {
  const location = useLocation();
  const hideShell = noShellRoutes.some((r) => location.pathname === r || location.pathname.startsWith('/admin'));

  return (
    <div className="flex flex-col min-h-screen">
      {!hideShell && <Header />}
      <main className="flex-1">
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
            element={
              <ProtectedRoute>
                <StudentApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id/review"
            element={
              <ProtectedRoute>
                <CreateReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!hideShell && <Footer />}
    </div>
  );
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
