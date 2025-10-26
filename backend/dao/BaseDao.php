<?php
class BaseDao {
  private static ?PDO $pdo = null;

  public function __construct() {
    if (self::$pdo === null) {
      $this->initConnection();
    }
  }

  protected function pdo(): PDO {
    return self::$pdo;
  }

  private function initConnection(): void {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $db   = getenv('DB_NAME') ?: 'blog_platform';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $charset = getenv('DB_CHARSET') ?: 'utf8mb4';

    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
    $options = [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
      self::$pdo = new PDO($dsn, $user, $pass, $options);
      self::$pdo->exec("SET sql_mode = 'STRICT_ALL_TABLES'");
    } catch (PDOException $e) {
      throw new RuntimeException('Database connection failed: ' . $e->getMessage());
    }
  }

  protected function query(string $sql, array $params = []): PDOStatement {
    $stmt = $this->pdo()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
  }

  protected function fetch(string $sql, array $params = []): ?array {
    $stmt = $this->query($sql, $params);
    $row = $stmt->fetch();
    return $row === false ? null : $row;
  }

  protected function fetchAll(string $sql, array $params = []): array {
    return $this->query($sql, $params)->fetchAll();
  }

  protected function execute(string $sql, array $params = []): int {
    $stmt = $this->pdo()->prepare($sql);
    $stmt->execute($params);
    return $stmt->rowCount();
  }

  protected function lastInsertId(): string {
    return $this->pdo()->lastInsertId();
  }

  protected function begin(): void { $this->pdo()->beginTransaction(); }
  protected function commit(): void { $this->pdo()->commit(); }
  protected function rollback(): void { if ($this->pdo()->inTransaction()) $this->pdo()->rollBack(); }

  protected function buildInsert(string $table, array $data): array {
    $cols = array_keys($data);
    $placeholders = array_map(fn($c) => ':' . $c, $cols);
    $colsQuoted = array_map(fn($c) => "`".$c."`", $cols);
    $sql = "INSERT INTO `$table` (" . implode(',', $colsQuoted) . ") VALUES (" . implode(',', $placeholders) . ")";
    $params = [];
    foreach ($data as $k => $v) { $params[":".$k] = $v; }
    return [$sql, $params];
  }

  protected function buildUpdate(string $table, array $data, string $where, array $whereParams): array {
    $sets = [];
    $params = [];
    foreach ($data as $k => $v) {
      $sets[] = "`$k` = :set_{$k}";
      $params[":set_{$k}"] = $v;
    }
    $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " WHERE $where";
    return [$sql, $params + $whereParams];
  }

  protected function paginate(string $baseSql, array $params, int $limit = 20, int $offset = 0, string $orderBy = ''): array {
    $orderSql = $orderBy ? (" ORDER BY " . $orderBy) : '';
    $sql = $baseSql . $orderSql . " LIMIT :_limit OFFSET :_offset";
    $stmt = $this->pdo()->prepare($sql);
    foreach ($params as $k => $v) { $stmt->bindValue(is_string($k)?$k:(string)$k, $v); }
    $stmt->bindValue(':_limit', max(0, $limit), PDO::PARAM_INT);
    $stmt->bindValue(':_offset', max(0, $offset), PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    return $rows;
  }
}
