import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

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
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-xl text-gray-900">oneApplyHub</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Dashboard - only show if authenticated */}
            {isAuthenticated && (
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            )}
            
            <Link to="/properties" className="text-gray-600 hover:text-blue-600 transition-colors">
              Properties
            </Link>
            <Link to="/reviews" className="text-gray-600 hover:text-blue-600 transition-colors">
              Reviews
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hello, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 pt-4">
              {/* Dashboard - only show if authenticated */}
              {isAuthenticated && (
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
              )}
              
              <Link 
                to="/properties" 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                Browse
              </Link>
              
              <Link 
                to="/reviews" 
                className="text-gray-600 hover:text-blue-600 transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                onClick={closeMobileMenu}
              >
                Reviews
              </Link>
              
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
                  <div className="px-2 py-2">
                    <span className="text-sm text-gray-600">
                      Hello, {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
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
    </header>
  );
};

export default Header;