
<?php
// CORS headers for React frontend (must be first for all requests)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
/**
 * Authentication API Endpoints
 * Handles user registration, login, and profile management
 */

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../models/User.php';
require_once '../utils/Auth.php';

$database = new Database();
$db = $database->connect();
$user = new User($db);
$auth = new Auth();

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));

switch ($method) {
    case 'POST':
        if ($request[0] === 'register') {
            handleRegister();
        } elseif ($request[0] === 'login') {
            handleLogin();
        } elseif ($request[0] === 'profile') {
            handleUpdateProfile();
        }
        break;
    
    case 'GET':
        if ($request[0] === 'profile') {
            handleGetProfile();
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleRegister() {
    global $user, $auth;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    // Check if email already exists
    if ($user->emailExists($data['email'])) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        return;
    }
    
    // Validate password strength
    if (strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        return;
    }
    
    $userId = $user->register($data['username'], $data['email'], $data['password']);
    
    if ($userId) {
        $token = $auth->generateToken($userId);
        $userData = $user->getUserById($userId);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully',
            'user' => $userData,
            'token' => $token
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
}

function handleLogin() {
    global $user, $auth;
    // Ensure session is not already started to avoid conflicts
    if (session_status() !== PHP_SESSION_ACTIVE) {
        // Set session cookie params before session_start for cross-origin consistency
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }
    $userData = $user->login($data['email'], $data['password']);
    if ($userData) {
        // Regenerate session ID for security and force new session
        session_regenerate_id(true);
        $_SESSION['user_id'] = $userData['id'];
        // Force session write and close to ensure data is saved
        session_write_close();
        // Restart session for continued use
        session_start();
        error_log('DEBUG login.php: SESSION user_id=' . $_SESSION['user_id']);
        // Debug output for session troubleshooting
        error_log('SESSION STATUS: ' . var_export(session_status(), true));
        error_log('SESSION ID: ' . session_id());
        error_log('COOKIES: ' . var_export($_COOKIE, true));
        error_log('SESSION: ' . var_export($_SESSION, true));
        $token = $auth->generateToken($userData['id']);
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $userData,
            'token' => $token
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function handleGetProfile() {
    global $user, $auth;
    
    $userId = $auth->requireAuth();
    $userData = $user->getUserById($userId);
    
    if ($userData) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'user' => $userData
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

function handleUpdateProfile() {
    global $user, $auth;
    
    $userId = $auth->requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['name']) || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name and email required']);
        return;
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }
    
    $avatar = isset($data['avatar']) ? $data['avatar'] : null;
    
    if ($user->updateProfile($userId, $data['name'], $data['email'], $avatar)) {
        $userData = $user->getUserById($userId);
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $userData
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Profile update failed']);
    }
}
?>
