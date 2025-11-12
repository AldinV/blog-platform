<?php
require_once __DIR__ . '/../dao/UsersDao.php';
require_once __DIR__ . '/BaseService.php';

class UsersService extends BaseService {
  public function __construct() { parent::__construct(new UsersDao()); }

  protected function validateCreate(array &$data): void {
    $this->trimStrings($data, ['name','email','role']);
    if (empty($data['name']) || empty($data['email']) || empty($data['password_hash'])) {
      throw new InvalidArgumentException('name, email and password_hash are required');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      throw new InvalidArgumentException('Invalid email');
    }
    $this->ensureMaxLength($data, 'name', 120);
    $this->ensureMaxLength($data, 'email', 190);
    $data['role'] = $data['role'] ?? 'user';
    $this->ensureEnum($data, 'role', ['user','admin']);

    /** @var UsersDao $dao */
    $dao = $this->dao;
    if ($dao->getByEmail($data['email'])) {
      throw new InvalidArgumentException('Email already in use');
    }
  }

  protected function validateUpdate(int $id, array &$data): void {
    $this->trimStrings($data, ['name','email','role']);
    if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      throw new InvalidArgumentException('Invalid email');
    }
    $this->ensureMaxLength($data, 'name', 120);
    $this->ensureMaxLength($data, 'email', 190);
    if (isset($data['role'])) {
      $this->ensureEnum($data, 'role', ['user','admin']);
    }

    if (isset($data['email'])) {
      /** @var UsersDao $dao */
      $dao = $this->dao;
      $existing = $dao->getByEmail($data['email']);
      if ($existing && (int)$existing['id'] !== $id) {
        throw new InvalidArgumentException('Email already in use');
      }
    }
  }

  public function findByEmail(string $email): ?array {
    return $this->dao->getByEmail($email);
  }
}
