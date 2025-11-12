<?php
require_once __DIR__ . '/bootstrap.php';
require 'vendor/autoload.php'; 

// CORS
Flight::before('start', function () {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204); exit;
  }
});

// Services
require_once __DIR__ . '/services/BaseService.php';
require_once __DIR__ . '/services/UsersService.php';
require_once __DIR__ . '/services/CategoriesService.php';
require_once __DIR__ . '/services/TagsService.php';
require_once __DIR__ . '/services/PostsService.php';
require_once __DIR__ . '/services/CommentsService.php';

Flight::register('usersService', 'UsersService');
Flight::register('categoriesService', 'CategoriesService');
Flight::register('tagsService', 'TagsService');
Flight::register('postsService', 'PostsService');
Flight::register('commentsService', 'CommentsService');

// Routes
require_once __DIR__ . '/routes/UsersRoutes.php';
require_once __DIR__ . '/routes/CategoriesRoutes.php';
require_once __DIR__ . '/routes/TagsRoutes.php';
require_once __DIR__ . '/routes/PostsRoutes.php';
require_once __DIR__ . '/routes/CommentsRoutes.php';

Flight::start();