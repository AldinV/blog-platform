<?php
require_once __DIR__ . '/BaseDao.php';

class TagsDao extends BaseDao {
  protected string $table = 'tags';

  public function getByName(string $name): ?array {
    return $this->fetch("SELECT * FROM `{$this->table}` WHERE name = :n", [':n' => $name]);
  }
  
  // create(), getById(), listAll(), update(), and delete() are inherited from BaseDao
}