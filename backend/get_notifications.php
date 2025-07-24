
<?php
// CORS headers for API access from React frontend
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Return mockup notification data
$mockNotifications = [
  [
    'id' => 1,
    'message' => "Task 'Complete project proposal' is due in 2 hours",
    'type' => 'task',
    'is_read' => false,
    'created_at' => '2025-07-23T04:30:00Z',
    'task_id' => 1
  ],
  [
    'id' => 2,
    'message' => "Congratulations! You have completed the task 'Morning workout'. Great job!",
    'type' => 'completion',
    'is_read' => false,
    'created_at' => '2025-07-23T03:15:00Z',
    'task_id' => 2
  ],
  [
    'id' => 3,
    'message' => "Reminder: Your task 'Call dentist' is due at 2025-07-23 16:00",
    'type' => 'reminder',
    'is_read' => true,
    'created_at' => '2025-07-23T02:00:00Z',
    'task_id' => 3
  ],
  [
    'id' => 4,
    'message' => "Task 'Review quarterly reports' is overdue!",
    'type' => 'overdue',
    'is_read' => false,
    'created_at' => '2025-07-23T01:45:00Z',
    'task_id' => 4
  ],
  [
    'id' => 5,
    'message' => "Your task 'Team meeting preparation' is due very soon at 2025-07-23 14:30",
    'type' => 'urgent',
    'is_read' => true,
    'created_at' => '2025-07-23T01:00:00Z',
    'task_id' => 5
  ],
  [
    'id' => 6,
    'message' => "Daily reminder: Don't forget to review your goals for today",
    'type' => 'system',
    'is_read' => false,
    'created_at' => '2025-07-23T00:00:00Z',
    'task_id' => null
  ]
];

header('Content-Type: application/json');
echo json_encode(['notifications' => $mockNotifications]);
