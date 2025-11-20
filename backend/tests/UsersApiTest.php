<?php
use PHPUnit\Framework\TestCase;

class UsersApiTest extends TestCase {
  protected function setUp(): void {
    require_once __DIR__ . '/../vendor/autoload.php';
    if (!defined('PHPUNIT_RUNNING')) { define('PHPUNIT_RUNNING', true); }
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    ob_start();
    require_once __DIR__ . '/../index.php';
    ob_end_clean();
  }

  public function testListUsers() {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/users?limit=5';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
  }

  public function testGetByEmailRequiresParam() {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/users/by-email';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(400, http_response_code());
    $this->assertJson($out);
  }

  public function testCreateUpdateDeleteUser() {
    // Create
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/users';
    $email = 'user_' . time() . '@example.com';
    $_POST = [
      'name' => 'User T',
      'email' => $email,
      'password_hash' => password_hash('x', PASSWORD_BCRYPT),
      'role' => 'user'
    ];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
    $created = json_decode($out, true);
    $id = $created['id'] ?? null;
    $this->assertNotEmpty($id);

    // Get by id
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/users/' . $id;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // Update
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $_SERVER['REQUEST_URI'] = '/users/' . $id;
    $_POST = ['name' => 'User T Updated'];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // Delete
    $_SERVER['REQUEST_METHOD'] = 'DELETE';
    $_SERVER['REQUEST_URI'] = '/users/' . $id;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
  }
}
