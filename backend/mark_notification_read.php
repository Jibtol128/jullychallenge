<?php
// CORS headers for API access from React frontend
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// API endpoint to mark a notification as read
require_once '../config/database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = $_SESSION['user_id'];
$notificationId = $_POST['id'] ?? null;

if (!$notificationId) {
    http_response_code(400);
    echo json_encode(['error' => 'Notification ID required']);
    exit;
}

$database = new Database();
$db = $database->connect();

$stmt = $db->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
$stmt->execute([$notificationId, $userId]);

header('Content-Type: application/json');
echo json_encode(['success' => true]);
