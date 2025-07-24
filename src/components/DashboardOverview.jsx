import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  Calendar,
  Timer,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const DashboardOverview = ({ tasks, stats }) => {
  // Helper to get JS Date from due_date and due_time
  const getTaskDueDate = (task) => {
    let hour = 23, minute = 59;
    if (task.due_time && /^\d{2}:\d{2}$/.test(task.due_time)) {
      [hour, minute] = task.due_time.split(':').map(Number);
    }
    const [year, month, day] = task.due_date ? task.due_date.split('-').map(Number) : [null, null, null];
    if (year && month && day) {
      return new Date(year, month - 1, day, hour, minute);
    }
    return null;
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return tasks
      .filter(t => {
        if (!t.completed && t.due_date && t.due_date !== 'null') {
          const dueDate = getTaskDueDate(t);
          return dueDate && !isNaN(dueDate.getTime()) && dueDate <= nextWeek;
        }
        return false;
      })
      .sort((a, b) => {
        const aDate = getTaskDueDate(a);
        const bDate = getTaskDueDate(b);
        return aDate - bDate;
      })
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks
      .filter(t => {
        if (!t.completed && t.due_date && t.due_date !== 'null') {
          const dueDate = getTaskDueDate(t);
          return dueDate && !isNaN(dueDate.getTime()) && dueDate.getTime() < now.getTime();
        }
        return false;
      })
      .sort((a, b) => {
        const aDate = getTaskDueDate(a);
        const bDate = getTaskDueDate(b);
        return aDate - bDate;
      })
      .slice(0, 5);
  };

  // Format date using due_date and due_time
  const formatDate = (due_date, due_time) => {
    if (!due_date || due_date === 'null') {
      return 'No due date';
    }
    let hour = 23, minute = 59;
    if (due_time) {
      // Accept HH:mm or HH:mm:SS
      const timeMatch = due_time.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (timeMatch) {
        hour = Number(timeMatch[1]);
        minute = Number(timeMatch[2]);
      }
    }
    const [year, month, day] = due_date.split('-').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days < 7) {
      let str = `${days}d`;
      if (remHours > 0) str += ` ${remHours}h`;
      if (mins > 0) str += ` ${mins}m`;
      return str;
    }
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    if (weeks < 4) {
      let str = `${weeks}w`;
      if (remDays > 0) str += ` ${remDays}d`;
      if (remHours > 0) str += ` ${remHours}h`;
      if (mins > 0) str += ` ${mins}m`;
      return str;
    }
    const months = Math.floor(weeks / 4);
    const remWeeks = weeks % 4;
    let str = `${months}mo`;
    if (remWeeks > 0) str += ` ${remWeeks}w`;
    if (remDays > 0) str += ` ${remDays}d`;
    if (remHours > 0) str += ` ${remHours}h`;
    if (mins > 0) str += ` ${mins}m`;
    return str;
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return 'bg-red-100 text-red-800';
      case 'Q2': return 'bg-yellow-100 text-yellow-800';
      case 'Q3': return 'bg-blue-100 text-blue-800';
      case 'Q4': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-600">
              {stats.completionRate}% completion rate
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.dueToday}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quadrant Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.quadrants).map(([quadrant, count]) => (
              <div key={quadrant} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getQuadrantColor(quadrant)}`}>
                    {quadrant}
                  </span>
                  <span className="text-sm text-gray-600">
                    {quadrant === 'Q1' && 'Urgent & Important'}
                    {quadrant === 'Q2' && 'Important, Not Urgent'}
                    {quadrant === 'Q3' && 'Urgent, Not Important'}
                    {quadrant === 'Q4' && 'Neither Urgent nor Important'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.priorities).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    priority === 'high' ? 'bg-red-500' : 
                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-600 capitalize">{priority} Priority</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tasks</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No upcoming tasks</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getQuadrantColor(task.quadrant)}`}>
                        {task.quadrant}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(task.due_date, task.due_time)}
                      </span>
                      {task.duration && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(task.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Overdue Tasks</h3>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No overdue tasks</p>
          ) : (
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getQuadrantColor(task.quadrant)}`}>
                        {task.quadrant}
                      </span>
                      <span className="text-xs text-red-600">
                        {formatDate(task.due_date, task.due_time)}
                      </span>
                      {task.duration && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(task.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Time Tracking */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Time Overview</h3>
          <Timer className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {formatDuration(stats.totalEstimatedTime)}
            </p>
            <p className="text-sm text-gray-600">Total Estimated Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {formatDuration(stats.averageTaskDuration)}
            </p>
            <p className="text-sm text-gray-600">Average Task Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.thisWeek}
            </p>
            <p className="text-sm text-gray-600">Tasks This Week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
