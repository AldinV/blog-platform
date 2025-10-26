<?php
require_once __DIR__ . '/BaseDao.php';

class CategoriesDao extends BaseDao {
  private string $table = 'categories';

  public function create(array $data): array {
    $data['created_at'] = $data['created_at'] ?? date('Y-m-d H:i:s');
    [$sql, $params] = $this->buildInsert($this->table, $data);
    $this->execute($sql, $params);
    $id = (int)$this->lastInsertId();
    return $this->getById($id);
  }

  public function getById(int $id): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE id = :id", [':id' => $id]);
  }

  public function getByName(string $name): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE name = :n", [':n' => $name]);
  }

  public function listAll(int $limit = 100, int $offset = 0, string $orderBy = 'created_at DESC'): array {
    $base = "SELECT * FROM `{$this->table}`";
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
