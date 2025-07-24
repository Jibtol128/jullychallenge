import React, { useState } from 'react';
import { PlusCircle, Brain, Loader2, Sparkles, X } from 'lucide-react';
import { taskAPI } from '../utils/api';

// Helper function to format date for datetime-local input
function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  // If already in correct format, return as is
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateString)) return dateString.substring(0,16);
  // If only date, add T23:59
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString + 'T23:59';
  // If browser auto-fills T00:00, change to T23:59
  if (/^\d{4}-\d{2}-\d{2}T00:00$/.test(dateString)) return dateString.replace('T00:00', 'T23:59');
  // Try to parse and format
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TaskInput = ({ onAddTask, isProcessing }) => {
  const [inputs, setInputs] = useState(['']);
  const [durations, setDurations] = useState(['']);
  const [scheduleSuggestions, setScheduleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState([]);
  const [dueDates, setDueDates] = useState(['']); // Only date part (YYYY-MM-DD)
  const [dueTimes, setDueTimes] = useState(['13:00']); // Only time part (HH:mm), default to 13:00

  const handleInputChange = (idx, value) => {
    const newInputs = [...inputs];
    newInputs[idx] = value;
    setInputs(newInputs);
    // Reset suggestion for this input
    const newScheduleSuggestions = [...scheduleSuggestions];
    newScheduleSuggestions[idx] = null;
    setScheduleSuggestions(newScheduleSuggestions);
    const newShowSuggestions = [...showSuggestions];
    newShowSuggestions[idx] = false;
    setShowSuggestions(newShowSuggestions);
  };

  const handleDurationChange = (idx, value) => {
    const newDurations = [...durations];
    newDurations[idx] = value;
    setDurations(newDurations);
    // Reset suggestion for this input
    const newScheduleSuggestions = [...scheduleSuggestions];
    newScheduleSuggestions[idx] = null;
    setScheduleSuggestions(newScheduleSuggestions);
    const newShowSuggestions = [...showSuggestions];
    newShowSuggestions[idx] = false;
    setShowSuggestions(newShowSuggestions);
  };

  const handleGetScheduleSuggestion = async (idx) => {
    const input = inputs[idx];
    const duration = durations[idx] ? parseInt(durations[idx]) : null;
    if (!input || !duration) return;
    const newShowSuggestions = [...showSuggestions];
    newShowSuggestions[idx] = true;
    setShowSuggestions(newShowSuggestions);
    const newScheduleSuggestions = [...scheduleSuggestions];
    newScheduleSuggestions[idx] = null;
    setScheduleSuggestions(newScheduleSuggestions);
    try {
      const response = await taskAPI.scheduleSuggestion({
        title: input,
        duration,
        priority: determinePriority(input),
        quadrant: determineQuadrant(input)
      });
      if (response.data.success) {
        newScheduleSuggestions[idx] = response.data;
        // Auto-fill due date
        const newDueDates = [...dueDates];
        newDueDates[idx] = response.data.suggested_date;
        setDueDates(newDueDates);
      } else {
        newScheduleSuggestions[idx] = { error: response.data.error || 'No suggestion available.' };
      }
      setScheduleSuggestions([...newScheduleSuggestions]);
    } catch (error) {
      newScheduleSuggestions[idx] = { error: error.response?.data?.error || 'Failed to get suggestion.' };
      setScheduleSuggestions([...newScheduleSuggestions]);
    }
  };

  const handleAddInput = () => {
    setInputs([...inputs, '']);
    setDurations([...durations, '']);
    setScheduleSuggestions([...scheduleSuggestions, null]);
    setShowSuggestions([...showSuggestions, false]);
    setDueDates([...dueDates, '']);
    setDueTimes([...dueTimes, '13:00']); // Default new input to 13:00
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const tasks = inputs.map((input, idx) => {
        // Ensure duration is always a positive integer, default to 1 if invalid
        const duration = durations[idx] && parseInt(durations[idx]) > 0 ? parseInt(durations[idx]) : 1;
        const datePart = dueDates[idx] || '';
        let timePart = (dueTimes[idx] !== undefined && dueTimes[idx] !== '') ? dueTimes[idx] : '13:00';
        // Always send due_time as HH:mm (trim seconds if present)
        if (/^\d{2}:\d{2}:\d{2}$/.test(timePart)) {
          timePart = timePart.substring(0,5);
        }
        console.log('DEBUG dueTimes:', dueTimes, 'idx:', idx, 'raw dueTimes[idx]:', dueTimes[idx], 'final timePart:', timePart);
        console.log('Submitting task:', input.trim(), 'due_date:', datePart, 'due_time:', timePart);
        return {
          task: input.trim(),
          duration: duration,
          due_date: datePart,
          due_time: timePart,
        };
      }).filter(item => item.task);
      if (tasks.length === 0) return;

      tasks.reduce((p, taskData) => {
        return p.then(() => onAddTask({
          rawInput: taskData.task,
          userDuration: taskData.duration,
          due_date: taskData.due_date,
          due_time: taskData.due_time,
          useAI: true
        }));
      }, Promise.resolve())
      .then(() => {
        setInputs(['']);
        setDurations(['']);
        setDueDates(['']);
        setDueTimes(['13:00']);
        setScheduleSuggestions([]);
        setShowSuggestions([]);
      })
      .catch((err) => {
        console.error('Error adding task:', err);
        // Do not clear fields if there was an error
      });
    }, 150);
  } // <-- Fix: close handleSubmit function
  // Fix: Add handleRemoveInput function
  const handleRemoveInput = (idx) => {
    setInputs(inputs => inputs.filter((_, i) => i !== idx));
    setDurations(durations => durations.filter((_, i) => i !== idx));
    setDueDates(dueDates => dueDates.filter((_, i) => i !== idx));
    setDueTimes(dueTimes => dueTimes.filter((_, i) => i !== idx));
    setScheduleSuggestions(suggestions => suggestions.filter((_, i) => i !== idx));
    setShowSuggestions(show => show.filter((_, i) => i !== idx));
  };
  // Fix: Add placeholder functions for determinePriority and determineQuadrant
  function determinePriority(input) {
    // Simple keyword-based priority (customize as needed)
    const text = input.toLowerCase();
    if (/\b(urgent|asap|critical|immediately|high priority|must|client|finalize|annual|report|launch|project|goal|essential|crucial|schedule)\b/.test(text)) {
      return 'high';
    } else if (/\b(important|follow up|remind|medium priority|update|strategy|plan|growth|develop|improve|goal|essential|crucial|schedule)\b/.test(text)) {
      return 'medium';
    } else if (/\b(low priority|call|reminder|notify|ping|check|quick|routine|admin|emails|respond|send|email|team|tomorrow)\b/.test(text)) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  function determineQuadrant(input) {
    // Simple logic: urgent+high=Q1, not urgent+high/medium=Q2, urgent+medium/low=Q3, not urgent+low=Q4
    const priority = determinePriority(input);
    const text = input.toLowerCase();
    const isUrgent = /\b(urgent|asap|critical|immediately|today|now|deadline)\b/.test(text);
    if (isUrgent && priority === 'high') return 'Q1';
    if (!isUrgent && (priority === 'high' || priority === 'medium')) return 'Q2';
    if (isUrgent && (priority === 'medium' || priority === 'low')) return 'Q3';
    if (!isUrgent && priority === 'low') return 'Q4';
    return 'Q2';
  }

  const extractDueDate = (text) => {
    const today = new Date();
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    if (lowerText.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    // Default to 3 days from now
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 3);
    return defaultDate.toISOString().split('T')[0];
  };

  const estimateDuration = (text) => {
    const lowerText = text.toLowerCase();
    
    // Look for explicit duration mentions
    const hourMatch = lowerText.match(/(\d+)\s*hour/);
    const minuteMatch = lowerText.match(/(\d+)\s*minute/);
    
    if (hourMatch) {
      return parseInt(hourMatch[1]) * 60;
    }
    if (minuteMatch) {
      return parseInt(minuteMatch[1]);
    }
    
    // Estimate based on task complexity
    const wordCount = text.split(' ').length;
    if (wordCount > 20) return 90; // Complex task
    if (wordCount > 10) return 60; // Medium task
    return 30; // Simple task
  };

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Add New Tasks</h2>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-600">
          Enter each task in a separate box and set the duration (in minutes) you want to spend on it. Click + to add more tasks. AI will analyze and categorize each.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputs.map((input, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => handleInputChange(idx, e.target.value)}
                placeholder={`Task ${idx + 1}`}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                // Keep input enabled during processing so user can see/edit
              />
              <input
                type="number"
                value={durations[idx] || ''}
                onChange={e => handleDurationChange(idx, e.target.value)}
                placeholder="Duration (min)"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
              />
              <input
                type="date"
                value={dueDates[idx] || ''}
                onChange={e => {
                  const newDueDates = [...dueDates];
                  newDueDates[idx] = e.target.value;
                  setDueDates(newDueDates);
                }}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="time"
                value={dueTimes[idx] !== undefined && dueTimes[idx] !== '' ? dueTimes[idx] : '13:00'}
                onChange={e => {
                  const newDueTimes = [...dueTimes];
                  let val = e.target.value;
                  if (/^\d{2}:\d{2}:\d{2}$/.test(val)) {
                    val = val.substring(0,5);
                  }
                  newDueTimes[idx] = val;
                  setDueTimes(newDueTimes);
                }}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                step="60"
              />
              <button
                type="button"
                onClick={() => handleGetScheduleSuggestion(idx)}
                className="btn-secondary text-blue-600 whitespace-nowrap"
                disabled={isProcessing || !input.trim() || !durations[idx]}
              >
                Suggest Time
              </button>
              {inputs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveInput(idx)}
                  className="text-red-500 hover:text-red-700"
                  tabIndex={-1}
                  aria-label="Remove task"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {durations[idx] && (
              <div className="text-xs text-gray-500 ml-1">
                Estimated duration: {durations[idx]} minutes
              </div>
            )}
            {showSuggestions[idx] && scheduleSuggestions[idx] && (
              <div className={`mt-2 text-xs rounded p-2 ${scheduleSuggestions[idx].error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {scheduleSuggestions[idx].error ? (
                  <span>
                    <b>Error:</b> {scheduleSuggestions[idx].error}
                  </span>
                ) : (
                  <span>
                    Suggested: <b>{scheduleSuggestions[idx].suggested_date}</b> from <b>{scheduleSuggestions[idx].suggested_start}</b> to <b>{scheduleSuggestions[idx].suggested_end}</b>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleAddInput}
            className="btn-secondary flex items-center space-x-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add another</span>
          </button>
          <button
            type="submit"
            disabled={inputs.every(i => !i.trim()) || isProcessing}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            <span>{isProcessing ? 'Analyzing...' : 'Add Task(s)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
export default TaskInput;
