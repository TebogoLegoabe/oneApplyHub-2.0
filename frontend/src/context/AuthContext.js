import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const _storeSession = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      _storeSession(access_token, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, email: response.data.email };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const sendVerificationCode = async (email) => {
    try {
      await authAPI.sendVerificationCode(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to send code' };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await authAPI.verifyEmail(email, code);
      const { access_token, user: userData } = response.data;
      _storeSession(access_token, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Verification failed' };
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await authAPI.googleVerify(idToken);
      const { access_token, user: userData } = response.data;
      _storeSession(access_token, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Google sign-in failed' };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch {
      // silently fail — token may have expired
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    sendVerificationCode,
    verifyEmail,
    googleLogin,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
