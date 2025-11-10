<?php
require_once __DIR__ . '/../dao/CategoriesDao.php';
require_once __DIR__ . '/BaseService.php';

class CategoriesService extends BaseService {
  public function __construct() { parent::__construct(new CategoriesDao()); }

  protected function validateCreate(array &$data): void {
    $this->trimStrings($data, ['name']);
    if (empty($data['name'])) throw new InvalidArgumentException('name is required');
    $this->ensureMaxLength($data, 'name', 100);
    /** @var CategoriesDao $dao */
    $dao = $this->dao;
    if ($dao->getByName($data['name'])) {
      throw new InvalidArgumentException('Category name already exists');
    }
  }

  protected function validateUpdate(int $id, array &$data): void {
    $this->trimStrings($data, ['name']);
    if (isset($data['name']) && $data['name'] === '') throw new InvalidArgumentException('name cannot be empty');
    $this->ensureMaxLength($data, 'name', 100);
    if (isset($data['name'])) {
      /** @var CategoriesDao $dao */
      $dao = $this->dao;
      $existing = $dao->getByName($data['name']);
      if ($existing && (int)$existing['id'] !== $id) {
        throw new InvalidArgumentException('Category name already exists');
      }
    }
  }

  public function getByName(string $name): ?array {
    return $this->dao->getByName($name);
  }
}