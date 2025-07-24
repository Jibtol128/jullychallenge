import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">TaskMatrix</h1>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/" 
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="btn-outline w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? <Link to="/contact" className="text-primary-600 hover:text-primary-500">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
