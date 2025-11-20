<?php
use PHPUnit\Framework\TestCase;

class CommentsApiTest extends TestCase {
  protected function setUp(): void {
    require_once __DIR__ . '/../vendor/autoload.php';
    if (!defined('PHPUNIT_RUNNING')) { define('PHPUNIT_RUNNING', true); }
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/auth/login';
    ob_start();
    require_once __DIR__ . '/../index.php';
    ob_end_clean();
  }

  public function testCommentsFullFlow() {
    // Create a user
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/users';
    $email = 'comment_user_' . time() . '@example.com';
    $_POST = [
      'name' => 'Commenter',
      'email' => $email,
      'password_hash' => password_hash('x', PASSWORD_BCRYPT),
      'role' => 'admin'
    ];
    ob_start();
    Flight::start();
    $userOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($userOut);
    $user = json_decode($userOut, true);

    // Create a category for the post
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/categories';
    $_POST = ['name' => 'ComCat_' . time()];
    ob_start();
    Flight::start();
    $catOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($catOut);
    $cat = json_decode($catOut, true);

    // Create a post to comment on (author must be admin per PostsService)
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/posts';
    $_POST = [
      'author_id' => $user['id'] ?? 1,
      'title' => 'Post For Comments ' . time(),
      'content' => 'Content',
      'category_id' => $cat['id'] ?? 1
    ];
    ob_start();
    Flight::start();
    $postOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($postOut);
    $post = json_decode($postOut, true);
    $postId = $post['id'] ?? null;
    $this->assertNotEmpty($postId);

    // List comments (empty or existing)
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/comments?limit=5';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // Create comment
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/comments';
    $_POST = [
      'post_id' => $postId,
      'user_id' => $user['id'] ?? 1,
      'content' => 'Nice post!'
    ];
    ob_start();
    Flight::start();
    $comOut = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($comOut);
    $comment = json_decode($comOut, true);
    $commentId = $comment['id'] ?? null;
    $this->assertNotEmpty($commentId);

    // GET /comments/{id}
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/comments/' . $commentId;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // PATCH /comments/{id}/status
    $_SERVER['REQUEST_METHOD'] = 'PATCH';
    $_SERVER['REQUEST_URI'] = '/comments/' . $commentId . '/status';
    $_POST = ['status' => 'hidden'];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // PUT /comments/{id}
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $_SERVER['REQUEST_URI'] = '/comments/' . $commentId;
    $_POST = ['content' => 'Edited comment'];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // GET /posts/{postId}/comments
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/posts/' . $postId . '/comments?limit=5';
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);

    // DELETE /comments/{id}
    $_SERVER['REQUEST_METHOD'] = 'DELETE';
    $_SERVER['REQUEST_URI'] = '/comments/' . $commentId;
    $_POST = [];
    ob_start();
    Flight::start();
    $out = ob_get_clean();
    $this->assertEquals(200, http_response_code());
    $this->assertJson($out);
  }
}
