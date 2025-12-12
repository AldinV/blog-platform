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
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/data/roles.php';

Flight::register('authService', 'AuthService');
Flight::register('usersService', 'UsersService');
Flight::register('categoriesService', 'CategoriesService');
Flight::register('tagsService', 'TagsService');
Flight::register('postsService', 'PostsService');
Flight::register('commentsService', 'CommentsService');
Flight::register('auth_middleware', 'AuthMiddleware');

require_once __DIR__ . '/Seeder.php';
Seeder::run();

// JWT middleware
Flight::before('route', function(){
  $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
  if ($method === 'OPTIONS') return;

  if (defined('PHPUNIT_RUNNING')) return;

  $url = Flight::request()->url ?? '';
  if (
    str_starts_with($url, '/auth/login') ||
    str_starts_with($url, '/auth/register') ||
    str_starts_with($url, '/public/v1/docs')
  ) {
    return;
  }

  try {
    Flight::auth_middleware()->verifyFromRequest();
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

if (!defined('PHPUNIT_RUNNING')) {
  Flight::start();
}