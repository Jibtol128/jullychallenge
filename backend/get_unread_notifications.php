
<?php
// CORS headers for API access from React frontend
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Return mockup unread notification count
$mockNotifications = [
  [ 'is_read' => false ],
  [ 'is_read' => false ],
  [ 'is_read' => true ],
  [ 'is_read' => false ],
  [ 'is_read' => true ],
  [ 'is_read' => false ]
];
$unreadCount = count(array_filter($mockNotifications, function($n) { return !$n['is_read']; }));

header('Content-Type: application/json');
echo json_encode(['unread_count' => $unreadCount]);
