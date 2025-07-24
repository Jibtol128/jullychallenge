import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  LogOut,
  Edit2,
  Save,
  X,
  Camera
} from 'lucide-react';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [theme, setTheme] = useState(user?.preferences?.theme || 'light');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications || true);

  const handleSave = () => {
    updateUser({
      ...editedUser,
      preferences: {
        ...user.preferences,
        theme,
        notifications
      }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setTheme(user?.preferences?.theme || 'light');
    setNotifications(user?.preferences?.notifications || true);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary-600" />
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-1.5 rounded-full hover:bg-primary-700 transition-colors">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.username}
                  onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your username"
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
              )}
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Settings className="h-4 w-4 mr-2" />
                <span>ID: {user.id}</span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Preferences</h4>
            
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-gray-700">Theme</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                disabled={!isEditing}
                className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-200'
                } ${!isEditing ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
