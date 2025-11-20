<?php
require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../dao/AuthDao.php';
require_once __DIR__ . '/../dao/UsersDao.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthService extends BaseService {
  private AuthDao $authDao;

  public function __construct() {
    $this->authDao = new AuthDao();
    parent::__construct($this->authDao);
  }

  public function register(array $entity): array {
    $name = trim((string)($entity['name'] ?? ''));
    $email = trim((string)($entity['email'] ?? ''));
    $password = (string)($entity['password'] ?? '');
    $role = $entity['role'] ?? 'user';

    if ($email === '' || $password === '') {
      return ['success' => false, 'error' => 'Email and password are required.'];
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      return ['success' => false, 'error' => 'Invalid email.'];
    }
    $existing = $this->authDao->getByEmail($email);
    if ($existing) {
      return ['success' => false, 'error' => 'Email already registered.'];
    }

    $data = [
      'name' => $name,
      'email' => $email,
      'password_hash' => password_hash($password, PASSWORD_BCRYPT),
      'role' => in_array($role, ['user','admin'], true) ? $role : 'user',
    ];

    $created = $this->authDao->create($data);
    unset($created['password_hash']);

    return ['success' => true, 'data' => $created];
  }

  public function login(array $entity): array {
    $email = trim((string)($entity['email'] ?? ''));
    $password = (string)($entity['password'] ?? '');

    if ($email === '' || $password === '') {
      return ['success' => false, 'error' => 'Email and password are required.'];
    }

    $user = $this->authDao->getByEmail($email);
    if (!$user || !isset($user['password_hash']) || !password_verify($password, $user['password_hash'])) {
      return ['success' => false, 'error' => 'Invalid email or password.'];
    }

    unset($user['password_hash']);

    $jwtSecret = getenv('JWT_SECRET') ?: '';
    if ($jwtSecret === '') {
      return ['success' => false, 'error' => 'JWT secret not configured.'];
    }

    $payload = [
      'user' => [
        'id' => (int)$user['id'],
        'name' => $user['name'] ?? '',
        'email' => $user['email'],
        'role' => $user['role'] ?? 'user',
      ],
      'iat' => time(),
      'exp' => time() + (60 * 60 * 24)
    ];

    $token = JWT::encode($payload, $jwtSecret, 'HS256');

    return ['success' => true, 'data' => array_merge($user, ['token' => $token])];
  }
}
