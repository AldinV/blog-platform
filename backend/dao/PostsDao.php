<?php
require_once __DIR__ . '/BaseDao.php';

class PostsDao extends BaseDao {
  private string $table = 'posts';

  public function create(array $data): array {
    $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i:s');
    [$sql, $params] = $this->buildInsert($this->table, $data);
    $this->execute($sql, $params);
    $id = (int)$this->lastInsertId();
    return $this->getById($id);
  }

  public function getById(int $id): ?array {
    return $this->fetch("SELECT p.*, u.name AS author_name, c.name AS category_name
                         FROM `{$this->table}` p
                         LEFT JOIN users u ON u.id = p.author_id
                         LEFT JOIN categories c ON c.id = p.category_id
                         WHERE p.id = :id", [':id' => $id]);
  }

  public function listAll(int $limit = 50, int $offset = 0, string $orderBy = 'p.created_at DESC'): array {
    $base = "SELECT p.*, u.name AS author_name, c.name AS category_name
             FROM `{$this->table}` p
             LEFT JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id";
    return $this->paginate($base, [], $limit, $offset, $orderBy);
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
}
