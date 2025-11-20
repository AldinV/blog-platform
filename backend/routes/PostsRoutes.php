<?php
use OpenApi\Annotations as OA;
/**
 * Posts routes
 */

/**
 * @OA\Get(
 *   path="/posts",
 *   tags={"posts"},
 *   summary="List posts",
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(
 *     response=200,
 *     description="List of posts",
 *     @OA\JsonContent(type="array", @OA\Items(type="object",
 *       @OA\Property(property="id", type="integer", example=10),
 *       @OA\Property(property="author_id", type="integer", example=1),
 *       @OA\Property(property="author_name", type="string", example="Admin"),
 *       @OA\Property(property="title", type="string", example="Hello"),
 *       @OA\Property(property="content", type="string", example="This is a test post."),
 *       @OA\Property(property="category_id", type="integer", example=2),
 *       @OA\Property(property="category_name", type="string", example="Tech"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     ))
 *   )
 * )
 */
Flight::route('GET /posts', function(){
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::postsService()->listAll($limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/posts/{id}",
 *   tags={"posts"},
 *   summary="Get post by id",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Post", @OA\JsonContent(type="object")),
 *   @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /posts/@id', function(int $id){
  try {
    $post = Flight::postsService()->getById($id);
    if (!$post) { Flight::json(['error' => 'Post not found'], 404); return; }
    Flight::json($post);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Post(
 *   path="/posts",
 *   tags={"posts"},
 *   summary="Create post",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"author_id","title","content","category_id"},
 *     @OA\Property(property="author_id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Hello"),
 *     @OA\Property(property="content", type="string", example="This is a test post."),
 *     @OA\Property(property="category_id", type="integer", example=2),
 *     @OA\Property(property="tag_ids", type="array", @OA\Items(type="integer"))
 *   )),
 *   @OA\Response(response=200, description="Created post"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('POST /posts', function(){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    $tagIds = isset($data['tag_ids']) && is_array($data['tag_ids']) ? $data['tag_ids'] : [];
    if (isset($data['tag_ids'])) { unset($data['tag_ids']); }
    $post = Flight::postsService()->create($data);
    if (!empty($tagIds)) { Flight::postsService()->replaceTags($post['id'], $tagIds); }
    Flight::json($post);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/posts/{id}",
 *   tags={"posts"},
 *   summary="Update post",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="title", type="string", example="New title"),
 *     @OA\Property(property="content", type="string", example="Updated content"),
 *     @OA\Property(property="category_id", type="integer", example=3),
 *     @OA\Property(property="tag_ids", type="array", @OA\Items(type="integer"))
 *   )),
 *   @OA\Response(response=200, description="Updated post"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /posts/@id', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    $tagIds = [];
    if (isset($data['tag_ids']) && is_array($data['tag_ids'])) {
      $tagIds = $data['tag_ids'];
      unset($data['tag_ids']);
    }
    $post = Flight::postsService()->update($id, $data);
    if (!empty($tagIds)) { Flight::postsService()->replaceTags($id, $tagIds); }
    Flight::json($post);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Delete(
 *   path="/posts/{id}",
 *   tags={"posts"},
 *   summary="Delete post",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Deleted")
 * )
 */
Flight::route('DELETE /posts/@id', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    Flight::json([ 'deleted' => Flight::postsService()->delete($id) ]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/posts/{id}/tags",
 *   tags={"posts"},
 *   summary="Get tags for a post",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="List of tags")
 * )
 */
Flight::route('GET /posts/@id/tags', function(int $id){
  try {
    Flight::json(Flight::postsService()->getTags($id));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/posts/{id}/tags",
 *   tags={"posts"},
 *   summary="Replace tags for a post",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="tag_ids", type="array", @OA\Items(type="integer"))
 *   )),
 *   @OA\Response(response=200, description="OK")
 * )
 */
Flight::route('PUT /posts/@id/tags', function(int $id){
  Flight::auth_middleware()->authorizeRole(Roles::ADMIN);
  try {
    $data = Flight::request()->data->getData();
    $tagIds = isset($data['tag_ids']) && is_array($data['tag_ids']) ? $data['tag_ids'] : [];
    Flight::postsService()->replaceTags($id, $tagIds);
    Flight::json(['ok' => true]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});
