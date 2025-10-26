<?php
require_once __DIR__ . '/BaseDao.php';

class CommentsDao extends BaseDao {
  private string $table = 'comments';

  public function create(array $data): array {
    $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i:s');
    $data['status'] = $data['status'] ?? 'visible';
    [$sql, $params] = $this->buildInsert($this->table, $data);
    $this->execute($sql, $params);
    $id = (int)$this->lastInsertId();
    return $this->getById($id);
  }

  public function getById(int $id): ?array {
    return $this->fetch("SELECT c.*, u.name AS user_name, p.title AS post_title
                         FROM `{$this->table}` c
                         LEFT JOIN users u ON u.id = c.user_id
                         LEFT JOIN posts p ON p.id = c.post_id
                         WHERE c.id = :id", [':id' => $id]);
  }

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

  public function update(int $id, array $data): ?array {
    if (empty($data)) return $this->getById($id);
    [$sql, $params] = $this->buildUpdate($this->table, $data, 'id = :id', [':id' => $id]);
    $this->execute($sql, $params);
    return $this->getById($id);
  }

  public function delete(int $id): int {
    return $this->execute("DELETE FROM `{$this->table}` WHERE id = :id", [':id' => $id]);
  }

  public function setStatus(int $id, string $status): ?array {
    return $this->update($id, ['status' => $status]);
  }
}
