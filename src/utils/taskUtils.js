// Task utility functions

export const QUADRANTS = {
  Q1: { label: 'Urgent & Important', color: 'red', description: 'Do First' },
  Q2: { label: 'Important, Not Urgent', color: 'yellow', description: 'Schedule' },
  Q3: { label: 'Urgent, Not Important', color: 'blue', description: 'Delegate' },
  Q4: { label: 'Neither Urgent nor Important', color: 'gray', description: 'Eliminate' },
};

export const PRIORITIES = {
  high: { label: 'High', color: 'red', value: 3 },
  medium: { label: 'Medium', color: 'yellow', value: 2 },
  low: { label: 'Low', color: 'green', value: 1 },
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset time to compare dates only
  const resetTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
  const dateOnly = resetTime(date);
  const todayOnly = resetTime(today);
  const tomorrowOnly = resetTime(tomorrow);
  const yesterdayOnly = resetTime(yesterday);

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Tomorrow';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

export const isOverdue = (dueDate, completed = false) => {
  if (completed) return false;
  
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
};

export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getTaskStats = (tasks) => {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.completed)).length,
    
    // By quadrant
    quadrants: {
      Q1: tasks.filter(t => t.quadrant === 'Q1').length,
      Q2: tasks.filter(t => t.quadrant === 'Q2').length,
      Q3: tasks.filter(t => t.quadrant === 'Q3').length,
      Q4: tasks.filter(t => t.quadrant === 'Q4').length,
    },
    
    // By priority
    priorities: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    },
    
    // Time estimates
    totalEstimatedTime: tasks.reduce((sum, task) => sum + (task.duration || 0), 0),
    completedTime: tasks.filter(t => t.completed).reduce((sum, task) => sum + (task.duration || 0), 0),
    remainingTime: tasks.filter(t => !t.completed).reduce((sum, task) => sum + (task.duration || 0), 0),
  };
  
  // Calculate completion rate
  stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // Calculate average task duration
  stats.averageTaskDuration = stats.total > 0 ? Math.round(stats.totalEstimatedTime / stats.total) : 0;
  
  return stats;
};

export const sortTasks = (tasks, sortBy = 'dueDate', order = 'asc') => {
  return [...tasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'priority':
        aValue = PRIORITIES[a.priority]?.value || 0;
        bValue = PRIORITIES[b.priority]?.value || 0;
        break;
      case 'created':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'alphabetical':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'duration':
        aValue = a.duration || 0;
        bValue = b.duration || 0;
        break;
      default:
        return 0;
    }
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

export const filterTasks = (tasks, filters) => {
  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = task.title.toLowerCase().includes(searchLower) ||
                           task.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.status === 'pending' && task.completed) return false;
      if (filters.status === 'overdue' && !isOverdue(task.dueDate, task.completed)) return false;
    }
    
    // Quadrant filter
    if (filters.quadrant && filters.quadrant !== 'all') {
      if (task.quadrant !== filters.quadrant) return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const taskDate = new Date(task.dueDate);
      if (filters.dateFrom && taskDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && taskDate > new Date(filters.dateTo)) return false;
    }
    
    return true;
  });
};

export const getUpcomingTasks = (tasks, days = 7) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return tasks
    .filter(task => {
      if (task.completed) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= futureDate;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

export const getTasksForToday = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return tasks.filter(task => {
    if (task.completed) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });
};

export const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateTaskData = (task) => {
  const errors = {};
  
  if (!task.title || task.title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  
  if (!task.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const dueDate = new Date(task.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Invalid due date';
    }
  }
  
  if (!task.quadrant || !QUADRANTS[task.quadrant]) {
    errors.quadrant = 'Invalid quadrant';
  }
  
  if (!task.priority || !PRIORITIES[task.priority]) {
    errors.priority = 'Invalid priority';
  }
  
  if (task.duration && (isNaN(task.duration) || task.duration < 0)) {
    errors.duration = 'Duration must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  QUADRANTS,
  PRIORITIES,
  formatDate,
  formatDuration,
  isOverdue,
  getDaysUntilDue,
  getTaskStats,
  sortTasks,
  filterTasks,
  getUpcomingTasks,
  getTasksForToday,
  generateTaskId,
  validateTaskData,
};
