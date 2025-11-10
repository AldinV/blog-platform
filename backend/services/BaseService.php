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
}
