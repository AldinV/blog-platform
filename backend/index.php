<?php
require_once __DIR__ . '/bootstrap.php';
require 'vendor/autoload.php'; 
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// CORS
Flight::before('start', function () {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, Authentication');
  if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204); exit;
  }
});

// Services
require_once __DIR__ . '/services/BaseService.php';
require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/services/UsersService.php';
require_once __DIR__ . '/services/CategoriesService.php';
require_once __DIR__ . '/services/TagsService.php';
require_once __DIR__ . '/services/PostsService.php';
require_once __DIR__ . '/services/CommentsService.php';

Flight::register('authService', 'AuthService');
Flight::register('usersService', 'UsersService');
Flight::register('categoriesService', 'CategoriesService');
Flight::register('tagsService', 'TagsService');
Flight::register('postsService', 'PostsService');
Flight::register('commentsService', 'CommentsService');

// JWT middleware
Flight::before('route', function(){
  $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  if ($method === 'OPTIONS') return;

  $url = Flight::request()->url ?? '';
  if (
    str_starts_with($url, '/auth/login') ||
    str_starts_with($url, '/auth/register') ||
    str_starts_with($url, '/public/v1/docs')
  ) {
    return;
  }

  try {
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
    // Normalize Bearer value
    if (!$token && $authz) {
      if (stripos($authz, 'Bearer ') === 0) { $token = substr($authz, 7); }
      else { $token = $authz; }
    }

    if (!$token) { Flight::halt(401, 'Missing authentication header'); }
    $secret = getenv('JWT_SECRET') ?: '';
    if ($secret === '') { Flight::halt(500, 'JWT secret not configured'); }
    $decoded = JWT::decode($token, new Key($secret, 'HS256'));
    Flight::set('user', $decoded->user ?? null);
    Flight::set('jwt_token', $token);
  } catch (Throwable $e) {
    Flight::halt(401, $e->getMessage());
  }
});

// Routes
require_once __DIR__ . '/routes/AuthRoutes.php';
require_once __DIR__ . '/routes/UsersRoutes.php';
require_once __DIR__ . '/routes/CategoriesRoutes.php';
require_once __DIR__ . '/routes/TagsRoutes.php';
require_once __DIR__ . '/routes/PostsRoutes.php';
require_once __DIR__ . '/routes/CommentsRoutes.php';

Flight::start();