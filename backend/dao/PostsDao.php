<?php
require_once __DIR__ . '/BaseDao.php';

class PostsDao extends BaseDao {
  protected string $table = 'posts';

  // Override because of joins
  public function getById(int $id): ?array {
    return $this->fetch("SELECT p.*, u.name AS author_name, c.name AS category_name
                         FROM `{$this->table}` p
                         LEFT JOIN users u ON u.id = p.author_id
                         LEFT JOIN categories c ON c.id = p.category_id
                         WHERE p.id = :id", [':id' => $id]);
  }

  // Override because of joins
  public function listAll(int $limit = 50, int $offset = 0, string $orderBy = 'p.created_at DESC'): array {
    $base = "SELECT p.*, u.name AS author_name, c.name AS category_name
             FROM `{$this->table}` p
             LEFT JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id";
    return $this->paginate($base, [], $limit, $offset, $orderBy);
  }
  
  // create(), update() and delete() are inherited
}