import React, { useState, useRef } from 'react';
import { Clock, Pause, Play, RotateCcw, Coffee, Brain, Award, Target } from 'lucide-react';


// Default values
const DEFAULT_POMODORO = 25 * 60;
const DEFAULT_SHORT_BREAK = 5 * 60;
const DEFAULT_LONG_BREAK = 15 * 60;

const PomodoroTimer = ({ tasks = [] }) => {
  // Try to load state from localStorage
  const getInitialState = () => {
    const saved = localStorage.getItem('pomodoroState');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const initial = getInitialState();
  const [focusDuration, setFocusDuration] = useState(initial?.focusDuration || 25);
  const [shortBreak, setShortBreak] = useState(initial?.shortBreak || 5);
  const [longBreak, setLongBreak] = useState(initial?.longBreak || 15);
  const [mode, setMode] = useState(initial?.mode || 'work');
  const [cycles, setCycles] = useState(initial?.cycles || 0);
  const [selectedTaskId, setSelectedTaskId] = useState(initial?.selectedTaskId || '');
  const [isRunning, setIsRunning] = useState(
    initial?.isRunning !== undefined ? initial.isRunning : false
  );
  const [startTimestamp, setStartTimestamp] = useState(initial?.startTimestamp || null);

  // Request notification permission on mount
  React.useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (initial && initial.isRunning && initial.startTimestamp) {
      // Calculate how much time left based on now
      const now = Date.now();
      const elapsed = Math.floor((now - initial.startTimestamp) / 1000);
      let total = 0;
      if (initial.mode === 'work') total = (initial.focusDuration || 25) * 60;
      else if (initial.mode === 'short') total = (initial.shortBreak || 5) * 60;
      else total = (initial.longBreak || 15) * 60;
      return Math.max(total - elapsed, 0);
    }
    // Not running, use saved or default
    if (initial) {
      if (initial.mode === 'work') return (initial.focusDuration || 25) * 60;
      if (initial.mode === 'short') return (initial.shortBreak || 5) * 60;
      return (initial.longBreak || 15) * 60;
    }
    return DEFAULT_POMODORO;
  });
  const intervalRef = useRef(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    const now = Date.now();
    setStartTimestamp(now);
    localStorage.setItem('pomodoroState', JSON.stringify({
      focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId, isRunning: true, startTimestamp: now
    }));
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setStartTimestamp(null);
    localStorage.setItem('pomodoroState', JSON.stringify({
      focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId, isRunning: false, startTimestamp: null
    }));
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setStartTimestamp(null);
    let resetSeconds = mode === 'work' ? focusDuration * 60 : mode === 'short' ? shortBreak * 60 : longBreak * 60;
    setSecondsLeft(resetSeconds);
    localStorage.setItem('pomodoroState', JSON.stringify({
      focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId, isRunning: false, startTimestamp: null
    }));
  };

  // Timer ticking effect: always runs if isRunning and startTimestamp
  React.useEffect(() => {
    if (!isRunning || !startTimestamp) return;
    function tick() {
      const now = Date.now();
      let total = mode === 'work' ? focusDuration * 60 : mode === 'short' ? shortBreak * 60 : longBreak * 60;
      const elapsed = Math.floor((now - startTimestamp) / 1000);
      const left = Math.max(total - elapsed, 0);
      setSecondsLeft(left);
      if (left <= 0) {
        // Session ended
        // Show notification
        if (window.Notification && Notification.permission === 'granted') {
          const title = mode === 'work' ? 'Focus session complete!' : (mode === 'short' ? 'Short break over!' : 'Long break over!');
          const body = mode === 'work' ? 'Time for a break.' : 'Time to get back to work!';
          new Notification(title, { body });
        }
        // Move to next mode
        let nextMode, nextSeconds, nextCycles = cycles;
        if (mode === 'work') {
          nextCycles = cycles + 1;
          nextMode = cycles % 3 === 2 ? 'long' : 'short';
          nextSeconds = cycles % 3 === 2 ? longBreak * 60 : shortBreak * 60;
        } else {
          nextMode = 'work';
          nextSeconds = focusDuration * 60;
        }
        setMode(nextMode);
        setCycles(nextCycles);
        setIsRunning(true);
        setStartTimestamp(Date.now());
        setSecondsLeft(nextSeconds);
        localStorage.setItem('pomodoroState', JSON.stringify({
          focusDuration, shortBreak, longBreak, mode: nextMode, cycles: nextCycles, selectedTaskId, isRunning: true, startTimestamp: Date.now()
        }));
      } else {
        // Save state
        localStorage.setItem('pomodoroState', JSON.stringify({
          focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId, isRunning, startTimestamp
        }));
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [isRunning, startTimestamp, mode, focusDuration, shortBreak, longBreak, cycles, selectedTaskId]);

  // If timer is not running, update secondsLeft when settings change
  React.useEffect(() => {
    if (!isRunning) {
      let secs = mode === 'work' ? focusDuration * 60 : mode === 'short' ? shortBreak * 60 : longBreak * 60;
      setSecondsLeft(secs);
      localStorage.setItem('pomodoroState', JSON.stringify({
        focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId, isRunning, startTimestamp: null
      }));
    }
    // eslint-disable-next-line
  }, [focusDuration, shortBreak, longBreak, mode, cycles, selectedTaskId]);

  // On mount, if timer was running, resume ticking
  React.useEffect(() => {
    if (isRunning && secondsLeft > 0 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setStartTimestamp(null);
            let nextMode, nextSeconds, nextCycles = cycles;
            if (mode === 'work') {
              nextCycles = cycles + 1;
              nextMode = cycles % 3 === 2 ? 'long' : 'short';
              nextSeconds = cycles % 3 === 2 ? longBreak * 60 : shortBreak * 60;
            } else {
              nextMode = 'work';
              nextSeconds = focusDuration * 60;
            }
            setMode(nextMode);
            setCycles(nextCycles);
            setSecondsLeft(nextSeconds);
            localStorage.setItem('pomodoroState', JSON.stringify({
              focusDuration, shortBreak, longBreak, mode: nextMode, cycles: nextCycles, selectedTaskId, isRunning: false, startTimestamp: null
            }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, []);

  const selectedTask = tasks.find(t => t.id == selectedTaskId);
  const progress = mode === 'work' 
    ? 1 - (secondsLeft / (focusDuration * 60))
    : mode === 'short'
    ? 1 - (secondsLeft / (shortBreak * 60))
    : 1 - (secondsLeft / (longBreak * 60));

  const getModeIcon = () => {
    if (mode === 'work') return <Brain className="h-6 w-6" />;
    if (mode === 'short') return <Coffee className="h-6 w-6" />;
    return <Award className="h-6 w-6" />;
  };

  const getModeColor = () => {
    if (mode === 'work') return 'from-blue-500 to-purple-600';
    if (mode === 'short') return 'from-green-500 to-teal-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pomodoro Focus</h1>
          <p className="text-gray-600">Boost your productivity with focused work sessions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Card - Main Focus */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getModeColor()} opacity-5`}></div>
              
              <div className="relative z-10">
                {/* Mode Indicator */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r ${getModeColor()} text-white shadow-lg`}>
                    {getModeIcon()}
                    <span className="font-semibold text-lg">
                      {mode === 'work' ? 'Focus Time' : mode === 'short' ? 'Short Break' : 'Long Break'}
                    </span>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={mode === 'work' ? '#3b82f6' : mode === 'short' ? '#10b981' : '#f59e0b'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    
                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-4xl font-mono font-bold text-gray-900">{formatTime(secondsLeft)}</span>
                      <span className="text-sm text-gray-500 mt-1">
                        {Math.round(progress * 100)}% complete
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center space-x-4 mb-6">
                  {isRunning ? (
                    <button 
                      onClick={pauseTimer} 
                      className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Pause className="h-6 w-6" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button 
                      onClick={startTimer} 
                      disabled={!selectedTaskId}
                      className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Play className="h-6 w-6" />
                      <span>Start Focus</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={resetTimer}
                    className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <RotateCcw className="h-6 w-6" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Stats */}
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-900 font-semibold">Completed Sessions: {cycles}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings & Task Selection */}
          <div className="space-y-6">
            {/* Timer Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                Timer Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Focus Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={focusDuration}
                      onChange={e => setFocusDuration(Number(e.target.value))}
                      disabled={isRunning}
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">min</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Break</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        value={shortBreak}
                        onChange={e => setShortBreak(Number(e.target.value))}
                        disabled={isRunning}
                      />
                      <span className="absolute right-2 top-2 text-gray-500 text-xs">min</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Long Break</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        value={longBreak}
                        onChange={e => setLongBreak(Number(e.target.value))}
                        disabled={isRunning}
                      />
                      <span className="absolute right-2 top-2 text-gray-500 text-xs">min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-purple-600" />
                Choose Your Focus
              </h3>
              
              <div className="space-y-4">
                <select
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="">-- Select a task to focus on --</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
                
                {selectedTask && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-purple-900">Currently focusing on:</div>
                        <div className="font-medium text-gray-900">{selectedTask.title}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Today's Progress
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{cycles}</div>
                  <div className="text-sm text-gray-600">Sessions</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{Math.round(cycles * focusDuration / 60 * 10) / 10}</div>
                  <div className="text-sm text-gray-600">Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
};

export default PomodoroTimer;
