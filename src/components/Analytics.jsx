import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Analytics = ({ tasks, stats }) => {
  const getProductivityTrend = () => {
    // Calculate productivity trend over the last 7 days
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayTasks = tasks.filter(task => {
        if (!task.created_at) return false;
        const taskDate = new Date(task.created_at);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(task => task.completed).length;
      
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        tasks: dayTasks.length,
        completed,
        completionRate: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
      });
    }
    
    return days;
  };

  const getQuadrantAnalysis = () => {
    const quadrants = {
      Q1: { name: 'Urgent & Important', tasks: [], color: 'bg-red-500' },
      Q2: { name: 'Important, Not Urgent', tasks: [], color: 'bg-yellow-500' },
      Q3: { name: 'Urgent, Not Important', tasks: [], color: 'bg-blue-500' },
      Q4: { name: 'Neither Urgent nor Important', tasks: [], color: 'bg-gray-500' }
    };
    
    tasks.forEach(task => {
      if (quadrants[task.quadrant]) {
        quadrants[task.quadrant].tasks.push(task);
      }
    });
    
    return Object.entries(quadrants).map(([key, data]) => ({
      quadrant: key,
      name: data.name,
      count: data.tasks.length,
      completed: data.tasks.filter(t => t.completed).length,
      completionRate: data.tasks.length > 0 ? Math.round((data.tasks.filter(t => t.completed).length / data.tasks.length) * 100) : 0,
      color: data.color,
      percentage: stats.total > 0 ? Math.round((data.tasks.length / stats.total) * 100) : 0
    }));
  };

  const getPriorityAnalysis = () => {
    const priorities = {
      high: { name: 'High Priority', tasks: [], color: 'bg-red-500' },
      medium: { name: 'Medium Priority', tasks: [], color: 'bg-yellow-500' },
      low: { name: 'Low Priority', tasks: [], color: 'bg-green-500' }
    };
    
    tasks.forEach(task => {
      if (priorities[task.priority]) {
        priorities[task.priority].tasks.push(task);
      }
    });
    
    return Object.entries(priorities).map(([key, data]) => ({
      priority: key,
      name: data.name,
      count: data.tasks.length,
      completed: data.tasks.filter(t => t.completed).length,
      completionRate: data.tasks.length > 0 ? Math.round((data.tasks.filter(t => t.completed).length / data.tasks.length) * 100) : 0,
      color: data.color,
      percentage: stats.total > 0 ? Math.round((data.tasks.length / stats.total) * 100) : 0
    }));
  };

  const getTimeAnalysis = () => {
    const totalTime = tasks.reduce((sum, task) => sum + (task.duration || 0), 0);
    const completedTime = tasks.filter(t => t.completed).reduce((sum, task) => sum + (task.duration || 0), 0);
    const pendingTime = tasks.filter(t => !t.completed).reduce((sum, task) => sum + (task.duration || 0), 0);
    
    return {
      total: totalTime,
      completed: completedTime,
      pending: pendingTime,
      efficiency: totalTime > 0 ? Math.round((completedTime / totalTime) * 100) : 0
    };
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  const formatHours = (minutes) => {
    return (minutes / 60).toFixed(1);
  };

  const productivityTrend = getProductivityTrend();
  const quadrantAnalysis = getQuadrantAnalysis();
  const priorityAnalysis = getPriorityAnalysis();
  const timeAnalysis = getTimeAnalysis();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completionRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900">{timeAnalysis.efficiency}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${timeAnalysis.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Task Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{formatDuration(stats.averageTaskDuration)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-2xl font-semibold text-gray-900">{formatHours(timeAnalysis.total)}h</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">7-Day Productivity Trend</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {productivityTrend.map((day, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900 w-20">{day.date}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{day.tasks} tasks</span>
                  <span className="text-sm text-green-600">{day.completed} completed</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${day.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">{day.completionRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quadrant Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Quadrant Analysis</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {quadrantAnalysis.map((item) => (
              <div key={item.quadrant} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.quadrant}</span>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="ml-7">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>{item.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Analysis */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Priority Analysis</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {priorityAnalysis.map((item) => (
              <div key={item.priority} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{item.priority}</span>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="ml-7">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Completion Rate</span>
                    <span>{item.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Time Distribution</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-semibold text-blue-600">
                {formatHours(timeAnalysis.total)}h
              </p>
              <p className="text-sm text-gray-600">Total Estimated</p>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-semibold text-green-600">
                {formatHours(timeAnalysis.completed)}h
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="text-center">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-semibold text-yellow-600">
                {formatHours(timeAnalysis.pending)}h
              </p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
          <Target className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {stats.overdue > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Address Overdue Tasks</p>
                <p className="text-sm text-red-700">
                  You have {stats.overdue} overdue tasks. Consider prioritizing these or adjusting their deadlines.
                </p>
              </div>
            </div>
          )}
          
          {stats.quadrants.Q1 > stats.quadrants.Q2 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Focus on Q2 Activities</p>
                <p className="text-sm text-yellow-700">
                  You have more urgent tasks than important ones. Try to spend more time on Q2 (Important, Not Urgent) activities.
                </p>
              </div>
            </div>
          )}
          
          {stats.completionRate < 70 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Improve Completion Rate</p>
                <p className="text-sm text-blue-700">
                  Your completion rate is {stats.completionRate}%. Consider breaking down large tasks into smaller ones.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
