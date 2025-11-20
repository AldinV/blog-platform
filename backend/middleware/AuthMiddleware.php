<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
  public function verifyFromRequest(): bool {
    $token = Flight::request()->getHeader('Authentication') ?: '';
    // Flight header first
    $authz = $token ? '' : (Flight::request()->getHeader('Authorization') ?: '');
    // Fallback to common server variables set by Apache/CGI
    if (!$authz && isset($_SERVER['HTTP_AUTHORIZATION'])) {
      $authz = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!$authz && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
      $authz = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (!$authz && function_exists('apache_request_headers')) {
      $all = apache_request_headers();
      foreach ($all as $k => $v) {
        if (strcasecmp($k, 'Authorization') === 0) { $authz = $v; break; }
      }
    }
    if (!$token && $authz) {
      if (stripos($authz, 'Bearer ') === 0) { $token = substr($authz, 7); }
      else { $token = $authz; }
    }

    return $this->verifyToken($token);
  }

  public function verifyToken(?string $token): bool {
    if (!$token) {
      Flight::halt(401, 'Missing authentication header');
    }
    $secret = getenv('JWT_SECRET') ?: '';
    if ($secret === '') { Flight::halt(500, 'JWT secret not configured'); }
    $decoded = JWT::decode($token, new Key($secret, 'HS256'));
    Flight::set('user', $decoded->user ?? null);
    Flight::set('jwt_token', $token);
    return true;
  }

  public function authorizeRole(string $requiredRole): void {
    $user = Flight::get('user');
    $role = is_array($user) ? ($user['role'] ?? null) : ($user->role ?? null);
    if ($role !== $requiredRole) {
      Flight::halt(403, 'Access denied: insufficient privileges');
    }
  }

  public function authorizeRoles(array $roles): void {
    $user = Flight::get('user');
    $role = is_array($user) ? ($user['role'] ?? null) : ($user->role ?? null);
    if (!in_array($role, $roles, true)) {
      Flight::halt(403, 'Forbidden: role not allowed');
    }
  }
}
