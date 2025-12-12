<?php
use PHPUnit\Framework\TestCase;

class PostsApiTest extends TestCase {
  protected function setUp(): void {
    require_once __DIR__ . '/../vendor/autoload.php';
    if (!defined('PHPUNIT_RUNNING')) { define('PHPUNIT_RUNNING', true); }
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    ob_start();
    require_once __DIR__ . '/../index.php';
    ob_end_clean();
  }

  public function testCreateReadUpdateDeletePostAndTags() {
    // Prepare dependencies: user, category, tag
    // Create user
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/users';
    $email = 'post_user_' . time() . '@example.com';
    $_POST = [
      'name' => 'Post Author',
      'email' => $email,
      'password_hash' => password_hash('x', PASSWORD_BCRYPT),
      'role' => 'admin'
    ];
    ob_start();
    Flight::start();
    $userOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($userOut);
    $author = json_decode($userOut, true);

    // Create category
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/categories';
    $_POST = ['name' => 'PostCat_' . time()];
    ob_start();
    Flight::start();
    $catOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($catOut);
    $category = json_decode($catOut, true);

    // Create tag
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/tags';
    $_POST = ['name' => 'PostTag_' . time()];
    ob_start();
    Flight::start();
    $tagOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($tagOut);
    $tag = json_decode($tagOut, true);

    // Create post
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/posts';
    $_POST = [
      'author_id' => $author['id'] ?? 1,
      'title' => 'Test Post ' . time(),
      'content' => 'Body',
      'category_id' => $category['id'] ?? 1,
      'tag_ids' => [$tag['id'] ?? 0]
    ];
    ob_start();
    Flight::start();
    $postOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($postOut);
    $post = json_decode($postOut, true);
    $postId = $post['id'] ?? null;
    $this->assertNotEmpty($postId);

    // GET /posts
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/posts?limit=5';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // GET /posts/{id}
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // PUT /posts/{id}
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId;
    $_POST = [
      'title' => 'Updated Title',
      'content' => 'Updated Body',
      'category_id' => $category['id'] ?? 1,
      'tag_ids' => [$tag['id'] ?? 0]
    ];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // GET /posts/{id}/tags
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId . '/tags';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // PUT /posts/{id}/tags
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId . '/tags';
    $_POST = ['tag_ids' => [$tag['id'] ?? 0]];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // DELETE /posts/{id}
    $_SERVER['REQUEST_METHOD'] = 'DELETE';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
  }
}
