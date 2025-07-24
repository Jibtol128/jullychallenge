// Notification API calls
export const notificationAPI = {
  getUnreadCount: () => axios.get('http://localhost/task-manager/backend/get_unread_notifications.php', { withCredentials: true }),
  getAll: () => axios.get('http://localhost/task-manager/backend/get_notifications.php', { withCredentials: true }),
  markAsRead: (id) => axios.post('http://localhost/task-manager/backend/mark_notification_read.php', { id }, { withCredentials: true }),
};
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost/task-manager/backend/api', // PHP backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Task API calls
export const taskAPI = {
  getTasks: () => api.get('/tasks'),
  getTask: (id) => api.get(`/tasks/${id}`),
  getTasksByQuadrant: (quadrant) => api.get(`/tasks/quadrant/${quadrant}`),
  getOverdueTasks: () => api.get('/tasks/overdue'),
  getTodayTasks: () => api.get('/tasks/today'),
  createTask: (taskData) => api.post('/tasks', taskData),
  createTaskWithAI: (rawInput) => api.post('/tasks/ai-process', { rawInput }, { timeout: 20000 }),
  updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),
  toggleTask: (taskId) => api.patch(`/tasks/${taskId}/toggle`),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  processWithAI: (payload) => api.post('/tasks/ai-process', payload, { timeout: 20000 }),
  scheduleSuggestion: (taskData) => api.post('/tasks/schedule-suggestion', taskData),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.post('/auth/profile', updates),
};

// AI API calls
export const aiAPI = {
  processTask: (rawInput) => api.post('/tasks/ai-process', { rawInput }, { timeout: 20000 }),
};

export default api;
