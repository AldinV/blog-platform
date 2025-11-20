<?php
use PHPUnit\Framework\TestCase;

class AuthApiTest extends TestCase {
  private string $email;
  private string $password;

  protected function setUp(): void {
    require_once __DIR__ . '/../vendor/autoload.php';
    if (!defined('PHPUNIT_RUNNING')) { define('PHPUNIT_RUNNING', true); }
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    ob_start();
    require_once __DIR__ . '/../index.php';
    ob_end_clean();

    $this->email = 'auth_tester_' . time() . '@example.com';
    $this->password = 'StrongP@ssw0rd';
  }

  public function testRegisterAndLogin() {
    // Register
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/auth/register';
    $_POST = [
      'name' => 'Auth Test',
      'email' => $this->email,
      'password' => $this->password,
      'role' => 'admin'
    ];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // Login
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    $_POST = [
      'email' => $this->email,
      'password' => $this->password
    ];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
    $data = json_decode($out, true);
    $this->assertArrayHasKey('token', $data);
  }
}
