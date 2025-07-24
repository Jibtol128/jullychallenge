<?php
/**
 * Configuration File
 * Store API keys and environment variables
 */

// Environment Configuration
define('ENVIRONMENT', 'development'); // development, production

// Google Gemini API Configuration
define('GEMINI_API_KEY', 'AIzaSyB0pdOpBmIHIZ7XFShUT0YuQiQwXTHixwo'); // Replace with your actual API key

// Internal AI Switch: If true, use internal PHP logic for task analysis instead of Gemini API
define('USE_INTERNAL_AI', true); // Set to true to use internal logic, false for Gemini

// Database Configuration (for reference - actual config in database.php)
define('DB_HOST', 'localhost');
define('DB_NAME', 'task_manager');
define('DB_USER', 'root');
define('DB_PASS', '');

// JWT Configuration
define('JWT_SECRET', 'a8f5f167f44f4964e6c998dee827110c3f7e7d8b4e6c998dee827110c3f7e7d8b4e6c998dee827110c3f7e7d8b4e6c998dee827110c3f7e7d8b4e6c998dee827110c3f7e7d8b');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
]);

// API Response Helper
function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Error Handler
function handleError($error, $status = 500) {
    error_log($error);
    sendResponse($status, ['error' => $error]);
}
?>
