import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify token with backend
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setAuthError(null);

    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { user: userData, token } = response.data;
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);

    try {
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { user: newUser, token } = response.data;
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', token);
        
        setUser(newUser);
        return { success: true, user: newUser };
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setAuthError(null);
  };

  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.data.error || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Profile update failed. Please try again.';
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
