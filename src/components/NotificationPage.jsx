import React, { useEffect, useState } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  Mail,
  MessageCircle,
  Settings,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// Mockup notification data
const mockNotifications = [
  {
    id: 1,
    message: "Task 'Complete project proposal' is due in 2 hours",
    type: 'task',
    is_read: false,
    created_at: '2025-07-23T04:30:00Z',
    task_id: 1
  },
  {
    id: 2,
    message: "Congratulations! You have completed the task 'Morning workout'. Great job!",
    type: 'completion',
    is_read: false,
    created_at: '2025-07-23T03:15:00Z',
    task_id: 2
  },
  {
    id: 3,
    message: "Reminder: Your task 'Call dentist' is due at 2025-07-23 16:00",
    type: 'reminder',
    is_read: true,
    created_at: '2025-07-23T02:00:00Z',
    task_id: 3
  },
  {
    id: 4,
    message: "Task 'Review quarterly reports' is overdue!",
    type: 'overdue',
    is_read: false,
    created_at: '2025-07-23T01:45:00Z',
    task_id: 4
  },
  {
    id: 5,
    message: "Your task 'Team meeting preparation' is due very soon at 2025-07-23 14:30",
    type: 'urgent',
    is_read: true,
    created_at: '2025-07-23T01:00:00Z',
    task_id: 5
  },
  {
    id: 6,
    message: "Daily reminder: Don't forget to review your goals for today",
    type: 'system',
    is_read: false,
    created_at: '2025-07-23T00:00:00Z',
    task_id: null
  }
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState({});
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all'); // all, task, reminder, system

  // Remove the API fetch since we're using mockup data
  useEffect(() => {
    // Simulate loading delay for better UX
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const displayNotifications = notifications;

  const filteredNotifications = displayNotifications.filter(n => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'unread' && !n.is_read) || 
      (filter === 'read' && n.is_read);
    const matchesTypeFilter = selectedType === 'all' || n.type === selectedType;
    return matchesReadFilter && matchesTypeFilter;
  });

  const getNotificationIcon = (type, priority) => {
    if (priority === 'urgent' || priority === 'overdue') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    switch (type) {
      case 'task':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'system':
        return <Zap className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'overdue':
        return 'border-l-red-600 bg-red-100';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-400 bg-gray-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'whatsapp':
        return <MessageCircle className="h-3 w-3" />;
      case 'push':
        return <Bell className="h-3 w-3" />;
      case 'sms':
        return <MessageCircle className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
  };

  const getChannelColor = (channel) => {
    switch (channel) {
      case 'email':
        return 'bg-green-100 text-green-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      case 'push':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BellRing className="h-8 w-8 text-indigo-600" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">Stay updated with your tasks and reminders</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'unread', 'read'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  filter === filterType 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterType}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {['all', 'task', 'reminder', 'system'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  selectedType === type 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayNotifications.filter(n => n.priority === 'urgent' || n.priority === 'overdue').length}
                </div>
                <div className="text-sm text-gray-600">Urgent</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayNotifications.filter(n => n.type === 'task').length}
                </div>
                <div className="text-sm text-gray-600">Task alerts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayNotifications.filter(n => n.type === 'reminder').length}
                </div>
                <div className="text-sm text-gray-600">Reminders</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <EyeOff className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {displayNotifications.filter(n => !n.is_read).length}
                </div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No notifications found</p>
              <p className="text-sm text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 border-l-4 transition-all hover:bg-gray-50 ${
                    n.is_read ? 'bg-white' : getPriorityColor(n.priority)
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(n.type, n.priority)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {n.title || 'Notification'}
                            </h3>
                            {n.action_required && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Action Required
                              </span>
                            )}
                            {!n.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className={`text-sm mb-3 ${n.is_read ? 'text-gray-600' : 'text-gray-800'}`}>
                            {n.message}
                          </p>

                          {n.task_title && (
                            <div className="flex items-center space-x-2 mb-3">
                              <Target className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600 font-medium">{n.task_title}</span>
                              {n.due_time && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    {new Date(n.due_time).toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {n.channels && n.channels.map((channel) => (
                                <span
                                  key={channel}
                                  className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getChannelColor(channel)}`}
                                >
                                  {getChannelIcon(channel)}
                                  <span className="capitalize">{channel}</span>
                                </span>
                              ))}
                            </div>
                            
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(n.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!n.is_read && (
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={async () => {
                                // Mock functionality - update local state only
                                setMarking((prev) => ({ ...prev, [n.id]: true }));
                                setTimeout(() => {
                                  setNotifications((prev) => 
                                    prev.map((notif) => 
                                      notif.id === n.id ? { ...notif, is_read: true } : notif
                                    )
                                  );
                                  setMarking((prev) => ({ ...prev, [n.id]: false }));
                                }, 500);
                              }}
                              disabled={marking[n.id]}
                            >
                              {marking[n.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
