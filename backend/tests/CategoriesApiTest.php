<?php
use PHPUnit\Framework\TestCase;

class CategoriesApiTest extends TestCase {
  protected function setUp(): void {
    require_once __DIR__ . '/../vendor/autoload.php';
    if (!defined('PHPUNIT_RUNNING')) { define('PHPUNIT_RUNNING', true); }
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    ob_start();
    require_once __DIR__ . '/../index.php';
    ob_end_clean();
  }

  public function testListCategories() {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/categories?limit=5';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
  }

  public function testCreateUpdateDeleteCategory() {
    // Create unique category
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/categories';
    $_POST = ['name' => 'Cat_' . time()];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
    $created = json_decode($out, true);
    $id = $created['id'] ?? null;

    if ($id) {
      // Update
      $_SERVER['REQUEST_METHOD'] = 'PUT';
      $_SERVER['REQUEST_URI'] = '/categories/' . $id;
      $_POST = ['name' => $created['name'] . '_upd'];
      ob_start();
      Flight::start();
      $out = ob_get_clean();
      $this->assertEquals(200, http_response_code());
      $this->assertJson($out);

      // Delete
      $_SERVER['REQUEST_METHOD'] = 'DELETE';
      $_SERVER['REQUEST_URI'] = '/categories/' . $id;
      $_POST = [];
      ob_start();
      Flight::start();
      $out = ob_get_clean();
      $this->assertEquals(200, http_response_code());
      $this->assertJson($out);
    }
  }
}
