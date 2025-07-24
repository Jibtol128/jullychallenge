<?php
/**
 * Internal Task Analysis Logic
 * Assigns Eisenhower quadrant and priority using keywords and due date/time
 */
function analyzeTaskInternally($rawInput, $userDuration = null, $dueDate = null, $dueTime = null) {
    $text = strtolower($rawInput);
    $now = new DateTime('now', new DateTimeZone('UTC'));
    $twentyFourHoursLater = new DateTime('+24 hours', new DateTimeZone('UTC'));
    $dueDateTime = null;
    if ($dueDate && $dueTime) {
        $dueDateTime = DateTime::createFromFormat('Y-m-d H:i', $dueDate . ' ' . $dueTime, new DateTimeZone('UTC'));
        if (!$dueDateTime) {
            $dueDateTime = DateTime::createFromFormat('Y-m-d H:i:s', $dueDate . ' ' . $dueTime, new DateTimeZone('UTC'));
        }
    }
    $isOverdue = false;
    $isDueSoon = false;
    if ($dueDateTime) {
        $isOverdue = ($now->getTimestamp() >= $dueDateTime->getTimestamp());
        $isDueSoon = ($dueDateTime->getTimestamp() > $now->getTimestamp() && $dueDateTime->getTimestamp() <= $twentyFourHoursLater->getTimestamp());
    }
    $urgencyKeywordsList = ['urgent','asap','today','immediately','critical','now','right away','deadline'];
    $matchedUrgencyKeyword = '';
    foreach ($urgencyKeywordsList as $kw) {
        if (stripos($text, $kw) !== false) {
            $matchedUrgencyKeyword = $kw;
            break;
        }
    }
    $isKeywordUrgent = $matchedUrgencyKeyword !== '' ? 1 : 0;
    if ($isKeywordUrgent) {
        error_log('Urgency triggered by keyword: ' . $matchedUrgencyKeyword . ' in input: ' . $rawInput);
    }
    $urgency = ($isOverdue || $isDueSoon || $isKeywordUrgent) ? 1 : 0;
    error_log('Urgency status: overdue=' . ($isOverdue ? '1' : '0') . ', dueSoon=' . ($isDueSoon ? '1' : '0') . ', keywordUrgent=' . ($isKeywordUrgent ? '1' : '0') . ' for input: ' . $rawInput);
    if (preg_match('/\b(urgent|asap|today|immediately|critical|high priority|must|client|finalize|annual|report|launch|project|goal|essential|crucial|schedule)\b/i', $text)) {
        $priority = 'high';
    } elseif (preg_match('/\b(important|follow up|remind|medium priority|update|strategy|plan|growth|develop|improve|goal|essential|crucial|schedule)\b/i', $text)) {
        $priority = 'medium';
    } elseif (preg_match('/\b(low priority|call|reminder|notify|ping|check|quick|routine|admin|emails|respond|send|email|team|tomorrow)\b/i', $text)) {
        $priority = 'low';
    } elseif (preg_match('/\b(archive|optional|someday|later|idea|wishlist|backlog|defer|pause|hold|very low priority|relax|movie|fun|organize|playlist|party|office|month|watch|tonight)\b/i', $text)) {
        $priority = 'very low';
    } else {
        $priority = 'medium';
    }
    // Final quadrant logic:
    // Q1: Urgent AND high priority
    // Q2: Not urgent AND high/medium priority
    // Q3: Urgent AND medium/low priority
    // Q4: Not urgent AND low/very low priority
    if ($urgency && $priority === 'high') {
        $quadrant = 'Q1';
    } elseif (!$urgency && ($priority === 'high' || $priority === 'medium')) {
        $quadrant = 'Q2';
    } elseif ($urgency && ($priority === 'medium' || $priority === 'low')) {
        $quadrant = 'Q3';
    } elseif (!$urgency && ($priority === 'low' || $priority === 'very low')) {
        $quadrant = 'Q4';
    } else {
        $quadrant = 'Q2'; // Default to Q2 for medium priority, not urgent
    }
    return [
        'title' => $rawInput,
        'description' => $rawInput,
        'quadrant' => $quadrant,
        'priority' => $priority,
        'dueDate' => $dueDate ?? date('Y-m-d'),
        'duration' => ($userDuration && $userDuration > 0) ? $userDuration : 1,
        'rawInput' => $rawInput,
        'reasoning' => 'Internal PHP logic',
        'action_suggestion' => 'Review and categorize this task',
        'ai_processed' => 0
    ];
}
?>
