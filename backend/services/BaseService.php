<?php
abstract class BaseService {
  protected $dao;

  public function __construct($dao) {
    $this->dao = $dao;
  }

  public function listAll(int $limit = 50, int $offset = 0, string $orderBy = 'created_at DESC'): array {
    return $this->dao->listAll($limit, $offset, $orderBy);
  }

  public function getById(int $id): ?array {
    return $this->dao->getById($id);
  }

  public function create(array $data): array {
    $this->validateCreate($data);
    return $this->dao->create($data);
  }

  public function update(int $id, array $data): ?array {
    $this->validateUpdate($id, $data);
    return $this->dao->update($id, $data);
  }

  public function delete(int $id): int {
    return $this->dao->delete($id);
  }

  protected function validateCreate(array &$data): void {}
  protected function validateUpdate(int $id, array &$data): void {}

  protected function trimStrings(array &$data, array $fields): void {
    foreach ($fields as $f) {
      if (isset($data[$f]) && is_string($data[$f])) {
        $data[$f] = trim($data[$f]);
      }
    }
  }

  protected function ensureMaxLength(array $data, string $field, int $max): void {
    if (isset($data[$field]) && is_string($data[$field]) && mb_strlen($data[$field]) > $max) {
      throw new InvalidArgumentException("$field exceeds $max characters");
    }
  }

  protected function ensureEnum(array $data, string $field, array $allowed): void {
    if (isset($data[$field]) && !in_array($data[$field], $allowed, true)) {
      $allowedStr = implode(', ', $allowed);
      throw new InvalidArgumentException("$field must be one of: $allowedStr");
    }
  }
}
