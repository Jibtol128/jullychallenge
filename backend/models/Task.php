<?php
/**
 * Task Model
 * Handles task CRUD operations and AI processing
 */

class Task {
    private $conn;
    private $table = 'tasks';
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Create new task
    public function create($userId, $title, $description, $quadrant, $priority, $dueDate = null, $dueTime = '23:59', $duration = 0, $rawInput = null, $reasoning = null, $actionSuggestion = null, $aiProcessed = 0) {
        // Validate priority
        $validPriorities = ['high', 'medium', 'low', 'very low'];
        if (!in_array($priority, $validPriorities)) {
            $priority = 'medium';
        }
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, title, description, quadrant, priority, due_date, due_time, duration, raw_input, reasoning, action_suggestion, ai_processed) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute([$userId, $title, $description, $quadrant, $priority, $dueDate, $dueTime, $duration, $rawInput, $reasoning, $actionSuggestion, $aiProcessed])) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    
    // Get all tasks for a user
    public function getUserTasks($userId) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = ? 
            ORDER BY 
                FIELD(quadrant, 'Q1', 'Q2', 'Q3', 'Q4'),
                FIELD(priority, 'high', 'medium', 'low'),
                due_date ASC, 
                created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll();
    }
    
    // Get task by ID
    public function getTaskById($id, $userId) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id, $userId]);
        
        return $stmt->fetch();
    }
    
    // Update task
    public function update($id, $userId, $data) {
        $fields = [];
        $values = [];
        // Ensure due_date is only YYYY-MM-DD
        if (isset($data['due_date'])) {
            $iso = $data['due_date'];
            if (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/', $iso)) {
                $data['due_date'] = explode('T', $iso)[0];
            } elseif (preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/', $iso)) {
                $data['due_date'] = explode('T', $iso)[0];
            }
        }
        // Always trim due_time to HH:mm format
        if (isset($data['due_time'])) {
            if (is_string($data['due_time']) && preg_match('/^\d{2}:\d{2}/', $data['due_time'])) {
                $data['due_time'] = substr($data['due_time'], 0, 5);
            } elseif (empty($data['due_time'])) {
                $data['due_time'] = '23:59';
            }
            // Log for debugging
            error_log('Task.php: Saving due_time value: ' . print_r($data['due_time'], true));
        }
        // Ensure duration is a positive integer
        if (isset($data['duration'])) {
            $data['duration'] = intval($data['duration']) > 0 ? intval($data['duration']) : 1;
        }
        // Ensure ai_processed is 0 or 1
        if (isset($data['ai_processed'])) {
            $data['ai_processed'] = ($data['ai_processed'] == 1) ? 1 : 0;
        }
        foreach ($data as $key => $value) {
            $fields[] = $key . " = ?";
            $values[] = $value;
        }
        $values[] = $id;
        $values[] = $userId;
        $query = "UPDATE " . $this->table . " SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($values);
    }
    
    // Delete task
    public function delete($id, $userId) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$id, $userId]);
    }
    
    // Toggle task completion
    public function toggleCompletion($id, $userId) {
        $query = "UPDATE " . $this->table . " SET completed = NOT completed WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$id, $userId]);
    }
    
    // Get tasks by quadrant
    public function getTasksByQuadrant($userId, $quadrant) {
        $query = "SELECT * FROM " . $this->table . " WHERE user_id = ? AND quadrant = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId, $quadrant]);
        
        return $stmt->fetchAll();
    }
    
    // Get overdue tasks
    public function getOverdueTasks($userId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = ? AND completed = FALSE 
                  AND (
                      (due_date < CURDATE()) 
                      OR (due_date = CURDATE() AND due_time < CURTIME())
                  )
                  ORDER BY due_date ASC, due_time ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll();
    }
    
    // Get tasks for today
    public function getTodayTasks($userId) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = ? AND DATE(due_date) = CURDATE() 
                  ORDER BY priority DESC, created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll();
    }
    
    // Mark task as AI processed
    public function markAIProcessed($id, $userId) {
        $query = "UPDATE " . $this->table . " SET ai_processed = TRUE WHERE id = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$id, $userId]);
    }
}
?>
