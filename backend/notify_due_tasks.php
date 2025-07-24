<?php
// Set session cookie parameters for cross-origin consistency (even if session not used now)
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start(); // Always start session for consistency and future use
// CORS headers for API access from React frontend
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// If session is ever needed, session_start() will use these params
// Script to notify users of tasks due in the next 2 hours
require_once 'config/database.php';
require_once 'models/Task.php';
// You will need PHPMailer and Twilio SDK for email/WhatsApp
// require 'vendor/autoload.php'; // No longer needed, all notifications are mocked

$database = new Database();
$db = $database->connect();
$taskModel = new Task($db);

// Get current time and time 2 hours from now
$now = new DateTime('now', new DateTimeZone('UTC'));
$twentyFourHoursLater = new DateTime('+24 hours', new DateTimeZone('UTC'));
$twoHoursLater = new DateTime('+2 hours', new DateTimeZone('UTC'));

// Query for tasks due in the next 2 hours and not completed
$stmt = $db->prepare("SELECT t.*, u.email, u.whatsapp FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.completed = 0 AND t.due_date IS NOT NULL AND t.due_time IS NOT NULL");
$stmt->execute();
$tasks = $stmt->fetchAll();

// Eisenhower categories: 1=Urgent & Important, 2=Important & Not Urgent, 3=Urgent & Not Important, 4=Neither
$categories = [1=>[],2=>[],3=>[],4=>[]];
$catNames = [1=>'Urgent & Important',2=>'Important & Not Urgent',3=>'Urgent & Not Important',4=>'Neither'];
$assigned = [];
foreach ($tasks as $task) {
    $rawDueDate = $task['due_date'];
    $rawDueTime = trim($task['due_time']);
    if (preg_match('/^\d:\d{2}/', $rawDueTime)) {
        $rawDueTime = '0' . $rawDueTime;
    }
    $dueDateTime = DateTime::createFromFormat('Y-m-d H:i:s', $rawDueDate . ' ' . $rawDueTime, new DateTimeZone('UTC'));
    if (!$dueDateTime) {
        $dueDateTime = DateTime::createFromFormat('Y-m-d H:i', $rawDueDate . ' ' . $rawDueTime, new DateTimeZone('UTC'));
    }
    if (!$dueDateTime && preg_match('/^\d:\d{2}/', $rawDueTime)) {
        $rawDueTimePadded = '0' . $rawDueTime;
        $dueDateTime = DateTime::createFromFormat('Y-m-d H:i', $rawDueDate . ' ' . $rawDueTimePadded, new DateTimeZone('UTC'));
        if (!$dueDateTime) {
            $dueDateTime = DateTime::createFromFormat('Y-m-d H:i:s', $rawDueDate . ' ' . $rawDueTimePadded, new DateTimeZone('UTC'));
        }
    }
    // Always ignore stored priority/quadrant and use only keyword/due date logic
    // Fallback: If description is 'Task created (AI analysis failed)', still run keyword/due date logic on all fields
    $text = strtolower(
        ($task['title'] ?? '') . ' ' .
        ($task['description'] ?? '') . ' ' .
        ($task['rawInput'] ?? '')
    );
    // Expanded urgency keywords
    $urgencyKeywords = '/\b(urgent|asap|today|immediately|critical|now|tonight|right away|deadline|priority|important)\b/i';
    $isKeywordUrgent = preg_match($urgencyKeywords, $text);
    $isOverdue = false;
    $isDueSoon = false;
    if ($dueDateTime) {
        $isOverdue = ($now->getTimestamp() >= $dueDateTime->getTimestamp());
        $isDueSoon = ($dueDateTime->getTimestamp() > $now->getTimestamp() && $dueDateTime->getTimestamp() <= $twentyFourHoursLater->getTimestamp());
    }
    $urgency = ($isOverdue || $isDueSoon || $isKeywordUrgent) ? 1 : 0;
    // Expanded priority keywords
    if (preg_match('/\b(urgent|asap|today|immediately|critical|important|tonight|high priority|must|client|finalize|annual|report)\b/i', $text)) {
        $priority = 'high';
    } elseif (preg_match('/\b(soon|next|follow up|remind|medium priority|prepare|update|plan)\b/i', $text)) {
        $priority = 'medium';
    } elseif (preg_match('/\b(low priority|call|reminder|notify|ping|check|quick|routine|admin|emails|respond)\b/i', $text)) {
        $priority = 'low';
    } elseif (preg_match('/\b(archive|optional|someday|later|idea|wishlist|backlog|defer|pause|hold|very low priority|relax|movie|fun)\b/i', $text)) {
        $priority = 'very low';
    } else {
        $priority = 'medium'; // Default to medium if no keywords match
    }
    $importance = ($priority === 'high' || $priority === 'medium') ? 1 : 0;
    // Assign to correct Eisenhower quadrant (multiple tasks per quadrant)
    if ($urgency && $importance) {
        $categories[1][] = $task;
    } elseif (!$urgency && $importance) {
        $categories[2][] = $task;
    } elseif ($urgency && !$importance) {
        $categories[3][] = $task;
    } elseif (!$urgency && !$importance) {
        $categories[4][] = $task;
    }
    // If dueDateTime is missing, log error for debugging
    if (!$dueDateTime) {
        error_log("ERROR notify_due_tasks.php: Could not parse dueDateTime for task '{$task['title']}' with due_date='{$rawDueDate}' and due_time='{$rawDueTime}'");
    }
}
// Now process notifications for each category/quadrant
foreach ($categories as $catKey => $tasksInQuadrant) {
    foreach ($tasksInQuadrant as $task) {
        $rawDueDate = $task['due_date'];
        $rawDueTime = trim($task['due_time']);
        if (preg_match('/^\d:\d{2}/', $rawDueTime)) {
            $rawDueTime = '0' . $rawDueTime;
        }
        $dueDateTime = DateTime::createFromFormat('Y-m-d H:i:s', $rawDueDate . ' ' . $rawDueTime, new DateTimeZone('UTC'));
        if (!$dueDateTime) {
            $dueDateTime = DateTime::createFromFormat('Y-m-d H:i', $rawDueDate . ' ' . $rawDueTime, new DateTimeZone('UTC'));
        }
        $isOverdue = ($now->getTimestamp() >= $dueDateTime->getTimestamp());
        if ($isOverdue || ($dueDateTime->getTimestamp() > $now->getTimestamp() && $dueDateTime->getTimestamp() <= $twoHoursLater->getTimestamp())) {
            sendEmail($task['email'], $task['title'], $dueDateTime);
            sendWhatsApp($task['whatsapp'], $task['title'], $dueDateTime);
            createInAppNotification($db, $task['user_id'], $task['id'], $task['title'], $dueDateTime);
            $catNames = [1=>'Urgent & Important',2=>'Important & Not Urgent',3=>'Urgent & Not Important',4=>'Neither'];
            error_log("[EISENHOWER {$catNames[$catKey]}] Notify user {$task['email']} and WhatsApp {$task['whatsapp']} for task '{$task['title']}' due at {$dueDateTime->format('Y-m-d H:i:s')}");
        }
    }
}

// Placeholder functions for email/WhatsApp/In-app
function createCompletionNotification($db, $userId, $taskId, $taskTitle) {
    $message = "Congratulations! You have completed the task '{$taskTitle}'. Great job!";
    $createdAt = (new DateTime())->format('Y-m-d H:i:s');
    $stmt = $db->prepare("INSERT INTO notifications (user_id, task_id, message, created_at, is_read) VALUES (?, ?, ?, ?, 0)");
    $stmt->execute([$userId, $taskId, $message, $createdAt]);
}
function sendEmail($to, $taskTitle, $dueDateTime) {
    // Mockup: Log instead of sending real email
    error_log("MOCK EMAIL: To={$to}, Subject=Task Due Soon: {$taskTitle}, Body=Your task '{$taskTitle}' is due at {$dueDateTime->format('Y-m-d H:i')}. Please take action.");
}

function createInAppNotification($db, $userId, $taskId, $taskTitle, $dueDateTime) {
    // Use app notification algorithm to generate message
    $message = generateNotificationMessage($taskTitle, $dueDateTime);
    $stmt = $db->prepare("INSERT INTO notifications (user_id, task_id, message, created_at, is_read) VALUES (?, ?, ?, ?, 0)");
    $createdAt = (new DateTime())->format('Y-m-d H:i:s');
    $stmt->execute([$userId, $taskId, $message, $createdAt]);
}

// App notification algorithm for generating notification messages
function generateNotificationMessage($taskTitle, $dueDateTime) {
    // Example algorithm: customize as needed
    $now = new DateTime();
    $diff = $now->diff($dueDateTime);
    $hours = $diff->h + ($diff->days * 24);
    if ($hours <= 2 && $hours > 0) {
        return "Urgent: Your task '{$taskTitle}' is due in {$hours} hour(s) at " . $dueDateTime->format('Y-m-d H:i') . ".";
    } elseif ($hours === 0) {
        return "Your task '{$taskTitle}' is due very soon at " . $dueDateTime->format('Y-m-d H:i') . ".";
    } else {
        return "Reminder: Your task '{$taskTitle}' is due at " . $dueDateTime->format('Y-m-d H:i') . ".";
    }
}
function sendWhatsApp($to, $taskTitle, $dueDateTime) {
    // Mockup: Log instead of sending real WhatsApp message
    error_log("MOCK WHATSAPP: To={$to}, Body=Reminder: Your task '{$taskTitle}' is due at {$dueDateTime->format('Y-m-d H:i')}");
}
?>
