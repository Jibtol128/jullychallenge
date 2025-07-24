<?php
/**
 * Database Setup Script
 * Creates the necessary tables for the AI Task Prioritizer
 */

require_once 'database.php';

try {
    // Create database if not exists
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->exec("CREATE DATABASE IF NOT EXISTS task_manager");
    
    // Connect to the database
    $database = new Database();
    $pdo = $database->connect();
    
    // Create users table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    
    // Create tasks table
    $sql = "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        quadrant ENUM('Q1', 'Q2', 'Q3', 'Q4') NOT NULL,
        priority ENUM('high', 'medium', 'low') NOT NULL,
        due_date DATE,
        duration INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        raw_input TEXT,
        ai_processed BOOLEAN DEFAULT FALSE,
        reasoning TEXT,
        action_suggestion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    // Add the new columns if they don't exist (for existing databases)
    try {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN reasoning TEXT NULL");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }
    
    try {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN action_suggestion TEXT NULL");
    } catch (PDOException $e) {
        // Column already exists, ignore
    }
    
    // Create ai_processing_logs table
    $sql = "CREATE TABLE IF NOT EXISTS ai_processing_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        raw_input TEXT NOT NULL,
        ai_response TEXT,
        processing_time FLOAT,
        success BOOLEAN DEFAULT FALSE,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $pdo->exec($sql);
    
    echo "Database and tables created successfully!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
