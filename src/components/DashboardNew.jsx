import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Clock, Target, Filter, Search, User, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../utils/api';

// Components
import TaskInput from './TaskInput';
import EisenhowerMatrix from './EisenhowerMatrix';
import TaskList from './TaskList';
import UserProfile from './UserProfile';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('matrix');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load tasks from API
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      if (response.data.success) {
        setTasks([...tasks, response.data.task]);
        setShowTaskInput(false);
        return { success: true, task: response.data.task };
      }
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add task' };
    }
  };

  const addTaskWithAI = async (rawInput) => {
    try {
      const response = await taskAPI.createTaskWithAI(rawInput);
      if (response.data.success) {
        setTasks([...tasks, response.data.task]);
        setShowTaskInput(false);
        return { success: true, task: response.data.task };
      }
    } catch (error) {
      console.error('Error processing task with AI:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to process task' };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskAPI.updateTask(taskId, updates);
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task.id === taskId ? response.data.task : task
        ));
        return { success: true, task: response.data.task };
      }
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to update task' };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await taskAPI.deleteTask(taskId);
      if (response.data.success) {
        setTasks(tasks.filter(task => task.id !== taskId));
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to delete task' };
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    try {
      const response = await taskAPI.toggleTask(taskId);
      if (response.data.success) {
        setTasks(tasks.map(task =>
          task.id === taskId ? response.data.task : task
        ));
        return { success: true, task: response.data.task };
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to toggle task' };
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Task Prioritizer</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <div className="flex space-x-8">
                <button
                  onClick={() => setCurrentView('matrix')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'matrix' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span>Matrix</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('list')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'list' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>List</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTaskInput(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowUserProfile(!showUserProfile)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <span className="hidden md:block">{user.username}</span>
                  </button>
                  
                  {showUserProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={() => setShowUserProfile(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Content based on current view */}
        {currentView === 'matrix' && (
          <EisenhowerMatrix
            tasks={filteredTasks}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onTaskToggle={toggleTaskCompletion}
          />
        )}
        
        {currentView === 'list' && (
          <TaskList
            tasks={filteredTasks}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onTaskToggle={toggleTaskCompletion}
          />
        )}
        
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tasks</h3>
              <p className="text-3xl font-bold text-primary-600">{tasks.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{tasks.filter(t => !t.completed).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Overdue</h3>
              <p className="text-3xl font-bold text-red-600">
                {tasks.filter(t => new Date(t.due_date) < new Date() && !t.completed).length}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Task Input Modal */}
      {showTaskInput && (
        <TaskInput
          onClose={() => setShowTaskInput(false)}
          onTaskAdd={addTask}
          onTaskAddWithAI={addTaskWithAI}
        />
      )}
    </div>
  );
};

export default Dashboard;
