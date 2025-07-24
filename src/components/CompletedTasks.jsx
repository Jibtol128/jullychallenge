import React, { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Clock, Flag, Trash2, Trophy, Star, Target } from 'lucide-react';

const CompletedTasks = ({ tasks, onDeleteTask }) => {
  const completedTasks = tasks.filter(task => task.completed);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateCards(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const sortedTasks = [...completedTasks].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.completed_at || a.created_at) - new Date(b.completed_at || b.created_at);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      default: // newest
        return new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at);
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getQuadrantInfo = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return { label: 'Urgent & Important', color: 'bg-red-100 text-red-700', icon: '🔥' };
      case 'Q2': return { label: 'Important, Not Urgent', color: 'bg-blue-100 text-blue-700', icon: '⭐' };
      case 'Q3': return { label: 'Urgent, Not Important', color: 'bg-yellow-100 text-yellow-700', icon: '⚡' };
      case 'Q4': return { label: 'Neither Urgent nor Important', color: 'bg-gray-100 text-gray-700', icon: '📝' };
      default: return { label: 'Unassigned', color: 'bg-gray-100 text-gray-600', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg animate-scale-in">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Completed Tasks
                </h1>
                <p className="text-gray-600 mt-1">
                  {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} completed
                </p>
              </div>
            </div>
            
            {/* Sort Controls */}
            {completedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            )}
          </div>
          
          {/* Stats Cards */}
          {completedTasks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm opacity-90">Total Completed</span>
                </div>
                <div className="text-2xl font-bold mt-1">{completedTasks.length}</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span className="text-sm opacity-90">High Priority</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {completedTasks.filter(t => t.priority === 'high').length}
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="text-sm opacity-90">This Week</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {completedTasks.filter(t => {
                    const taskDate = new Date(t.completed_at || t.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return taskDate >= weekAgo;
                  }).length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks List */}
        {completedTasks.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 text-center">
            <div className="max-w-sm mx-auto">
              <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Trophy className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed tasks yet!</h3>
              <p className="text-gray-600">Complete some tasks to see them here and celebrate your achievements.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task, index) => {
              const quadrantInfo = getQuadrantInfo(task.quadrant);
              return (
                <div 
                  key={task.id} 
                  className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform completed-task-card ${animateCards ? 'animate-in' : ''}`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md flex-shrink-0 mt-1">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 group-hover:text-green-600 transition-colors">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Task Meta Information */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {task.due_date && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.due_time && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg">
                            <Clock className="h-4 w-4" />
                            <span>{task.due_time}</span>
                          </div>
                        )}
                        {task.priority && (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${getPriorityColor(task.priority)}`}>
                            <Flag className="h-4 w-4" />
                            <span className="capitalize font-medium">{task.priority}</span>
                          </div>
                        )}
                        {task.quadrant && (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${quadrantInfo.color}`}>
                            <span className="text-sm">{quadrantInfo.icon}</span>
                            <span className="font-medium">{quadrantInfo.label}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center lg:items-start">
                      <button
                        onClick={() => onDeleteTask && onDeleteTask(task.id)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all duration-200 group-hover:shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedTasks;
