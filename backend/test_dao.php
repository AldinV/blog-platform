<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/dao/BaseDao.php';
require_once __DIR__ . '/dao/UsersDao.php';
require_once __DIR__ . '/dao/CategoriesDao.php';
require_once __DIR__ . '/dao/TagsDao.php';
require_once __DIR__ . '/dao/PostsDao.php';
require_once __DIR__ . '/dao/CommentsDao.php';
require_once __DIR__ . '/dao/PostTagsDao.php';

function out($label, $value) {
  if (is_array($value)) {
    echo $label . ": " . json_encode($value, JSON_PRETTY_PRINT) . PHP_EOL;
  } else {
    echo $label . ": " . $value . PHP_EOL;
  }
}

try {
  $users = new UsersDao();
  $cats  = new CategoriesDao();
  $tags  = new TagsDao();
  $posts = new PostsDao();
  $comms = new CommentsDao();
  $pt    = new PostTagsDao();

  out('Status', 'Connected to DB using PDO successfully.');

  $admin = $users->getByEmail('admin@example.com');
  if (!$admin) {
    $admin = $users->create([
      'name' => 'Admin',
      'email' => 'admin@example.com',
      'password_hash' => password_hash('admin123', PASSWORD_BCRYPT),
      'role' => 'admin'
    ]);
    out('Seeded user', $admin);
  }

  $cat = $cats->getByName('Tech');
  if (!$cat) { $cat = $cats->create(['name' => 'Tech']); out('Seeded category', $cat); }

  $tag = $tags->getByName('PHP');
  if (!$tag) { $tag = $tags->create(['name' => 'PHP']); out('Seeded tag', $tag); }

  $post = $posts->create([
    'author_id' => $admin['id'],
    'title' => 'Hello',
    'content' => 'This is a test post stored in MySQL via PDO.',
    'category_id' => $cat['id']
  ]);
  out('Created post', $post);

  $pt->add($post['id'], $tag['id']);
  out('Post tags', $pt->getTagsForPost($post['id']));

  $comment = $comms->create([
    'post_id' => $post['id'],
    'user_id' => $admin['id'],
    'content' => 'Nice post!'
  ]);
  out('Created comment', $comment);

  $comms->delete($comment['id']);
  $pt->remove($post['id'], $tag['id']);
  $posts->delete($post['id']);

  out('Done', 'DAO test finished without errors.');
} catch (Throwable $e) {
  fwrite(STDERR, 'ERROR: ' . $e->getMessage() . PHP_EOL);
  exit(1);
}
