import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  BarChart3, 
  Target, 
  Calendar, 
  Clock, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../utils/api';

const Layout = forwardRef(({ children, currentPage, onPageChange, onLogout, onShowTaskInput }, ref) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth(); // Using useAuth to get user data


  // Expose refreshNotifications to parent via ref
  useImperativeHandle(ref, () => ({
    refreshNotifications: () => {
      fetchUnread();
      if (showDropdown) fetchAllNotifications();
    }
  }));

  async function fetchUnread() {
    try {
      const res = await notificationAPI.getUnreadCount();
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      setUnreadCount(0);
    }
  }

  async function fetchAllNotifications() {
    setLoadingNotifications(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    fetchUnread();
  }, []);

  const handleBellClick = async () => {
    setShowDropdown((prev) => !prev);
    if (!showDropdown) {
      await fetchAllNotifications();
    }
  };

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: Home },
    { name: 'Matrix View', href: 'matrix', icon: Target },
    { name: 'Completed Tasks', href: 'completed', icon: CheckCircle },
    { name: 'Calendar', href: 'calendar', icon: Calendar },
    { name: 'Pomodoro Timer', href: 'pomodoro', icon: Clock },
    { name: 'Analytics', href: 'analytics', icon: BarChart3 },
    { name: 'Today\'s Tasks', href: 'today', icon: Clock },
    { name: 'Notifications', href: 'notifications', icon: User },
  ];

  const handleNavigation = (page) => {
    onPageChange(page);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900">TaskMatrix</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <UserInfo user={user} onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentPage.replace('-', ' ')}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-md" onClick={handleBellClick}>
                {/* Notification Bell Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification badge (real unread count) */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unreadCount}</span>
                )}
                {/* Notification dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b font-bold">Notifications</div>
                    {loadingNotifications ? (
                      <div className="p-4 text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-gray-500">No notifications found.</div>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto">
                        {notifications.slice(0, 10).map((n) => (
                          <li key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${n.is_read ? 'bg-gray-50' : 'bg-primary-50 border-primary-100'}`}>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{n.message}</span>
                              <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="p-2 text-center border-t">
                      <div
                        className="text-primary-600 hover:underline text-sm cursor-pointer"
                        onClick={() => { setShowDropdown(false); handleNavigation('notifications'); }}
                      >
                        View all
                      </div>
                    </div>
                  </div>
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                <Filter className="h-5 w-5" />
              </button>
              <button 
                className="btn-primary flex items-center space-x-2"
                onClick={onShowTaskInput}
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
        {/* Footer Credit */}
        <footer className="w-full mt-12 text-center text-gray-400 text-sm">
          © 2025 Your Name. All rights reserved. | Task Manager & Pomodoro Dashboard
        </footer>
      </div>
    </div>
  );
});

// User info component using AuthContext
function UserInfo({ user, onLogout }) {
  if (!user) return null;
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
          {user.username ? user.username[0].toUpperCase() : 'U'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{user.username || 'User'}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </button>
    </div>
  );
}

export default Layout;
