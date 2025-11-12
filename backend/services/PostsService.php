<?php
require_once __DIR__ . '/../dao/PostsDao.php';
require_once __DIR__ . '/../dao/PostTagsDao.php';
require_once __DIR__ . '/../dao/UsersDao.php';
require_once __DIR__ . '/../dao/CategoriesDao.php';
require_once __DIR__ . '/../dao/TagsDao.php';
require_once __DIR__ . '/BaseService.php';

class PostsService extends BaseService {
  private PostTagsDao $postTags;
  private UsersDao $usersDao;
  private CategoriesDao $categoriesDao;
  private TagsDao $tagsDao;

  public function __construct() {
    parent::__construct(new PostsDao());
    $this->postTags = new PostTagsDao();
    $this->usersDao = new UsersDao();
    $this->categoriesDao = new CategoriesDao();
    $this->tagsDao = new TagsDao();
  }

  protected function validateCreate(array &$data): void {
    $this->trimStrings($data, ['title','content']);
    foreach (['author_id','title','content','category_id'] as $f) {
      if (!isset($data[$f]) || $data[$f] === '') throw new InvalidArgumentException("$f is required");
    }
    $this->ensureMaxLength($data, 'title', 200);
    $this->ensureMaxLength($data, 'content', 10000);

    $author = $this->usersDao->getById((int)$data['author_id']);
    if (!$author) throw new InvalidArgumentException('author_id does not reference a valid user');
    if (($author['role'] ?? 'user') !== 'admin') throw new InvalidArgumentException('author must be an admin');

    $cat = $this->categoriesDao->getById((int)$data['category_id']);
    if (!$cat) throw new InvalidArgumentException('category_id does not reference a valid category');
  }

  protected function validateUpdate(int $id, array &$data): void {
    $this->trimStrings($data, ['title','content']);
    $this->ensureMaxLength($data, 'title', 200);
    $this->ensureMaxLength($data, 'content', 10000);
    if (isset($data['author_id'])) {
      $author = $this->usersDao->getById((int)$data['author_id']);
      if (!$author) throw new InvalidArgumentException('author_id does not reference a valid user');
      if (($author['role'] ?? 'user') !== 'admin') throw new InvalidArgumentException('author must be an admin');
    }
    if (isset($data['category_id'])) {
      $cat = $this->categoriesDao->getById((int)$data['category_id']);
      if (!$cat) throw new InvalidArgumentException('category_id does not reference a valid category');
    }
  }

  public function replaceTags(int $postId, array $tagIds): void {
    foreach ($tagIds as $tid) {
      $tag = $this->tagsDao->getById((int)$tid);
      if (!$tag) {
        throw new InvalidArgumentException("Tag ID $tid does not exist");
      }
    }
    $this->postTags->replaceTagsForPost($postId, $tagIds);
  }

  public function getTags(int $postId): array {
    return $this->postTags->getTagsForPost($postId);
  }
}
