<?php
use OpenApi\Annotations as OA;
/**
 * Users routes
 */

/**
 * @OA\Get(
 *   path="/users",
 *   tags={"users"},
 *   summary="List users",
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(
 *     response=200,
 *     description="List of users",
 *     @OA\JsonContent(type="array", @OA\Items(
 *       type="object",
 *       @OA\Property(property="id", type="integer", example=1),
 *       @OA\Property(property="name", type="string", example="Jane Doe"),
 *       @OA\Property(property="email", type="string", example="jane@example.com"),
 *       @OA\Property(property="role", type="string", example="user"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     ))
 *   )
 * )
 */
Flight::route('GET /users', function(){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::usersService()->listAll($limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/users/{id}",
 *   tags={"users"},
 *   summary="Get user by id",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(
 *     response=200,
 *     description="User",
 *     @OA\JsonContent(type="object",
 *       @OA\Property(property="id", type="integer", example=1),
 *       @OA\Property(property="name", type="string", example="Jane Doe"),
 *       @OA\Property(property="email", type="string", example="jane@example.com"),
 *       @OA\Property(property="role", type="string", example="user"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     )
 *   ),
 *   @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /users/@id:[0-9]+', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $user = Flight::usersService()->getById($id);
    if (!$user) { Flight::json(['error' => 'User not found'], 404); return; }
    Flight::json($user);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/users/by-email",
 *   tags={"users"},
 *   summary="Find user by email",
 *   @OA\Parameter(name="email", in="query", required=true, @OA\Schema(type="string", format="email", example="jane@example.com")),
 *   @OA\Response(response=200, description="User or null", @OA\JsonContent(type="object")),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('GET /users/by-email', function(){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $email = Flight::request()->query['email'] ?? '';
    if (!$email) { Flight::json(['error' => 'email is required'], 400); return; }
    $user = Flight::usersService()->findByEmail($email);
    Flight::json($user);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Post(
 *   path="/users",
 *   tags={"users"},
 *   summary="Create user",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"name","email","password_hash"},
 *     @OA\Property(property="name", type="string", example="Jane Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
 *     @OA\Property(property="password_hash", type="string", example="$2y$10$..."),
 *     @OA\Property(property="role", type="string", example="user")
 *   )),
 *   @OA\Response(response=200, description="Created user"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('POST /users', function(){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::usersService()->create($data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/me",
 *   tags={"users"},
 *   summary="Get current user's profile",
 *   @OA\Response(
 *     response=200,
 *     description="Current user profile",
 *     @OA\JsonContent(type="object",
 *       @OA\Property(property="id", type="integer", example=1),
 *       @OA\Property(property="name", type="string", example="Jane Doe"),
 *       @OA\Property(property="email", type="string", example="jane@example.com"),
 *       @OA\Property(property="role", type="string", example="user"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     )
 *   )
 * )
 */
Flight::route('GET /me', function(){
  try {
    $jwtUser = Flight::get('user');
    $userId = is_array($jwtUser) ? ((int)($jwtUser['id'] ?? 0)) : ((int)($jwtUser->id ?? 0));
    if ($userId <= 0) { Flight::json(['error' => 'Unauthenticated'], 401); return; }
    $user = Flight::usersService()->getById($userId);
    if (!$user) { Flight::json(['error' => 'User not found'], 404); return; }
    unset($user['password_hash']);
    Flight::json($user);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/me",
 *   tags={"users"},
 *   summary="Update current user's profile",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="name", type="string", example="Jane Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="jane@example.com")
 *   )),
 *   @OA\Response(response=200, description="Updated user"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /me', function(){
  try {
    $jwtUser = Flight::get('user');
    $userId = is_array($jwtUser) ? ((int)($jwtUser['id'] ?? 0)) : ((int)($jwtUser->id ?? 0));
    if ($userId <= 0) { Flight::json(['error' => 'Unauthenticated'], 401); return; }
    $payload = Flight::request()->data->getData();
    $allowed = ['name','email'];
    $data = [];
    foreach ($allowed as $key) {
      if (isset($payload[$key])) { $data[$key] = $payload[$key]; }
    }
    Flight::json(Flight::usersService()->update($userId, $data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/users/{id}",
 *   tags={"users"},
 *   summary="Update user",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="name", type="string", example="Jane Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
 *     @OA\Property(property="role", type="string", example="admin")
 *   )),
 *   @OA\Response(response=200, description="Updated user"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /users/@id:[0-9]+', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::usersService()->update($id, $data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Delete(
 *   path="/users/{id}",
 *   tags={"users"},
 *   summary="Delete user",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Deleted")
 * )
 */
Flight::route('DELETE /users/@id:[0-9]+', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    Flight::json([ 'deleted' => Flight::usersService()->delete($id) ]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});
