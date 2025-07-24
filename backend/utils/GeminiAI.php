<?php
/**
 * Google Gemini AI Integration
 * Processes raw task input and categorizes into Eisenhower Matrix
 */

class GeminiAI {
    private $apiKey;
    private $apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

    public function __construct($apiKey = null) {
        // Always use config value if available
        if ($apiKey) {
            $this->apiKey = $apiKey;
        } else {
            if (!defined('GEMINI_API_KEY')) {
                // Try to load config if not already loaded
                @include_once(__DIR__ . '/../config/config.php');
            }
            $this->apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : null;
        }
    }
    
    // Process raw task input using Gemini AI
    public function processTask($rawInput, $userDuration = null, $existingTasks = []) {
        $startTime = microtime(true);
        error_log('GeminiAI::processTask started for input: ' . substr($rawInput, 0, 100) . '...');
        
        // Check if API key is valid
        if (!$this->apiKey || $this->apiKey === 'AIzaSyB0pdOpBmIHIZ7XFShUT0YuQiQwXTHixwo') {
            throw new Exception('Invalid or missing Gemini API key');
        }
        
        $promptTime = microtime(true);
        $prompt = $this->buildPrompt($rawInput, $existingTasks);
        error_log('GeminiAI: Prompt built in ' . round((microtime(true) - $promptTime) * 1000, 2) . 'ms');
        
        $data = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];
        
        $apiCallTime = microtime(true);
        $response = $this->makeAPICall($data);
        error_log('GeminiAI: API call completed in ' . round((microtime(true) - $apiCallTime) * 1000, 2) . 'ms');
        
        if (!$response) {
            throw new Exception('Failed to connect to Gemini API');
        }

        if (!isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception('Invalid response format from Gemini API');
        }

        $parseTime = microtime(true);
        $result = $this->parseAIResponse($response['candidates'][0]['content']['parts'][0]['text']);
        error_log('GeminiAI: Response parsed in ' . round((microtime(true) - $parseTime) * 1000, 2) . 'ms');
        
        // Override duration if user provided one
        if ($userDuration !== null && $userDuration > 0) {
            $result['duration'] = $userDuration;
            error_log('GeminiAI: Using user-provided duration: ' . $userDuration . ' minutes');
        }
        
        $totalTime = microtime(true) - $startTime;
        error_log('GeminiAI::processTask completed in ' . round($totalTime * 1000, 2) . 'ms');
        
        return $result;
    }
    
    // Build prompt for AI processing
    private function buildPrompt($rawInput, $existingTasks = []) {
        // Analyze existing task distribution
        $priorityDistribution = $this->analyzePriorityDistribution($existingTasks);
        $contextInfo = $this->buildContextInfo($priorityDistribution);
        
        return "
        You are an expert task prioritization assistant. Analyze this task and categorize it using the Eisenhower Matrix. Your goal is to help users focus on what truly matters by properly distributing tasks across urgency and importance levels.

        CURRENT TASK CONTEXT:
        {$contextInfo}

        Return ONLY a JSON object with this exact structure:

        {
            \"title\": \"Clear, concise task title (max 60 characters)\",
            \"description\": \"Brief description of what needs to be done and why it matters\",
            \"quadrant\": \"Q1|Q2|Q3|Q4\",
            \"priority\": \"high|medium|low\",
            \"dueDate\": \"YYYY-MM-DD or null\",
            \"duration\": estimated_minutes_as_integer,
            \"reasoning\": \"Detailed explanation of why this quadrant was chosen and why this task should be prioritized this way\",
            \"actionSuggestion\": \"Specific advice on how to approach this task\"
        }

        CRITICAL RULES FOR TASK DISTRIBUTION:
        - Distribute tasks evenly across quadrants (Q1: 25%, Q2: 25%, Q3: 25%, Q4: 25%)
        - HIGH priority should be reserved ONLY for true emergencies and critical deadlines (max 15% of tasks)
        - MEDIUM priority for important but not urgent tasks (should be 70% of tasks)
        - LOW priority for routine, delegatable, or eliminatable tasks (15% of tasks)
        - Consider the existing priority distribution shown above to maintain balance
        - Avoid clustering all tasks in one quadrant - spread them appropriately
        - Avoid marking everything as high priority - this defeats the purpose of prioritization

        Eisenhower Matrix Quadrants:
        - Q1 (Do First - HIGH priority): Urgent AND Important
          * Medical emergencies, critical deadlines TODAY, crisis situations
          * These require immediate action and cannot be delayed
          
        - Q2 (Schedule - MEDIUM priority): Important but NOT Urgent  
          * Planning, skill development, relationship building, prevention
          * These are the most valuable long-term activities
          
        - Q3 (Delegate - LOW priority): Urgent but NOT Important
          * Interruptions, some emails, non-essential meetings
          * These feel urgent but don't contribute to your goals
          
        - Q4 (Eliminate - LOW priority): NOT Urgent AND NOT Important
          * Time wasters, excessive social media, trivial activities
          * These should be minimized or eliminated

        Due Date Guidelines:
        - Only set due dates for tasks that actually have specific deadlines
        - Use null for most tasks unless there's a real deadline
        - Don't automatically set today's date or past dates
        - Be conservative with due dates - most tasks don't need them

        Task Input: \"$rawInput\"
        
        Remember: Your analysis should help users focus on what truly matters, not overwhelm them with everything being 'urgent' or 'high priority'. Balance is key to effective task management.
        ";
    }
    
    // Analyze existing task priority distribution
    private function analyzePriorityDistribution($existingTasks) {
        $distribution = [
            'high' => 0, 'medium' => 0, 'low' => 0, 'total' => count($existingTasks),
            'Q1' => 0, 'Q2' => 0, 'Q3' => 0, 'Q4' => 0
        ];
        
        foreach ($existingTasks as $task) {
            if (isset($task['priority']) && isset($distribution[$task['priority']])) {
                $distribution[$task['priority']]++;
            }
            if (isset($task['quadrant']) && isset($distribution[$task['quadrant']])) {
                $distribution[$task['quadrant']]++;
            }
        }
        return $distribution;
    }
    
    // Build context information for AI prompt
    private function buildContextInfo($priorityDistribution) {
        $total = $priorityDistribution['total'];
        if ($total === 0) return "No existing tasks. You can freely assign priority levels and quadrants.";
        
        $highPercent = round(($priorityDistribution['high'] / $total) * 100);
        $context = "Current task distribution:\n";
        $context .= "Priority distribution:\n";
        $context .= "- High priority: {$priorityDistribution['high']} tasks ({$highPercent}%)\n";
        $context .= "- Medium priority: {$priorityDistribution['medium']} tasks\n";
        $context .= "- Low priority: {$priorityDistribution['low']} tasks\n";
        
        $context .= "Quadrant distribution:\n";
        $context .= "- Q1 (Urgent+Important): {$priorityDistribution['Q1']} tasks\n";
        $context .= "- Q2 (Important only): {$priorityDistribution['Q2']} tasks\n";
        $context .= "- Q3 (Urgent only): {$priorityDistribution['Q3']} tasks\n";
        $context .= "- Q4 (Neither): {$priorityDistribution['Q4']} tasks\n";
        
        if ($highPercent > 20) {
            $context .= "WARNING: Too many high-priority tasks. Consider medium/low priority unless truly urgent.\n";
        }
        
        // Check for quadrant clustering
        $maxQuadrant = max($priorityDistribution['Q1'], $priorityDistribution['Q2'], $priorityDistribution['Q3'], $priorityDistribution['Q4']);
        if ($total > 3 && $maxQuadrant > ($total * 0.6)) {
            $context .= "WARNING: Too many tasks clustered in one quadrant. Distribute more evenly.\n";
        }
        
        return $context;
    }
    
    // Make API call to Gemini
    private function makeAPICall($data) {
        $curlStartTime = microtime(true);
        error_log('GeminiAI: Starting curl request to Gemini API');
        
        $ch = curl_init();
        
        $url = $this->apiUrl . '?key=' . $this->apiKey;
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30 second timeout
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // 10 second connection timeout
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $totalTime = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
        
        error_log('GeminiAI: Curl request completed in ' . round($totalTime * 1000, 2) . 'ms, HTTP code: ' . $httpCode);
        
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            error_log('Gemini API curl error: ' . $error);
            throw new Exception('Failed to connect to Gemini API: ' . $error);
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log('Gemini API error response: ' . $response);
            error_log('Gemini API HTTP code: ' . $httpCode);
            throw new Exception('Gemini API returned error code ' . $httpCode . ': ' . $response);
        }
        
        $decodedResponse = json_decode($response, true);
        if ($decodedResponse === null) {
            error_log('Gemini API invalid JSON response: ' . $response);
            throw new Exception('Invalid JSON response from Gemini API');
        }
        
        return $decodedResponse;
    }
    
    // Parse AI response to extract structured data
    private function parseAIResponse($aiText) {
        // Clean the response - remove markdown formatting if present
        $aiText = preg_replace('/```json\s*|\s*```/', '', $aiText);
        $aiText = trim($aiText);
        
        $parsed = json_decode($aiText, true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            // Validate required fields
            $required = ['title', 'description', 'quadrant', 'priority', 'duration'];
            foreach ($required as $field) {
                if (!isset($parsed[$field])) {
                    return false;
                }
            }
            
            // Validate quadrant
            if (!in_array($parsed['quadrant'], ['Q1', 'Q2', 'Q3', 'Q4'])) {
                return false;
            }
            
            // Validate priority
            if (!in_array($parsed['priority'], ['high', 'medium', 'low'])) {
                return false;
            }
            
            // Validate and format due date
            if ($parsed['dueDate'] && $parsed['dueDate'] !== 'null') {
                $date = DateTime::createFromFormat('Y-m-d', $parsed['dueDate']);
                if (!$date) {
                    $parsed['dueDate'] = null;
                }
            } else {
                $parsed['dueDate'] = null;
            }
            
            // Ensure duration is integer
            $parsed['duration'] = (int)$parsed['duration'];
            
            return $parsed;
        }
        
        return false;
    }
    
    // Log AI processing attempt
    public function logProcessing($taskId, $userId, $rawInput, $aiResponse, $processingTime, $success, $errorMessage = null) {
        // This would typically be called from the API endpoint
        // Implementation depends on your logging requirements
        return true;
    }
}
?>
