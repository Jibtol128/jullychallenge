import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  CheckCircle,
  Circle,
  Flag,
  Timer,
  Zap
} from 'lucide-react';

const CalendarView = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  // Get calendar data
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Group tasks by date (use local time to avoid timezone issues)
  const tasksByDate = {};
  tasks.forEach(task => {
    if (!task.due_date || task.due_date === 'null') return;
    // Use local date string (YYYY-MM-DD) for accurate mapping
    let dateObj;
    if (task.due_time && /^\d{2}:\d{2}$/.test(task.due_time)) {
      const [year, month, day] = task.due_date.split('-').map(Number);
      const [hour, minute] = task.due_time.split(':').map(Number);
      dateObj = new Date(year, month - 1, day, hour, minute);
    } else {
      const [year, month, day] = task.due_date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    }
    // Get local YYYY-MM-DD
    const dateKey = dateObj.getFullYear() + '-' + String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
    if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
    tasksByDate[dateKey].push(task);
  });

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(currentYear, currentMonth, -i);
    calendarDays.push({
      date: prevDate,
      isCurrentMonth: false,
      tasks: []
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    // Use local YYYY-MM-DD for dateKey
    const dateKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    calendarDays.push({
      date,
      isCurrentMonth: true,
      tasks: tasksByDate[dateKey] || []
    });
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(currentYear, currentMonth + 1, day);
    calendarDays.push({
      date: nextDate,
      isCurrentMonth: false,
      tasks: []
    });
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return 'border-l-red-500';
      case 'Q2': return 'border-l-yellow-500';
      case 'Q3': return 'border-l-blue-500';
      case 'Q4': return 'border-l-gray-500';
      default: return 'border-l-gray-300';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.getMonth() === currentMonth;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              </div>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView('day')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center">
                <div className="text-sm font-semibold text-gray-700">{day}</div>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-gray-200">
            {calendarDays.map((dayData, index) => {
              const { date, isCurrentMonth, tasks: dayTasks } = dayData;
              const isCurrentDay = isToday(date);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-gray-200 transition-colors hover:bg-gray-50 ${
                    !isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                  }`}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCurrentDay
                          ? 'bg-blue-600 text-white'
                          : isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">{dayTasks.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={`group relative px-2 py-1 text-xs rounded-md border-l-2 transition-all hover:shadow-sm cursor-pointer ${
                          task.completed 
                            ? 'bg-gray-50 text-gray-500 line-through' 
                            : getPriorityColor(task.priority)
                        } ${getQuadrantColor(task.quadrant)}`}
                      >
                        <div className="flex items-center space-x-1">
                          {task.completed ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                          <span className="truncate font-medium">{task.title}</span>
                        </div>
                        {task.due_time && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-2.5 h-2.5 opacity-60" />
                            <span className="opacity-80">{task.due_time}</span>
                          </div>
                        )}
                        
                        {/* Hover tooltip */}
                        <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-xs rounded-lg p-2 bottom-full left-0 mb-1 w-48 shadow-lg">
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-gray-300 mt-1">{task.description}</div>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.duration && (
                              <span className="flex items-center space-x-1">
                                <Timer className="w-3 h-3" />
                                <span>{formatTime(task.duration)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Object.keys(tasksByDate).length}
                </div>
                <div className="text-sm text-gray-600">Days with tasks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {tasks.filter(t => t.completed).length}
                </div>
                <div className="text-sm text-gray-600">Completed tasks</div>
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
                  {tasks.filter(t => !t.completed).length}
                </div>
                <div className="text-sm text-gray-600">Pending tasks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatTime(tasks.reduce((sum, task) => sum + (task.duration || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">Total time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
