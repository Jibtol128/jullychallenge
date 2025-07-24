import React from 'react';
import { Clock, AlertTriangle, Target, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard';

const EisenhowerMatrix = ({ tasks, onUpdateTask, onDeleteTask, onToggleCompletion }) => {
  // Provide default functions if not passed
  const handleUpdateTask = onUpdateTask || (() => {});
  const handleDeleteTask = onDeleteTask || (() => {});
  const handleToggleCompletion = onToggleCompletion || (() => {});
  const quadrants = [
    {
      id: 'Q1',
      title: 'Urgent & Important',
      subtitle: 'Do First',
      color: 'urgent',
      icon: AlertTriangle,
      tasks: tasks.filter(task => task.quadrant === 'Q1'),
    },
    {
      id: 'Q2',
      title: 'Not Urgent & Important',
      subtitle: 'Schedule',
      color: 'important',
      icon: Target,
      tasks: tasks.filter(task => task.quadrant === 'Q2'),
    },
    {
      id: 'Q3',
      title: 'Urgent & Not Important',
      subtitle: 'Delegate',
      color: 'blue',
      icon: Clock,
      tasks: tasks.filter(task => task.quadrant === 'Q3'),
    },
    {
      id: 'Q4',
      title: 'Not Urgent & Not Important',
      subtitle: 'Eliminate',
      color: 'gray',
      icon: Trash2,
      tasks: tasks.filter(task => task.quadrant === 'Q4'),
    },
  ];

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetQuadrant) => {
    e.preventDefault();
    const taskData = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (taskData.quadrant !== targetQuadrant) {
      handleUpdateTask(taskData.id, { quadrant: targetQuadrant });
    }
  };

  const getQuadrantClasses = (color) => {
    switch (color) {
      case 'urgent':
        return 'quadrant quadrant-q1';
      case 'important':
        return 'quadrant quadrant-q2';
      case 'blue':
        return 'quadrant quadrant-q3';
      case 'gray':
        return 'quadrant quadrant-q4';
      default:
        return 'quadrant';
    }
  };

  const getHeaderClasses = (color) => {
    switch (color) {
      case 'urgent':
        return 'text-urgent-800 bg-urgent-100 border-urgent-200';
      case 'important':
        return 'text-important-800 bg-important-100 border-important-200';
      case 'blue':
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'gray':
        return 'text-gray-800 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quadrants.map((quadrant) => {
        const IconComponent = quadrant.icon;
        return (
          <div
            key={quadrant.id}
            className={getQuadrantClasses(quadrant.color)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, quadrant.id)}
          >
            {/* Quadrant Header */}
            <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${getHeaderClasses(quadrant.color)}`}>
              <div className="flex items-center space-x-2">
                <IconComponent className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">{quadrant.title}</h3>
                  <p className="text-xs opacity-75">{quadrant.subtitle}</p>
                </div>
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                {quadrant.tasks.length}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {quadrant.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">No tasks in this quadrant</p>
                  <p className="text-xs text-gray-400 mt-1">Drag tasks here to categorize</p>
                </div>
              ) : (
                quadrant.tasks.map((task) => {
                  // Normalize due date property
                  const normalizedTask = { ...task, dueDate: task.dueDate || task.due_date };
                  return (
                    <TaskCard
                      key={normalizedTask.id}
                      task={normalizedTask}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      onToggleCompletion={handleToggleCompletion}
                      onDragStart={handleDragStart}
                      draggable
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EisenhowerMatrix;
