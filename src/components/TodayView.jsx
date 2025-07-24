import React from 'react';
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Target,
  Timer
} from 'lucide-react';

const TodayView = ({ tasks, onUpdateTask, onToggleCompletion, onDeleteTask }) => {
  const today = new Date();
  
  const getTodayTasks = () => {
    return tasks.filter(task => {
      if (task.due_date && task.due_date !== 'null') {
        const dueDate = new Date(task.due_date);
        return !isNaN(dueDate.getTime()) &&
          dueDate.getFullYear() === today.getFullYear() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() === today.getDate();
      }
      return false;
    });
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => {
      if (!task.completed && task.due_date && task.due_date !== 'null') {
        const dueDate = new Date(task.due_date);
        // Overdue only if dueDate is strictly before now (full datetime), not completed, and NOT today
        return !isNaN(dueDate.getTime()) &&
          dueDate.getTime() < today.getTime() &&
          !(dueDate.getFullYear() === today.getFullYear() && dueDate.getMonth() === today.getMonth() && dueDate.getDate() === today.getDate());
      }
      return false;
    });
  };

  const getUpcomingTasks = () => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.completed && task.due_date && task.due_date !== 'null') {
        const dueDate = new Date(task.due_date);
        return !isNaN(dueDate.getTime()) && dueDate > today && dueDate <= nextWeek;
      }
      return false;
    });
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return 'bg-red-100 text-red-800 border-red-200';
      case 'Q2': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Q3': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Q4': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const TaskCard = ({ task, section }) => (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    } hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => onToggleCompletion(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.completed && <CheckCircle className="w-3 h-3" />}
            </button>
            <h3 className={`text-sm font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <div className={`prose prose-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-700'}`}
                 style={{whiteSpace: 'pre-line', fontFamily: 'inherit'}}>
              {task.description}
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getQuadrantColor(task.quadrant)}`}>
              {task.quadrant}
            </span>
            <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.duration && (
              <span className="text-xs text-gray-500 flex items-center">
                <Timer className="w-3 h-3 mr-1" />
                {formatTime(task.duration)}
              </span>
            )}
          </div>
          
          {task.reasoning && (
            <p className="text-xs text-gray-500 mb-2">
              <strong>Reasoning:</strong> {task.reasoning}
            </p>
          )}
          
          {/* Remove suggestion display from today view */}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {section === 'overdue' && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();

  const todayStats = {
    total: todayTasks.length,
    completed: todayTasks.filter(t => t.completed).length,
    pending: todayTasks.filter(t => !t.completed).length,
    totalTime: todayTasks.reduce((sum, task) => sum + (task.duration || 0), 0),
    completedTime: todayTasks.filter(t => t.completed).reduce((sum, task) => sum + (task.duration || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{todayStats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{todayStats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{overdueTasks.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Today</p>
              <p className="text-2xl font-semibold text-gray-900">{formatTime(todayStats.totalTime)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {todayStats.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-900">Today's Progress</h3>
            <span className="text-sm text-gray-600">
              {todayStats.completed} of {todayStats.total} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(todayStats.completed / todayStats.total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Time completed: {formatTime(todayStats.completedTime)}</span>
            <span>Time remaining: {formatTime(todayStats.totalTime - todayStats.completedTime)}</span>
          </div>
        </div>
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-red-600">Overdue Tasks ({overdueTasks.length})</h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <TaskCard key={task.id} task={task} section="overdue" />
            ))}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Today's Tasks ({todayTasks.length})</h3>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks scheduled for today</p>
            <p className="text-sm text-gray-400">Great! You have a clear day ahead.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks
              .sort((a, b) => {
                // Sort by completion status (incomplete first), then by priority
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
              })
              .map((task) => (
                <TaskCard key={task.id} task={task} section="today" />
              ))}
          </div>
        )}
      </div>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks ({upcomingTasks.length})</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {upcomingTasks
              .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
              .slice(0, 5)
              .map((task) => (
                <TaskCard key={task.id} task={task} section="upcoming" />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayView;
