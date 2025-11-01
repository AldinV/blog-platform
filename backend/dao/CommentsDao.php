<?php
require_once __DIR__ . '/BaseDao.php';

class CommentsDao extends BaseDao {
  protected string $table = 'comments';

  // Override to set default status
  public function create(array $data): array {
    $data['status'] = $data['status'] ?? 'visible';
    return parent::create($data);
  }

  // Override getById to add JOINs for user and post details
  public function getById(int $id): ?array {
    return $this->fetch("SELECT c.*, u.name AS user_name, p.title AS post_title
                         FROM `{$this->table}` c
                         LEFT JOIN users u ON u.id = c.user_id
                         LEFT JOIN posts p ON p.id = c.post_id
                         WHERE c.id = :id", [':id' => $id]);
  }

  // Override listAll to add JOINs for user and post details
  public function listAll(int $limit = 100, int $offset = 0, string $orderBy = 'c.created_at DESC'): array {
    $base = "SELECT c.*, u.name AS user_name, p.title AS post_title
             FROM `{$this->table}` c
             LEFT JOIN users u ON u.id = c.user_id
             LEFT JOIN posts p ON p.id = c.post_id";
    return $this->paginate($base, [], $limit, $offset, $orderBy);
  }

  public function listByPost(int $postId, int $limit = 100, int $offset = 0, string $orderBy = 'c.created_at DESC'): array {
    $base = "SELECT c.*, u.name AS user_name
             FROM `{$this->table}` c
             LEFT JOIN users u ON u.id = c.user_id
             WHERE c.post_id = :postId";
    return $this->paginate($base, [':postId' => $postId], $limit, $offset, $orderBy);
  }

  public function setStatus(int $id, string $status): ?array {
    return $this->update($id, ['status' => $status]);
  }
  
  // update() and delete() are inherited
}