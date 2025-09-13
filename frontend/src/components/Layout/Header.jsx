import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, FileText } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false); // Close mobile menu after logout
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="font-bold text-2xl text-gray-900 group-hover:text-blue-700 transition-colors">
              oneApplyHub
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Dashboard - only show if authenticated */}
            {isAuthenticated && (
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-700 transition-colors font-medium relative group"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            
            <Link 
              to="/properties" 
              className="text-gray-600 hover:text-blue-700 transition-colors font-medium relative group"
            >
              Properties
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            <Link 
              to="/reviews" 
              className="text-gray-600 hover:text-blue-700 transition-colors font-medium relative group"
            >
              Reviews
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <Link 
              to="/bursaries" 
              className="text-gray-600 hover:text-blue-700 transition-colors font-medium relative group"
            >
              Bursaries
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Application - only show if authenticated */}
            {isAuthenticated && (
              <Link 
                to="/application" 
                className="flex items-center text-gray-600 hover:text-blue-700 transition-colors font-medium relative group"
              >
                <FileText className="w-4 h-4 mr-2" />
                Application
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    Hello, {user?.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4 pl-4 border-gray-200">
                <Link
                  to="/login"
                  className="text-blue-700 hover:text-blue-800 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Enhanced Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-gray-100 animate-fadeIn">
            <nav className="flex flex-col space-y-2 pt-6">
              {/* Dashboard - only show if authenticated */}
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium flex items-center"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
              
              <Link 
                to="/properties" 
                className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium flex items-center"
                onClick={closeMobileMenu}
              >
                Properties
              </Link>
              
              <Link 
                to="/reviews" 
                className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium flex items-center"
                onClick={closeMobileMenu}
              >
                Reviews
              </Link>

              <Link 
                to="/bursaries" 
                className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium flex items-center"
                onClick={closeMobileMenu}
              >
                Bursaries
              </Link>

              {/* Application - only show if authenticated */}
              {isAuthenticated && (
                <Link 
                  to="/application" 
                  className="text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium flex items-center"
                  onClick={closeMobileMenu}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Application
                </Link>
              )}
              
              {isAuthenticated ? (
                <div className="flex flex-col space-y-4 pt-4 mt-4 border-t border-gray-100">
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-800 font-medium block">
                        {user?.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md mx-4"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-4 mt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 transition-all duration-300 py-3 px-4 rounded-lg font-medium"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium text-center shadow-md mx-4"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
      
      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </header>
  );
};

export default Header;