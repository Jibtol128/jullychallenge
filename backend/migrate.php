<?php
/**
 * Migration script to add reasoning and actionSuggestion columns to tasks table
 */

require_once 'config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "Adding new columns to tasks table...\n";
    
    // Add reasoning column
    $sql = "ALTER TABLE tasks ADD COLUMN reasoning TEXT NULL";
    try {
        $pdo->exec($sql);
        echo "✓ Added reasoning column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "- reasoning column already exists\n";
        } else {
            throw $e;
        }
    }
    
    // Add actionSuggestion column
    $sql = "ALTER TABLE tasks ADD COLUMN action_suggestion TEXT NULL";
    try {
        $pdo->exec($sql);
        echo "✓ Added action_suggestion column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "- action_suggestion column already exists\n";
        } else {
            throw $e;
        }
    }
    
    echo "Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
