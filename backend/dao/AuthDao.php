<?php
require_once __DIR__ . '/BaseDao.php';

class AuthDao extends BaseDao {
  protected string $table = 'users';

  public function getByEmail(string $email): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE email = :email", [':email' => $email]);
  }
}
