<?php
/**
 * User Model
 * Handles user authentication and profile management
 */

class User {
    private $conn;
    private $table = 'users';
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Register new user
    public function register($username, $email, $password) {
        $query = "INSERT INTO " . $this->table . " (username, email, password) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        if ($stmt->execute([$username, $email, $hashedPassword])) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    
    // Login user
    public function login($email, $password) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email]);
        
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']); // Remove password from response
            return $user;
        }
        return false;
    }
    
    // Get user by ID
    public function getUserById($id) {
        $query = "SELECT id, username, email, created_at FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    }
    
    // Check if email exists
    public function emailExists($email) {
        $query = "SELECT id FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email]);
        
        return $stmt->fetch() !== false;
    }
    
    // Update user profile
    public function updateProfile($id, $username, $email) {
        $query = "UPDATE " . $this->table . " SET username = ?, email = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$username, $email, $id]);
    }
    
    // Update password
    public function updatePassword($id, $newPassword) {
        $query = "UPDATE " . $this->table . " SET password = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        
        return $stmt->execute([$hashedPassword, $id]);
    }
}
?>
