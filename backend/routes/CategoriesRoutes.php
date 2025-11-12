<?php
use OpenApi\Annotations as OA;
/**
 * Categories routes
 */

/**
 * @OA\Get(
 *   path="/categories",
 *   tags={"categories"},
 *   summary="List categories",
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(
 *     response=200,
 *     description="List of categories",
 *     @OA\JsonContent(type="array", @OA\Items(type="object",
 *       @OA\Property(property="id", type="integer", example=1),
 *       @OA\Property(property="name", type="string", example="Tech"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     ))
 *   )
 * )
 */
Flight::route('GET /categories', function(){
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::categoriesService()->listAll($limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/categories/{id}",
 *   tags={"categories"},
 *   summary="Get category by id",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Category", @OA\JsonContent(type="object")),
 *   @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /categories/@id:[0-9]+', function(int $id){
  try {
    $cat = Flight::categoriesService()->getById($id);
    if (!$cat) { Flight::json(['error' => 'Category not found'], 404); return; }
    Flight::json($cat);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/categories/by-name",
 *   tags={"categories"},
 *   summary="Get category by name",
 *   @OA\Parameter(name="name", in="query", required=true, @OA\Schema(type="string", example="Tech")),
 *   @OA\Response(response=200, description="Category or null", @OA\JsonContent(type="object")),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('GET /categories/by-name', function(){
  try {
    $name = trim((string) (Flight::request()->query['name'] ?? ''));
    if ($name === '') { Flight::json(['error' => 'name is required'], 400); return; }
    $cat = Flight::categoriesService()->getByName($name);
    Flight::json($cat);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Post(
 *   path="/categories",
 *   tags={"categories"},
 *   summary="Create category",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"name"},
 *     @OA\Property(property="name", type="string", example="Tech")
 *   )),
 *   @OA\Response(response=200, description="Created category"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('POST /categories', function(){
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::categoriesService()->create($data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/categories/{id}",
 *   tags={"categories"},
 *   summary="Update category",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="name", type="string", example="Tech & Gadgets")
 *   )),
 *   @OA\Response(response=200, description="Updated category"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /categories/@id:[0-9]+', function(int $id){
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::categoriesService()->update($id, $data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Delete(
 *   path="/categories/{id}",
 *   tags={"categories"},
 *   summary="Delete category",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Deleted")
 * )
 */
Flight::route('DELETE /categories/@id:[0-9]+', function(int $id){
  try {
    Flight::json([ 'deleted' => Flight::categoriesService()->delete($id) ]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});
