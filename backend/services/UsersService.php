<?php
require_once __DIR__ . '/../dao/UsersDao.php';
require_once __DIR__ . '/BaseService.php';

class UsersService extends BaseService {
  public function __construct() { parent::__construct(new UsersDao()); }

  protected function validateCreate(array &$data): void {
    if (empty($data['name']) || empty($data['email']) || empty($data['password_hash'])) {
      throw new InvalidArgumentException('name, email and password_hash are required');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      throw new InvalidArgumentException('Invalid email');
    }
    if (empty($data['role'])) $data['role'] = 'user';
  }

  protected function validateUpdate(int $id, array &$data): void {
    if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      throw new InvalidArgumentException('Invalid email');
    }
  }

  public function findByEmail(string $email): ?array {
    return $this->dao->getByEmail($email);
  }
}
