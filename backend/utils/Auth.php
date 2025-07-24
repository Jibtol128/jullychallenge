<?php
/**
 * JWT Authentication Utility
 * Handles token generation and validation
 */

class Auth {
    private $secret = 'your-secret-key-change-this-in-production';
    
    // Generate JWT token
    public function generateToken($userId) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);
        
        $headerEncoded = $this->base64UrlEncode($header);
        $payloadEncoded = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $this->secret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
    }
    
    // Validate JWT token
    public function validateToken($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        $header = $this->base64UrlDecode($parts[0]);
        $payload = $this->base64UrlDecode($parts[1]);
        $signature = $this->base64UrlDecode($parts[2]);
        
        $expectedSignature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], $this->secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        $payloadData = json_decode($payload, true);
        
        if ($payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    // Get user ID from token
    public function getUserIdFromToken($token) {
        $payload = $this->validateToken($token);
        return $payload ? $payload['user_id'] : false;
    }
    
    // Base64 URL encode
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    // Base64 URL decode
    private function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    // Get token from request headers
    public function getTokenFromHeaders() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        
        return false;
    }
    
    // Middleware to check authentication
    public function requireAuth() {
        $token = $this->getTokenFromHeaders();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            exit;
        }
        
        $userId = $this->getUserIdFromToken($token);
        
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
        
        return $userId;
    }
}
?>
