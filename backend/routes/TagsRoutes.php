<?php
use OpenApi\Annotations as OA;
/**
 * Tags routes
 */

/**
 * @OA\Get(
 *   path="/tags",
 *   tags={"tags"},
 *   summary="List tags",
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(
 *     response=200,
 *     description="List of tags",
 *     @OA\JsonContent(type="array", @OA\Items(type="object",
 *       @OA\Property(property="id", type="integer", example=1),
 *       @OA\Property(property="name", type="string", example="PHP"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     ))
 *   )
 * )
 */
Flight::route('GET /tags', function(){
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::tagsService()->listAll($limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/tags/{id}",
 *   tags={"tags"},
 *   summary="Get tag by id",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Tag", @OA\JsonContent(type="object")),
 *   @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /tags/@id:[0-9]+', function(int $id){
  try {
    $tag = Flight::tagsService()->getById($id);
    if (!$tag) { Flight::json(['error' => 'Tag not found'], 404); return; }
    Flight::json($tag);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/tags/by-name",
 *   tags={"tags"},
 *   summary="Get tag by name",
 *   @OA\Parameter(name="name", in="query", required=true, @OA\Schema(type="string", example="PHP")),
 *   @OA\Response(response=200, description="Tag or null", @OA\JsonContent(type="object")),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('GET /tags/by-name', function(){
  try {
    $name = trim((string)(Flight::request()->query['name'] ?? ''));
    if ($name === '') { Flight::json(['error' => 'name is required'], 400); return; }
    $tag = Flight::tagsService()->getByName($name);
    Flight::json($tag);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Post(
 *   path="/tags",
 *   tags={"tags"},
 *   summary="Create tag",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"name"},
 *     @OA\Property(property="name", type="string", example="PHP")
 *   )),
 *   @OA\Response(response=200, description="Created tag"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('POST /tags', function(){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::tagsService()->create($data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/tags/{id}",
 *   tags={"tags"},
 *   summary="Update tag",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="name", type="string", example="Backend")
 *   )),
 *   @OA\Response(response=200, description="Updated tag"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /tags/@id:[0-9]+', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::tagsService()->update($id, $data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Delete(
 *   path="/tags/{id}",
 *   tags={"tags"},
 *   summary="Delete tag",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Deleted")
 * )
 */
Flight::route('DELETE /tags/@id:[0-9]+', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    Flight::json([ 'deleted' => Flight::tagsService()->delete($id) ]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});
