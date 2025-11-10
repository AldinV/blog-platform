<?php
require_once __DIR__ . '/../dao/PostsDao.php';
require_once __DIR__ . '/../dao/PostTagsDao.php';
require_once __DIR__ . '/BaseService.php';

class PostsService extends BaseService {
  private PostTagsDao $postTags;

  public function __construct() {
    parent::__construct(new PostsDao());
    $this->postTags = new PostTagsDao();
  }

  protected function validateCreate(array &$data): void {
    foreach (['author_id','title','content','category_id'] as $f) {
      if (!isset($data[$f]) || $data[$f] === '') throw new InvalidArgumentException("$f is required");
    }
  }

  public function replaceTags(int $postId, array $tagIds): void {
    $this->postTags->replaceTagsForPost($postId, $tagIds);
  }

  public function getTags(int $postId): array {
    return $this->postTags->getTagsForPost($postId);
  }
}
