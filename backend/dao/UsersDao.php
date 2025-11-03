<?php
require_once __DIR__ . '/BaseDao.php';

class UsersDao extends BaseDao {
  protected string $table = 'users';

  public function getByEmail(string $email): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE email = :email", [':email' => $email]);
  }

  // Override listAll to select only safe columns preventing password hashes from leaving the DAO
  public function listAll(int $limit = 50, int $offset = 0, string $orderBy = 'created_at DESC'): array {
    $base = "SELECT id, name, email, role, created_at FROM `{$this->table}`";
    return $this->paginate($base, [], $limit, $offset, $orderBy);
  }
  
  // create(), getById(), update(), and delete() are inherited
}