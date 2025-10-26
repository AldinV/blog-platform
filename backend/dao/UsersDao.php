<?php
require_once __DIR__ . '/BaseDao.php';

class UsersDao extends BaseDao {
  private string $table = 'users';

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

  public function getByEmail(string $email): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE email = :email", [':email' => $email]);
  }

  public function listAll(int $limit = 50, int $offset = 0, string $orderBy = 'created_at DESC'): array {
    $base = "SELECT id, name, email, role, created_at FROM `{$this->table}`";
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
