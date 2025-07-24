import React, { useState } from 'react';
// Helper function to format date for datetime-local input
function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  // If already in correct format, return as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) return dateString.substring(0,16);
  // If only date, add T23:59
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString + 'T23:59';
  // Try to parse and format
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Helper function to format date for datetime-local input
import { 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Save,
  MoreVertical,
  Flag
} from 'lucide-react';

const TaskCard = ({ 
  task, 
  onUpdate, 
  onDelete, 
  onToggleCompletion, 
  onDragStart, 
  draggable = false 
}) => {
  const [toggleLoading, setToggleLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(() => {
    let due_time = task.due_time;
    if (!due_time && task.due_date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(task.due_date)) {
      due_time = task.due_date.split('T')[1];
    }
    if (!due_time) due_time = '23:59';
    return { ...task, due_time };
  });
  const [showMenu, setShowMenu] = useState(false);
  // Countdown timer state
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to split date and time from datetime-local value
  function splitDateTime(datetimeStr) {
    if (!datetimeStr) return { date: '', time: '' };
    const match = datetimeStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/);
    if (match) {
      return { date: match[1], time: match[2] };
    }
    // Fallback: if only date, default time to 23:59
    if (/^\d{4}-\d{2}-\d{2}$/.test(datetimeStr)) {
      return { date: datetimeStr, time: '23:59' };
    }
    return { date: '', time: '' };
  }

  const handleSave = () => {
    // Split date and time for database columns
    let datePart = '', timePart = '';
    if (editedTask.due_date) {
      // If editedTask.due_date is in YYYY-MM-DDTHH:mm format, split it
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(editedTask.due_date)) {
        const [date, time] = editedTask.due_date.split('T');
        datePart = date;
        timePart = editedTask.due_time || time;
      } else {
        datePart = editedTask.due_date;
        timePart = editedTask.due_time || '';
      }
    }
    // Require user to pick a time
    if (!timePart) {
      alert('Please select a due time.');
      return;
    }
    // Ensure duration is a positive integer
    const duration = parseInt(editedTask.duration) > 0 ? parseInt(editedTask.duration) : 1;
    // Ensure ai_processed is preserved if present
    const aiProcessed = editedTask.ai_processed !== undefined ? editedTask.ai_processed : task.ai_processed;
    // Send all fields to backend
    onUpdate(task.id, { ...editedTask, due_date: datePart, due_time: timePart, duration, ai_processed: aiProcessed });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  // Format date using due_date and due_time from backend
  const formatDate = (dueDate, dueTime) => {
    if (!dueDate || dueDate === 'null') {
      return 'No due date';
    }
    let hour = 23, minute = 59;
    let normalizedTime = '';
    if (typeof dueTime === 'string') {
      // Accept HH:mm:ss or HH:mm
      if (/^\d{2}:\d{2}:\d{2}$/.test(dueTime)) {
        normalizedTime = dueTime.slice(0,5);
      } else if (/^\d{2}:\d{2}$/.test(dueTime)) {
        normalizedTime = dueTime;
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dueTime)) {
        normalizedTime = dueTime.split('T')[1].slice(0,5);
      }
    }
    // If due_time is missing, but due_date is in datetime format, extract time
    if (!normalizedTime && dueDate && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dueDate)) {
      const [datePart, timePart] = dueDate.split('T');
      normalizedTime = timePart.slice(0,5);
      dueDate = datePart;
    }
    if (normalizedTime) {
      [hour, minute] = normalizedTime.split(':').map(Number);
    }
    // If still missing, fallback to 23:59
    if (isNaN(hour) || isNaN(minute)) {
      hour = 23;
      minute = 59;
    }
    const [year, month, day] = dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isToday = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    const isTomorrow = date.getFullYear() === tomorrow.getFullYear() && date.getMonth() === tomorrow.getMonth() && date.getDate() === tomorrow.getDate();
    if (isToday) {
      return `Today, ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
    }
  };

  // Use due_time for overdue calculation
  const isOverdue = () => {
    if (!task.due_date || task.due_date === 'null') {
      return false;
    }
    let hour = 23, minute = 59;
    if (task.due_time && /^\d{2}:\d{2}$/.test(task.due_time)) {
      [hour, minute] = task.due_time.split(':').map(Number);
    }
    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const isToday = dueDate.getFullYear() === now.getFullYear() && dueDate.getMonth() === now.getMonth() && dueDate.getDate() === now.getDate();
    if (isToday || dueDate.getTime() > now.getTime()) return false;
    const result = !isNaN(dueDate.getTime()) && !task.completed && dueDate.getTime() < now.getTime();
    return result;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'very low':
        return 'text-gray-600 bg-gray-200';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getQuadrantColor = (quadrant) => {
    switch (quadrant) {
      case 'Q1':
        return 'border-l-urgent-500';
      case 'Q2':
        return 'border-l-important-500';
      case 'Q3':
        return 'border-l-blue-500';
      case 'Q4':
        return 'border-l-gray-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${getQuadrantColor(task.quadrant)} p-4 transition-all duration-200 hover:shadow-md ${
        task.completed ? 'opacity-60' : ''
      } ${draggable ? 'cursor-move' : ''}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Task title"
          />
          
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows="2"
            placeholder="Task description"
          />
          
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={editedTask.due_date ? (editedTask.due_date.length > 10 ? editedTask.due_date.slice(0,10) : editedTask.due_date) : ''}
              onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Due Time</label>
            <input
              type="time"
              value={editedTask.due_time || ''}
              onChange={(e) => setEditedTask({ ...editedTask, due_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Duration (min)</label>
            <input
              type="number"
              value={editedTask.duration || ''}
              onChange={(e) => setEditedTask({ ...editedTask, duration: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              min="1"
              placeholder="Minutes"
            />
          </div>
        </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Task Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2 flex-1">
              <button
                onClick={async () => {
                  setToggleLoading(true);
                  try {
                    await onToggleCompletion(task.id);
                  } finally {
                    setToggleLoading(false);
                  }
                }}
                disabled={toggleLoading}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'
                } ${toggleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {toggleLoading ? (
                  <svg className="animate-spin h-3 w-3 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z" />
                  </svg>
                ) : (
                  task.completed && <Check className="h-3 w-3" />
                )}
              </button>
              
              <h3 className={`font-medium text-sm ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      let due_time = task.due_time;
                      if (!due_time && task.due_date && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(task.due_date)) {
                        due_time = task.due_date.split('T')[1];
                      }
                      if (!due_time) due_time = '23:59';
                      setEditedTask({ ...task, due_time });
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}


          {/* Task Meta Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Due Date */}
              <div className={`flex items-center space-x-1 text-xs ${
                isOverdue() ? 'text-red-600' : 'text-gray-500'
              }`}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.due_date, task.due_time)}</span>
              </div>
              {/* Countdown Timer */}
              {(() => {
                let hour = 23, minute = 59;
                let dateStr = task.due_date;
                let timeStr = task.due_time;
                // Use due_time if present and valid (accept HH:mm or HH:mm:ss)
                if (typeof timeStr === 'string') {
                  const match = timeStr.match(/^(\d{2}):(\d{2})/);
                  if (match) {
                    hour = parseInt(match[1], 10);
                    minute = parseInt(match[2], 10);
                  }
                } else if (dateStr && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
                  // If due_date is in YYYY-MM-DDTHH:mm format, extract time
                  const [datePart, timePart] = dateStr.split('T');
                  [hour, minute] = timePart.split(':').map(Number);
                  dateStr = datePart;
                }
                if (isNaN(hour) || isNaN(minute)) {
                  hour = 23;
                  minute = 59;
                }
                const [year, month, day] = dateStr ? dateStr.split('-').map(Number) : [null, null, null];
                if (year && month && day) {
                  const dueDate = new Date(year, month - 1, day, hour, minute);
                  if (dueDate > now) {
                    const diffMs = dueDate.getTime() - now.getTime();
                    const totalSeconds = Math.floor(diffMs / 1000);
                    const diffDays = Math.floor(totalSeconds / (60 * 60 * 24));
                    const diffHours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
                    const diffMinutes = Math.floor((totalSeconds % (60 * 60)) / 60);
                    const diffSeconds = totalSeconds % 60;
                    // Only show the largest nonzero unit for short countdowns
                    let display = '';
                    if (diffDays > 0) {
                      display = `${diffDays}d ${diffHours}h ${diffMinutes}m ${diffSeconds}s left`;
                    } else if (diffHours > 0) {
                      display = `${diffHours}h ${diffMinutes}m ${diffSeconds}s left`;
                    } else if (diffMinutes > 0) {
                      display = `${diffMinutes}m ${diffSeconds}s left`;
                    } else {
                      display = `${diffSeconds}s left`;
                    }
                    return (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {display}
                      </span>
                    );
                  }
                }
                return null;
              })()}
              {/* Duration */}
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{task.duration > 0 ? task.duration : 1}m</span>
              </div>
            </div>
            {/* Priority Badge */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              <Flag className="h-3 w-3" />
              <span className="capitalize">{task.priority === 'very low' ? 'Very Low' : task.priority}</span>
            </div>
          </div>

          {/* Overdue Warning */}
          {isOverdue() && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              ⚠️ This task is overdue
            </div>
          )}
        </>
      )}
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default TaskCard;
