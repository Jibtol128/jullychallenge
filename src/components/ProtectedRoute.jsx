import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Brain } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <Brain className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by App component
  }

  return children;
};

export default ProtectedRoute;
