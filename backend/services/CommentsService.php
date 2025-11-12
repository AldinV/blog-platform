<?php
require_once __DIR__ . '/../dao/CommentsDao.php';
require_once __DIR__ . '/../dao/UsersDao.php';
require_once __DIR__ . '/../dao/PostsDao.php';
require_once __DIR__ . '/BaseService.php';

class CommentsService extends BaseService {
  private UsersDao $usersDao;
  private PostsDao $postsDao;

  public function __construct() {
    parent::__construct(new CommentsDao());
    $this->usersDao = new UsersDao();
    $this->postsDao = new PostsDao();
  }

  protected function validateCreate(array &$data): void {
    $this->trimStrings($data, ['content','status']);
    foreach (['post_id','user_id','content'] as $f) {
      if (!isset($data[$f]) || $data[$f] === '') throw new InvalidArgumentException("$f is required");
    }
    $this->ensureMaxLength($data, 'content', 2000);
    $data['status'] = $data['status'] ?? 'visible';
    $this->ensureEnum($data, 'status', ['visible','hidden']);

    if (!$this->postsDao->getById((int)$data['post_id'])) {
      throw new InvalidArgumentException('post_id does not reference a valid post');
    }
    if (!$this->usersDao->getById((int)$data['user_id'])) {
      throw new InvalidArgumentException('user_id does not reference a valid user');
    }
  }

  protected function validateUpdate(int $id, array &$data): void {
    $this->trimStrings($data, ['content','status']);
    $this->ensureMaxLength($data, 'content', 2000);
    if (isset($data['status'])) {
      $this->ensureEnum($data, 'status', ['visible','hidden']);
    }
    if (isset($data['post_id'])) {
      if (!$this->postsDao->getById((int)$data['post_id'])) {
        throw new InvalidArgumentException('post_id does not reference a valid post');
      }
    }
    if (isset($data['user_id'])) {
      if (!$this->usersDao->getById((int)$data['user_id'])) {
        throw new InvalidArgumentException('user_id does not reference a valid user');
      }
    }
  }

  public function setStatus(int $id, string $status): ?array {
    $status = trim($status);
    if (!in_array($status, ['visible','hidden'], true)) {
      throw new InvalidArgumentException('status must be one of: visible, hidden');
    }
    return $this->dao->setStatus($id, $status);
  }

  public function listByPost(int $postId, int $limit = 50, int $offset = 0, string $orderBy = 'c.created_at DESC'): array {
    return $this->dao->listByPost($postId, $limit, $offset, $orderBy);
  }
}
