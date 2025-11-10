<?php
require_once __DIR__ . '/../dao/CategoriesDao.php';
require_once __DIR__ . '/BaseService.php';

class CategoriesService extends BaseService {
  public function __construct() { parent::__construct(new CategoriesDao()); }

  protected function validateCreate(array &$data): void {
    if (empty($data['name'])) throw new InvalidArgumentException('name is required');
  }

  protected function validateUpdate(int $id, array &$data): void {
    if (isset($data['name']) && $data['name'] === '') throw new InvalidArgumentException('name cannot be empty');
  }

  public function getByName(string $name): ?array {
    return $this->dao->getByName($name);
  }
}