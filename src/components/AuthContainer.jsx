import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from './auth/AuthForm';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, loading, authError, clearError } = useAuth();

  const handleSubmit = async (formData) => {
    clearError();
    
    let result;
    if (isLogin) {
      result = await login(formData);
    } else {
      result = await register(formData);
    }

    if (result.success) {
      // Navigation will be handled by the App component
      console.log('Authentication successful:', result.user);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <AuthForm
      isLogin={isLogin}
      onSubmit={handleSubmit}
      onToggleMode={handleToggleMode}
      loading={loading}
      error={authError}
    />
  );
};

export default AuthContainer;
