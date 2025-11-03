<?php
require_once __DIR__ . '/BaseDao.php';

class PostTagsDao extends BaseDao {
  protected string $table = 'post_tags';
  
  // This DAO does not use the generic create, getById, update, or delete methods because it manages relationships, not a single entity with an id

  public function add(int $postId, int $tagId): int {
    $sql = "INSERT IGNORE INTO `{$this->table}` (post_id, tag_id) VALUES (:post_id, :tag_id)";
    return $this->execute($sql, [':post_id' => $postId, ':tag_id' => $tagId]);
  }

  public function remove(int $postId, int $tagId): int {
    $sql = "DELETE FROM `{$this->table}` WHERE post_id = :post_id AND tag_id = :tag_id";
    return $this->execute($sql, [':post_id' => $postId, ':tag_id' => $tagId]);
  }

  public function getTagsForPost(int $postId): array {
    $sql = "SELECT t.* FROM tags t
            INNER JOIN `{$this->table}` pt ON pt.tag_id = t.id
            WHERE pt.post_id = :post_id";
    return $this->fetchAll($sql, [':post_id' => $postId]);
  }

  public function getPostsForTag(int $tagId): array {
    $sql = "SELECT p.* FROM posts p
            INNER JOIN `{$this->table}` pt ON pt.post_id = p.id
            WHERE pt.tag_id = :tag_id";
    return $this->fetchAll($sql, [':tag_id' => $tagId]);
  }

  public function replaceTagsForPost(int $postId, array $tagIds): void {
    $this->begin();
    try {
      $this->execute("DELETE FROM `{$this->table}` WHERE post_id = :pid", [':pid' => $postId]);
      if (!empty($tagIds)) {
        $sql = "INSERT INTO `{$this->table}` (post_id, tag_id) VALUES (:pid, :tid)";
        $stmt = $this->pdo()->prepare($sql);
        foreach ($tagIds as $tid) {
          $stmt->execute([':pid' => $postId, ':tid' => (int)$tid]);
        }
      }
      $this->commit();
    } catch (Throwable $e) {
      $this->rollback();
      throw $e;
    }
  }
}