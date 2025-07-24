<?php
// Set PHP timezone to local (change to your timezone if needed)
date_default_timezone_set('Europe/Berlin');
/**
 * Tasks API Endpoints
 * Handles task CRUD operations
 */

// Always send CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../config/database.php';
require_once '../models/Task.php';
require_once '../utils/Auth.php';

$database = new Database();
$db = $database->connect();
$task = new Task($db);
$auth = new Auth();

$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = isset($_SERVER['PATH_INFO']) ? $_SERVER['PATH_INFO'] : '';
$request = explode('/', trim($pathInfo, '/'));

switch ($method) {
    case 'GET':
        if (empty($request[0])) {
            handleGetTasks();
        } elseif ($request[0] === 'overdue') {
            handleGetOverdueTasks();
        } elseif ($request[0] === 'today') {
            handleGetTodayTasks();
        } elseif ($request[0] === 'quadrant' && isset($request[1])) {
            handleGetTasksByQuadrant($request[1]);
        } elseif (is_numeric($request[0])) {
            handleGetTask($request[0]);
        }
        break;

    case 'POST':
        if (empty($request[0])) {
            handleCreateTask();
        } elseif ($request[0] === 'ai-process') {
            handleGeminiProcess();
        } elseif ($request[0] === 'test') {
            // Simple test endpoint
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'API is working', 'timestamp' => date('Y-m-d H:i:s')]);
        } elseif ($request[0] === 'schedule-suggestion') {
            handleScheduleSuggestion();
        }
        break;

    case 'PUT':
        if (is_numeric($request[0])) {
            handleUpdateTask($request[0]);
        }
        break;

    case 'PATCH':
        if (is_numeric($request[0]) && $request[1] === 'toggle') {
            handleToggleTask($request[0]);
        }
        break;

    case 'DELETE':
        if (is_numeric($request[0])) {
            handleDeleteTask($request[0]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
// Suggest optimal schedule for a new task
function handleScheduleSuggestion() {
    global $task, $auth;

    try {
        $userId = $auth->requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['title']) || !isset($data['duration'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: title and duration']);
            return;
        }

        $priority = $data['priority'] ?? 'medium';
        $quadrant = $data['quadrant'] ?? 'Q2';
        $duration = (int)$data['duration'];

        // Get user's existing tasks (today and future)
        $tasks = $task->getUserTasks($userId);

        // Build a list of occupied time slots (for today and future)
        $occupied = [];
        foreach ($tasks as $t) {
            if (!empty($t['due_date']) && !empty($t['duration']) && $t['duration'] > 0) {
                $occupied[] = [
                    'date' => $t['due_date'],
                    'duration' => (int)$t['duration']
                ];
            }
        }

        // Find earliest available slot (simple version: suggest today if not full, else next day)
        $maxDailyMinutes = 480; // 8 hours per day
        $suggestDate = date('Y-m-d');
        $found = false;
        for ($i = 0; $i < 14; $i++) { // look ahead 2 weeks
            $date = date('Y-m-d', strtotime("+$i day"));
            $used = 0;
            foreach ($occupied as $slot) {
                if ($slot['date'] === $date) {
                    $used += $slot['duration'];
                }
            }
            if ($used + $duration <= $maxDailyMinutes) {
                $suggestDate = $date;
                $found = true;
                break;
            }
        }

        // Suggest time block (start at 09:00, add used minutes)
        $startHour = 9;
        $startMinute = 0;
        $used = 0;
        foreach ($occupied as $slot) {
            if ($slot['date'] === $suggestDate) {
                $used += $slot['duration'];
            }
        }
        $blockStart = sprintf('%02d:%02d', $startHour + intdiv($used, 60), $startMinute + ($used % 60));
        $blockEndMinutes = $used + $duration;
        $blockEnd = sprintf('%02d:%02d', $startHour + intdiv($blockEndMinutes, 60), $startMinute + ($blockEndMinutes % 60));

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'suggested_date' => $suggestDate,
            'suggested_start' => $blockStart,
            'suggested_end' => $blockEnd,
            'duration' => $duration,
            'priority' => $priority,
            'quadrant' => $quadrant
        ]);
    } catch (Exception $e) {
        error_log("Schedule suggestion exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Schedule suggestion failed: ' . $e->getMessage()]);
    }
}

function handleGetTasks() {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $tasks = $task->getUserTasks($userId);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'tasks' => $tasks
    ]);
}

function handleGetTask($taskId) {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $taskData = $task->getTaskById($taskId, $userId);
    if ($taskData) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'task' => $taskData
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Task not found']);
    }
}

function handleGetTasksByQuadrant($quadrant) {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    
    if (!in_array($quadrant, ['Q1', 'Q2', 'Q3', 'Q4'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid quadrant']);
        return;
    }
    
    $tasks = $task->getTasksByQuadrant($userId, $quadrant);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'tasks' => $tasks
    ]);
}

function handleGetOverdueTasks() {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $tasks = $task->getOverdueTasks($userId);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'tasks' => $tasks
    ]);
}
function handleGeminiProcess() {
    global $task, $auth;
    
    try {
        // Set a shorter execution time limit for this function
        set_time_limit(15); // 15 seconds max
        
        // Log entry into function
        error_log("handleGeminiProcess() called at " . date('Y-m-d H:i:s'));
        
        $userId = $auth->requireAuth();
        error_log("User authenticated: $userId");
        
        $rawInput = file_get_contents('php://input');
        error_log("Raw input data: " . $rawInput);
        $data = json_decode($rawInput, true);
        
        if (!$data || !isset($data['rawInput'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing rawInput']);
            return;
        }

        $rawInput = $data['rawInput'];
        $userDuration = $data['userDuration'] ?? null;
        // Accept both 'due_date' and 'dueDate' from frontend
        $frontendDueDate = $data['due_date'] ?? ($data['dueDate'] ?? null);
        $frontendDueTime = $data['due_time'] ?? ($data['dueTime'] ?? null);

        error_log("Gemini processing request - Raw Input: $rawInput, Duration: $userDuration, DueDate: $frontendDueDate, DueTime: $frontendDueTime");

        // Use internal logic if enabled
        require_once(__DIR__ . '/../config/config.php');
        if (defined('USE_INTERNAL_AI') && USE_INTERNAL_AI) {
            require_once(__DIR__ . '/../utils/internalTaskAnalysis.php');
            $internalResult = analyzeTaskInternally($rawInput, $userDuration, $frontendDueDate, $frontendDueTime);
            $taskId = $task->create(
                $userId,
                $internalResult['title'],
                $internalResult['description'],
                $internalResult['quadrant'],
                $internalResult['priority'],
                $internalResult['dueDate'],
                $frontendDueTime ?? '23:59',
                $internalResult['duration'],
                $internalResult['rawInput'],
                $internalResult['reasoning'],
                $internalResult['action_suggestion'],
                $internalResult['ai_processed']
            );
            if ($taskId) {
                $taskData = $task->getTaskById($taskId, $userId);
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Task created using internal logic',
                    'task' => $taskData
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create task using internal logic']);
            }
        } else {
            // Call Gemini API
            $geminiResult = callGeminiAPI($rawInput, $userDuration);
            if ($geminiResult && isset($geminiResult['title'])) {
                error_log("Gemini processing successful: " . json_encode($geminiResult));
                $dueDatePart = null;
                $dueTimePart = null;
                if ($frontendDueDate && preg_match('/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?$/', $frontendDueDate, $matches)) {
                    $dueDatePart = $matches[1];
                    $dueTimePart = $frontendDueTime ?? ($matches[2] ?? '23:59');
                } else if ($geminiResult['dueDate'] && preg_match('/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?$/', $geminiResult['dueDate'], $matches)) {
                    $dueDatePart = $matches[1];
                    $dueTimePart = $matches[2] ?? '23:59';
                } else {
                    $dueDatePart = date('Y-m-d');
                    $dueTimePart = '23:59';
                }
                $cleanDescription = isset($geminiResult['description']) ? str_replace('**', '', $geminiResult['description']) : '';
                $taskId = $task->create(
                    $userId,
                    $geminiResult['title'],
                    $cleanDescription,
                    $geminiResult['quadrant'] ?? 'Q2',
                    $geminiResult['priority'] ?? 'medium',
                    $dueDatePart,
                    $dueTimePart,
                    $geminiResult['duration'] ?? 0,
                    $geminiResult['rawInput'] ?? $rawInput,
                    null,
                    $geminiResult['action_suggestion'] ?? '',
                    1
                );
                if ($taskId) {
                    $taskData = $task->getTaskById($taskId, $userId);
                    if (isset($taskData['reasoning'])) {
                        unset($taskData['reasoning']);
                    }
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'AI-suggested task created and saved successfully',
                        'task' => $taskData
                    ]);
                } else {
                    error_log("Failed to save AI-suggested task to database");
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to save AI-suggested task to database']);
                }
            } else {
                error_log("Gemini processing failed - no valid result returned");
                $fallbackTitle = $rawInput;
                $fallbackDescription = $rawInput;
                $fallbackQuadrant = null;
                $fallbackPriority = null;
                $fallbackDuration = $userDuration && $userDuration > 0 ? $userDuration : 1;
                $dueDatePart = null;
                $dueTimePart = null;
                if ($frontendDueDate && preg_match('/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?$/', $frontendDueDate, $matches)) {
                    $dueDatePart = $matches[1];
                    $dueTimePart = $frontendDueTime ?? ($matches[2] ?? '23:59');
                } else {
                    $dueDatePart = date('Y-m-d');
                    $dueTimePart = '23:59';
                }
                $taskId = $task->create(
                    $userId,
                    $fallbackTitle,
                    $fallbackDescription,
                    $fallbackQuadrant,
                    $fallbackPriority,
                    $dueDatePart,
                    $dueTimePart,
                    $fallbackDuration,
                    $rawInput,
                    null,
                    'Review and categorize this task',
                    1
                );
                if ($taskId) {
                    $taskData = $task->getTaskById($taskId, $userId);
                    http_response_code(201);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Task created successfully (AI processing unavailable)',
                        'task' => $taskData
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to create fallback task']);
                }
            }
        }
    } catch (Exception $e) {
        error_log("Gemini processing exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Gemini processing failed: ' . $e->getMessage()]);
    }
}

// Example Gemini API call function (replace with real implementation)
function callGeminiAPI($rawInput, $userDuration = null) {
    // Updated Gemini API endpoint with correct model name
    $apiKey = 'AIzaSyB0ilX9JkfH_iI-FplSuxh-LKRQ7MV6OJU';
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' . $apiKey;

    // Enhanced prompt for better task analysis
    $prompt = "Analyze this task input and provide a structured task breakdown: '$rawInput'

Please analyze and categorize this task using the Eisenhower Matrix:
- Q1: Urgent and Important (crises, emergencies)
- Q2: Important but Not Urgent (planning, prevention, development)
- Q3: Urgent but Not Important (interruptions, some emails/calls)
- Q4: Neither Urgent nor Important (time wasters, trivial activities)

Also determine the priority level: high, medium, low, or very low.

Respond with a clear, actionable title and brief description.";

    $payload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 8); // 8 second timeout
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // 5 second connection timeout
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification for local testing
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Enhanced error logging
    error_log("Gemini API Call - URL: $url");
    error_log("Gemini API Call - HTTP Code: $httpCode");
    error_log("Gemini API Call - cURL Error: $curlError");
    error_log("Gemini API Call - Response: $response");

    if ($curlError) {
        error_log("cURL Error: $curlError");
        // Return fallback task instead of null
        return [
            'title' => $rawInput,
            'description' => 'Task created (AI service unavailable)',
            'quadrant' => 'Q2',
            'priority' => 'medium',
            'dueDate' => date('Y-m-d'),
            'duration' => ($userDuration && $userDuration > 0) ? $userDuration : 1,
            'rawInput' => $rawInput,
            'reasoning' => 'Fallback due to AI service timeout',
            'action_suggestion' => 'Review and categorize this task',
            'ai_processed' => 1
        ];
    }

    if ($httpCode === 200 && $response) {
        $result = json_decode($response, true);
        error_log("Gemini API Response parsed: " . json_encode($result));
        
        // Check if we have a valid response structure
        if ($result && isset($result['candidates']) && count($result['candidates']) > 0) {
            $aiResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            // Parse Gemini response to extract task details
            // Try to extract priority and quadrant from AI response
            $priority = 'medium';
            $quadrant = 'Q2';
            if (preg_match('/priority\s*[:\-]?\s*(high|medium|low|very low)/i', $aiResponse, $pmatch)) {
                $priority = strtolower($pmatch[1]);
            }
            if (preg_match('/quadrant\s*[:\-]?\s*(Q[1-4])/i', $aiResponse, $qmatch)) {
                $quadrant = strtoupper($qmatch[1]);
            } else if (preg_match('/(urgent and important)/i', $aiResponse)) {
                $quadrant = 'Q1';
            } else if (preg_match('/(important but not urgent)/i', $aiResponse)) {
                $quadrant = 'Q2';
            } else if (preg_match('/(urgent but not important)/i', $aiResponse)) {
                $quadrant = 'Q3';
            } else if (preg_match('/(neither urgent nor important)/i', $aiResponse)) {
                $quadrant = 'Q4';
            }

            $suggestedTask = [
                'title' => $rawInput,
                'description' => $aiResponse ?: 'AI-generated task analysis',
                'quadrant' => $quadrant,
                'priority' => $priority,
                'dueDate' => date('Y-m-d'),
                'duration' => ($userDuration && $userDuration > 0) ? $userDuration : 1,
                'rawInput' => $rawInput,
                'reasoning' => 'Generated by Gemini AI',
                'action_suggestion' => $aiResponse ?: '',
                'ai_processed' => 1
            ];
            error_log("Created suggested task: " . json_encode($suggestedTask));
            return $suggestedTask;
        } else {
            error_log("Invalid Gemini response structure: " . json_encode($result));
            // Return a fallback task even if Gemini parsing fails
            $fallbackTask = [
                'title' => $rawInput,
                'description' => 'Task processed with AI assistance',
                'quadrant' => 'Q2',
                'priority' => 'medium',
                'dueDate' => date('Y-m-d'),
                'duration' => ($userDuration && $userDuration > 0) ? $userDuration : 1,
                'rawInput' => $rawInput,
                'reasoning' => 'Fallback due to AI parsing issue',
                'action_suggestion' => 'Review and categorize this task',
                'ai_processed' => 1
            ];
            return $fallbackTask;
        }
    } else {
        error_log("Gemini API failed - HTTP Code: $httpCode, Response: $response");
        // Return fallback task instead of null
        return [
            'title' => $rawInput,
            'description' => 'Task created (AI analysis failed)',
            'quadrant' => 'Q2',
            'priority' => 'medium',
            'dueDate' => date('Y-m-d'),
            'duration' => ($userDuration && $userDuration > 0) ? $userDuration : 1,
            'rawInput' => $rawInput,
            'reasoning' => 'Fallback due to AI API failure',
            'action_suggestion' => 'Review and categorize this task',
            'ai_processed' => 1
        ];
    }
}

// Gemini AI processing endpoint

function handleGetTodayTasks() {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $tasks = $task->getTodayTasks($userId);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'tasks' => $tasks
    ]);
}

function handleCreateTask() {
    global $task, $auth;
    
    try {
        $userId = $auth->requireAuth();
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Log the incoming data for debugging
        error_log("Task creation attempt - User ID: $userId, Data: " . json_encode($data));
        
        if (!$data || !isset($data['title']) || !isset($data['quadrant']) || !isset($data['priority'])) {
        // Debug log for due_date and due_time
        $debug_logfile = __DIR__ . '/debug.log';
        $debug_timestamp = date('Y-m-d H:i:s');
        file_put_contents($debug_logfile, "[$debug_timestamp] [CREATE] Incoming: " . json_encode($data) . "\n", FILE_APPEND);
            error_log("Missing required fields - Data: " . json_encode($data));
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }
        
        $dueDate = $data['due_date'] ?? date('Y-m-d');
        $dueTime = '23:59';
        if (isset($data['due_time']) && $data['due_time'] !== null && $data['due_time'] !== '') {
            // Accept HH:mm or HH:mm:ss
            if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['due_time'])) {
                $dueTime = substr($data['due_time'], 0, 5);
            }
        }
        // Ensure duration is a positive integer
        $duration = isset($data['duration']) && intval($data['duration']) > 0 ? intval($data['duration']) : 1;
        file_put_contents($debug_logfile, "[$debug_timestamp] [CREATE] Parsed due_date: $dueDate, due_time: $dueTime\n", FILE_APPEND);
        $taskId = $task->create(
            $userId,
            $data['title'],
            $data['description'] ?? '',
            $data['quadrant'],
            $data['priority'],
            $dueDate,
            $dueTime,
            $duration,
            $data['rawInput'] ?? null,
            $data['reasoning'] ?? null,
            $data['action_suggestion'] ?? null,
            isset($data['ai_processed']) ? $data['ai_processed'] : 0
        );
        
        if ($taskId) {
            $taskData = $task->getTaskById($taskId, $userId);
            error_log("Task created successfully - ID: $taskId");
            
            http_response_code(201);
            file_put_contents($debug_logfile, "[$debug_timestamp] [CREATE] Saved: due_date: $dueDate, due_time: $dueTime\n", FILE_APPEND);
            echo json_encode([
                'success' => true,
                'message' => 'Task created successfully',
                'task' => $taskData
            ]);
        } else {
            error_log("Task creation failed - create() returned false");
            http_response_code(500);
            file_put_contents($debug_logfile, "[$debug_timestamp] [CREATE] FAILED: due_date: $dueDate, due_time: $dueTime\n", FILE_APPEND);
            echo json_encode(['error' => 'Task creation failed - database insert failed']);
        }
    } catch (Exception $e) {
        error_log("Task creation exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Task creation failed: ' . $e->getMessage()]);
    }
}

function handleUpdateTask($taskId) {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    // Debug log for update incoming data
    $debug_logfile = __DIR__ . '/debug.log';
    $debug_timestamp = date('Y-m-d H:i:s');
    file_put_contents($debug_logfile, "[$debug_timestamp] [UPDATE] Incoming: " . json_encode($data) . "\n", FILE_APPEND);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'No data provided']);
        return;
    }
    
    $allowedFields = ['title', 'description', 'quadrant', 'priority', 'due_date', 'due_time', 'duration', 'completed', 'ai_processed', 'reasoning', 'action_suggestion', 'rawInput'];
    $updateData = [];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updateData[$field] = $data[$field];
        }
    }
    $dueDate = $updateData['due_date'] ?? null;
    $dueTime = $updateData['due_time'] ?? null;
    file_put_contents($debug_logfile, "[$debug_timestamp] [UPDATE] Parsed due_date: $dueDate, due_time: $dueTime\n", FILE_APPEND);
    
    if (empty($updateData)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        return;
    }
    
    if ($task->update($taskId, $userId, $updateData)) {
        $taskData = $task->getTaskById($taskId, $userId);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Task updated successfully',
            'task' => $taskData
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Task update failed']);
    }
}

function handleToggleTask($taskId) {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    $taskData = $task->getTaskById($taskId, $userId);
    error_log('ToggleCompletion called with taskId=' . $taskId . ', userId=' . $userId);
    try {
        $result = $task->toggleCompletion($taskId, $userId);
        error_log('ToggleCompletion result: ' . var_export($result, true));
        if ($result) {
            $taskData = $task->getTaskById($taskId, $userId);
            // If the task is now completed, create congratulatory notification
            if ($taskData && isset($taskData['completed']) && $taskData['completed']) {
                require_once(__DIR__ . '/../notify_due_tasks.php');
                if (function_exists('createCompletionNotification')) {
                    createCompletionNotification($GLOBALS['db'], $userId, $taskId, $taskData['title']);
                }
            }
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Task completion toggled successfully',
                'task' => $taskData
            ]);
        } else {
            $errorInfo = $GLOBALS['db']->errorInfo();
            error_log('Task toggle failed for taskId=' . $taskId . ', userId=' . $userId . '. DB error: ' . print_r($errorInfo, true));
            http_response_code(200);
            echo json_encode([
                'success' => false,
                'error' => 'Task toggle failed. DB error: ' . print_r($errorInfo, true),
                'task' => null
            ]);
        }
    } catch (Exception $e) {
        error_log('Exception in handleToggleTask: ' . $e->getMessage());
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'error' => 'Exception: ' . $e->getMessage(),
            'task' => null
        ]);
    }
}

function handleDeleteTask($taskId) {
    global $task, $auth;
    
    $userId = $auth->requireAuth();
    
    if ($task->delete($taskId, $userId)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Task deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Task deletion failed']);
    }
}
?>
