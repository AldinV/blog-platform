<?php
class Seeder {
  public static function run() {
    $results = [
      'categories_created' => 0,
      'tags_created' => 0,
      'admin_user' => null,
    ];

    try {
      $hasCategories = count(Flight::categoriesService()->listAll(1, 0)) > 0;
      $hasTags = count(Flight::tagsService()->listAll(1, 0)) > 0;
      $hasUsers = count(Flight::usersService()->listAll(1, 0)) > 0;
      $hasPosts = count(Flight::postsService()->listAll(1, 0)) > 0;
      if ($hasCategories || $hasTags || $hasUsers || $hasPosts) {
        return ['ok' => true, 'skipped' => true, 'reason' => 'database not empty'];
      }

      $catNames = [
        'News','Tech','Design','Opinion','Tutorials','Releases','Community','Product'
      ];
      foreach ($catNames as $name) {
        $existing = Flight::categoriesService()->getByName($name);
        if (!$existing) {
          $created = Flight::categoriesService()->create(['name' => $name]);
          $results['categories_created'] += $created ? 1 : 0;
        }
      }

      $tagNames = [
        'javascript','php','mysql','css','html','ui','ux','api','flightphp','auth','jwt','cors','performance','debugging','testing','deployment','ci'
      ];
      foreach ($tagNames as $name) {
        $existing = Flight::tagsService()->getByName($name);
        if (!$existing) {
          $created = Flight::tagsService()->create(['name' => $name]);
          $results['tags_created'] += $created ? 1 : 0;
        }
      }

      $adminEmail = 'admin@example.com';
      $adminName = 'Admin';
      $adminPass = 'admin123';
      $existingAdmin = Flight::usersService()->findByEmail($adminEmail);
      if (!$existingAdmin) {
        $reg = Flight::authService()->register([
          'name' => $adminName,
          'email' => $adminEmail,
          'password' => $adminPass,
          'role' => 'admin'
        ]);
        if (($reg['success'] ?? false) && isset($reg['data'])) {
          $results['admin_user'] = [ 'created' => true, 'email' => $adminEmail ];
        } else {
          $results['admin_user'] = [ 'created' => false, 'error' => $reg['error'] ?? 'unknown' ];
        }
      } else {
        if (($existingAdmin['role'] ?? 'user') !== 'admin') {
          Flight::usersService()->update((int)$existingAdmin['id'], ['role' => 'admin']);
        }
        $results['admin_user'] = [ 'created' => false, 'email' => $adminEmail ];
      }

      return $results;
    } catch (Throwable $e) {
      return ['ok' => false, 'error' => $e->getMessage(), 'result' => $results];
    }
  }
}
