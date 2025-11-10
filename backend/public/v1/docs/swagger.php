<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require __DIR__ . '/../../../vendor/autoload.php';

define('LOCALSERVER', 'http://localhost/blog-platform/backend');
define('PRODSERVER', 'https://production-domain/backend');

if($_SERVER['SERVER_NAME'] == 'localhost' || $_SERVER['SERVER_NAME'] == '127.0.0.1'){
  define('BASE_URL', LOCALSERVER);
} else {
  define('BASE_URL', PRODSERVER);
}

$openapi = \OpenApi\Generator::scan([
  __DIR__ . '/doc_setup.php',
  __DIR__ . '/../../../routes'
]);

header('Content-Type: application/json');
echo $openapi->toJson();
?>