<?php
require_once __DIR__ . '/../dao/CommentsDao.php';
require_once __DIR__ . '/BaseService.php';

class CommentsService extends BaseService {
  public function __construct() { parent::__construct(new CommentsDao()); }

  protected function validateCreate(array &$data): void {
    foreach (['post_id','user_id','content'] as $f) {
      if (!isset($data[$f]) || $data[$f] === '') throw new InvalidArgumentException("$f is required");
    }
    if (empty($data['status'])) $data['status'] = 'visible';
  }

  public function setStatus(int $id, string $status): ?array {
    return $this->dao->setStatus($id, $status);
  }

  public function listByPost(int $postId, int $limit = 50, int $offset = 0, string $orderBy = 'c.created_at DESC'): array {
    return $this->dao->listByPost($postId, $limit, $offset, $orderBy);
  }
}
