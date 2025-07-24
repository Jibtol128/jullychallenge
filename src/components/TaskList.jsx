import React, { useState } from 'react';
import { Filter, SortDesc, SortAsc, List } from 'lucide-react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, onToggleCompletion, errorMessage }) => {
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate', 'priority', 'created', 'alphabetical'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [filterQuadrant, setFilterQuadrant] = useState('all'); // 'all', 'Q1', 'Q2', 'Q3', 'Q4'

  const getPriorityValue = (priority) => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'dueDate':
        aValue = new Date(a.dueDate || a.due_date);
        bValue = new Date(b.dueDate || b.due_date);
        break;
      case 'priority':
        aValue = getPriorityValue(a.priority);
        bValue = getPriorityValue(b.priority);
        break;
      case 'created':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'alphabetical':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const filteredTasks = sortedTasks.filter(task => {
    if (filterQuadrant === 'all') return true;
    return task.quadrant === filterQuadrant;
  }).map(task => ({ ...task, dueDate: task.dueDate || task.due_date }));

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getQuadrantLabel = (quadrant) => {
    switch (quadrant) {
      case 'Q1': return 'Urgent & Important';
      case 'Q2': return 'Important, Not Urgent';
      case 'Q3': return 'Urgent, Not Important';
      case 'Q4': return 'Neither Urgent nor Important';
      default: return 'All Quadrants';
    }
  };

  const getQuadrantStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length,
      Q1: tasks.filter(t => t.quadrant === 'Q1').length,
      Q2: tasks.filter(t => t.quadrant === 'Q2').length,
      Q3: tasks.filter(t => t.quadrant === 'Q3').length,
      Q4: tasks.filter(t => t.quadrant === 'Q4').length,
    };
    return stats;
  };

  const stats = getQuadrantStats();

  return (
    <div className="space-y-6">
      // ...existing code...
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Tasks</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-500">Overdue</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.Q1}</div>
          <div className="text-sm text-gray-500">Critical (Q1)</div>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-2">
            <List className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Task List</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Quadrant Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterQuadrant}
                onChange={(e) => setFilterQuadrant(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="all">All Quadrants</option>
                <option value="Q1">Q1: Urgent & Important</option>
                <option value="Q2">Q2: Important, Not Urgent</option>
                <option value="Q3">Q3: Urgent, Not Important</option>
                <option value="Q4">Q4: Neither</option>
              </select>
            </div>
            
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Created Date</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              
              <button
                onClick={toggleSortOrder}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4 text-gray-500" />
                ) : (
                  <SortDesc className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {filterQuadrant === 'all' 
                ? "You don't have any tasks yet. Add one above!" 
                : `No tasks in ${getQuadrantLabel(filterQuadrant)}`
              }
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onToggleCompletion={onToggleCompletion}
            />
          ))
        )}
      </div>

      {/* Summary */}
      {filteredTasks.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredTasks.length} of {tasks.length} tasks
          {filterQuadrant !== 'all' && (
            <span> in {getQuadrantLabel(filterQuadrant)}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
