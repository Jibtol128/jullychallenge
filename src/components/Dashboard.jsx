import React, { useState, useEffect, useRef } from 'react';
import { taskAPI } from '../utils/api';
import Layout from './Layout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardOverview from './DashboardOverview';
import EisenhowerMatrix from './EisenhowerMatrix';
import Analytics from './Analytics';
import TodayView from './TodayView';
import CalendarView from './CalendarView';
import NotificationPage from './NotificationPage';
import CompletedTasks from './CompletedTasks';
import TaskInput from './TaskInput';
import TaskCard from './TaskCard';
import PomodoroTimer from './PomodoroTimer';

const Dashboard = ({ tasks: initialTasks = [] }) => {
  const [isProcessingTask, setIsProcessingTask] = useState(false);
  const layoutRef = useRef();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTaskInput, setShowTaskInput] = useState(false);

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      console.log('Loading tasks...');
      const response = await taskAPI.getTasks();
      console.log('Tasks API response:', response.data);
      if (response.data.success) {
        console.log('Tasks loaded successfully:', response.data.tasks);
        // Normalize completed field to boolean
        const normalizedTasks = response.data.tasks.map(task => ({
          ...task,
          completed: task.completed === true || task.completed === 1 || task.completed === '1'
        }));
        setTasks(normalizedTasks);
      } else {
        console.error('Failed to load tasks:', response.data.error);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      let response;
      
      console.log('Processing task data:', taskData);
      
      if (taskData.useAI) {
        // Use AI processing
        console.log('Using AI processing for:', taskData.rawInput);
        // Always send due_time if present
        const aiPayload = {
          rawInput: taskData.rawInput,
          userDuration: taskData.userDuration,
          due_date: taskData.due_date
        };
        if (taskData.due_time) {
          aiPayload.due_time = taskData.due_time;
        }
        response = await taskAPI.processWithAI(aiPayload);
      } else {
        // Direct task creation
        console.log('Creating task directly');
        response = await taskAPI.createTask(taskData);
      }
      
      console.log('API response:', response.data);
      
      if (response.data.success) {
        // Add the new task to the existing tasks state
        console.log('Adding task to state:', response.data.task);
        setTasks(prevTasks => {
          const newTasks = [...prevTasks, response.data.task];
          console.log('Updated tasks state:', newTasks);
          return newTasks;
        });
        return { success: true, task: response.data.task };
      } else {
        return { success: false, error: response.data.error || 'Failed to add task' };
      }
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to add task' };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await taskAPI.updateTask(taskId, updates);
      if (response.data.success) {
        setTasks(prevTasks => prevTasks.map(task => 
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
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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
        setTasks(prevTasks => prevTasks.map(task =>
          task.id === taskId ? response.data.task : task
        ));
        return { success: true, task: response.data.task };
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      return { success: false, error: error.response?.data?.error || 'Failed to toggle task' };
    }
  };

  // Handler functions for the components
  const handleAddTask = async (taskData) => {
    console.log('Adding task:', taskData);
    const result = await addTask(taskData);
    console.log('Task add result:', result);
    if (!result.success) {
      // Handle error if needed
      console.error('Failed to add task:', result.error);
    } else {
      // Force reload tasks to ensure UI is up to date
      await loadTasks();
    }
    return result; // Return the result so TaskInput can access it
  };

  const handleUpdateTask = async (taskId, updates) => {
    const result = await updateTask(taskId, updates);
    if (!result.success) {
      // Handle error if needed
      console.error('Failed to update task:', result.error);
    } else {
      // Force reload tasks to ensure UI is up to date
      await loadTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await deleteTask(taskId);
    if (!result.success) {
      // Handle error if needed
      console.error('Failed to delete task:', result.error);
    }
  };

  const handleToggleCompletion = async (taskId, completed) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let result;
    try {
      result = await toggleTaskCompletion(taskId);
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      return;
    }
    if (!result || typeof result.success === 'undefined') {
      // Improved error log for debugging
      console.error('Toggle task failed: No valid response', result);
      alert('Failed to toggle task: No valid response from server.');
      return;
    }
    if (!result.success) {
      console.error('Toggle task failed:', result.error || result);
      alert('Failed to toggle task: ' + (result.error || 'Unknown error'));
      return;
    }
    // Force reload tasks to ensure UI is up to date
    await loadTasks();
    // Refresh notifications in Layout (bell and dropdown)
    if (layoutRef.current && layoutRef.current.refreshNotifications) {
      layoutRef.current.refreshNotifications();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'completed' && task.completed) ||
                         (filterStatus === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });
  const getStats = () => {
    if (!tasks || tasks.length === 0) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0,
        dueTomorrow: 0,
        thisWeek: 0,
        quadrants: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        priorities: { high: 0, medium: 0, low: 0 },
        totalEstimatedTime: 0,
        averageTaskDuration: 0,
        completionRate: 0
      };
    }

    // Use full datetime for all calculations
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);

    // Removed setIsProcessingTask from getStats to prevent infinite re-render
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      pending: tasks.filter(t => !t.completed).length,
      overdue: tasks.filter(t => {
        if (!t.due_date || t.due_date === 'null') return false;
        let hour = 23, minute = 59;
        if (t.due_time && /^\d{2}:\d{2}$/.test(t.due_time)) {
          [hour, minute] = t.due_time.split(':').map(Number);
        }
        const [year, month, day] = t.due_date.split('-').map(Number);
        const dueDate = (year && month && day) ? new Date(year, month - 1, day, hour, minute) : null;
        return dueDate && !isNaN(dueDate.getTime()) && dueDate.getTime() < now.getTime() && !t.completed;
      }).length,
      upcoming: tasks.filter(t => {
        if (!t.due_date || t.due_date === 'null') return false;
        const dueDate = new Date(t.due_date || t.dueDate);
        // Upcoming: dueDate is strictly after now (full datetime, not just date) and not completed
        return !isNaN(dueDate.getTime()) && dueDate.getTime() > now.getTime() && !t.completed;
      }).length,
      dueToday: tasks.filter(t => {
        if (!t.due_date || t.due_date === 'null') return false;
        const dueDate = new Date(t.due_date || t.dueDate);
        // Show all tasks due today (completed and not completed)
        return !isNaN(dueDate.getTime()) && dueDate.getFullYear() === now.getFullYear() && dueDate.getMonth() === now.getMonth() && dueDate.getDate() === now.getDate();
      }).length,
      dueTomorrow: tasks.filter(t => {
        if (!t.due_date || t.due_date === 'null') return false;
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const dueDate = new Date(t.due_date || t.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate.getFullYear() === tomorrow.getFullYear() && dueDate.getMonth() === tomorrow.getMonth() && dueDate.getDate() === tomorrow.getDate() && !t.completed;
      }).length,
      thisWeek: tasks.filter(t => {
        if (!t.due_date || t.due_date === 'null') return false;
        const dueDate = new Date(t.due_date || t.dueDate);
      // Removed setIsProcessingTask from filter callback to prevent infinite re-render
        return !isNaN(dueDate.getTime()) && dueDate >= startOfWeek && dueDate <= endOfWeek && !t.completed && dueDate.getTime() > now.getTime();
      }).length,
      quadrants: {
        Q1: tasks.filter(t => t.quadrant === 'Q1').length,
        Q2: tasks.filter(t => t.quadrant === 'Q2').length,
        Q3: tasks.filter(t => t.quadrant === 'Q3').length,
        Q4: tasks.filter(t => t.quadrant === 'Q4').length,
      },
      priorities: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      // Only sum durations for tasks that are not completed and have a valid duration
      totalEstimatedTime: tasks.filter(t => !t.completed && typeof t.duration === 'number' && t.duration > 0).reduce((sum, t) => sum + t.duration, 0),
      averageTaskDuration: (() => {
        const validTasks = tasks.filter(t => typeof t.duration === 'number' && t.duration > 0);
        return validTasks.length > 0 ? Math.round(validTasks.reduce((sum, t) => sum + t.duration, 0) / validTasks.length) : 0;
      })(),
    };
    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return stats;
  };

  const stats = getStats();

  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview tasks={tasks} stats={stats} />;
      case 'matrix':
        return (
          <EisenhowerMatrix 
            tasks={tasks.filter(t => !t.completed)} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask}
            onToggleCompletion={handleToggleCompletion}
          />
        );
      case 'completed':
        // Render completed tasks as cards, similar to matrix view
        return (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tasks.filter(t => t.completed).length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-12">No completed tasks yet.</div>
            ) : (
              tasks.filter(t => t.completed).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleCompletion={handleToggleCompletion}
                  showActions={true}
                />
              ))
            )}
          </div>
        );
      case 'analytics':
        return <Analytics tasks={tasks} stats={stats} />;
      case 'today':
        return (
          <TodayView 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask} 
            onDeleteTask={handleDeleteTask}
            onToggleCompletion={handleToggleCompletion}
          />
        );
      case 'calendar':
        return <CalendarView tasks={tasks} />;
      case 'pomodoro':
        return <PomodoroTimer tasks={tasks.filter(t => !t.completed)} />;
      case 'notifications':
        return <NotificationPage />;
      default:
        return <DashboardOverview tasks={tasks} stats={stats} />;
    }
  };

  return (
    <Layout
      ref={layoutRef}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      onLogout={handleLogout}
      onShowTaskInput={() => setShowTaskInput(true)}
    >
      {showTaskInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add New Task</h2>
              <button 
                onClick={() => setShowTaskInput(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TaskInput 
              onAddTask={async (taskData) => {
                setIsProcessingTask(true);
                const result = await handleAddTask(taskData);
                if (result.success) {
                  setTimeout(() => {
                    setShowTaskInput(false);
                    setIsProcessingTask(false);
                  }, 5000);
                } else {
                  setIsProcessingTask(false);
                }
                return result;
              }} 
              isProcessing={isProcessingTask}
            />
          </div>
        </div>
      )}
      
      {renderCurrentPage()}
    </Layout>
  );
};

export default Dashboard;
