<?php
use OpenApi\Annotations as OA;
/**
 * Comments routes
 */

/**
 * @OA\Get(
 *   path="/comments",
 *   tags={"comments"},
 *   summary="List comments",
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(
 *     response=200,
 *     description="List of comments",
 *     @OA\JsonContent(type="array", @OA\Items(type="object",
 *       @OA\Property(property="id", type="integer", example=15),
 *       @OA\Property(property="post_id", type="integer", example=10),
 *       @OA\Property(property="user_id", type="integer", example=1),
 *       @OA\Property(property="user_name", type="string", example="Admin"),
 *       @OA\Property(property="content", type="string", example="Nice post!"),
 *       @OA\Property(property="status", type="string", example="visible"),
 *       @OA\Property(property="created_at", type="string", example="2025-01-01 12:00:00")
 *     ))
 *   )
 * )
 */
Flight::route('GET /comments', function(){
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::commentsService()->listAll($limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/comments/{id}",
 *   tags={"comments"},
 *   summary="Get comment by id",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Comment", @OA\JsonContent(type="object")),
 *   @OA\Response(response=404, description="Not found")
 * )
 */
Flight::route('GET /comments/@id', function(int $id){
  try {
    $comment = Flight::commentsService()->getById($id);
    if (!$comment) { Flight::json(['error' => 'Comment not found'], 404); return; }
    Flight::json($comment);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Post(
 *   path="/comments",
 *   tags={"comments"},
 *   summary="Create comment",
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"post_id","user_id","content"},
 *     @OA\Property(property="post_id", type="integer", example=10),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="content", type="string", example="Nice post!"),
 *     @OA\Property(property="status", type="string", example="visible")
 *   )),
 *   @OA\Response(response=200, description="Created comment"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('POST /comments', function(){
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::commentsService()->create($data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Put(
 *   path="/comments/{id}",
 *   tags={"comments"},
 *   summary="Update comment",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     @OA\Property(property="content", type="string", example="Edited comment")
 *   )),
 *   @OA\Response(response=200, description="Updated comment"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PUT /comments/@id', function(int $id){
  try {
    $data = Flight::request()->data->getData();
    Flight::json(Flight::commentsService()->update($id, $data));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Delete(
 *   path="/comments/{id}",
 *   tags={"comments"},
 *   summary="Delete comment",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Response(response=200, description="Deleted")
 * )
 */
Flight::route('DELETE /comments/@id', function(int $id){
  try {
    Flight::json([ 'deleted' => Flight::commentsService()->delete($id) ]);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Get(
 *   path="/posts/{postId}/comments",
 *   tags={"comments"},
 *   summary="List comments for a post",
 *   @OA\Parameter(name="postId", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer", minimum=0, example=50)),
 *   @OA\Parameter(name="offset", in="query", @OA\Schema(type="integer", minimum=0, example=0)),
 *   @OA\Response(response=200, description="List of comments for post")
 * )
 */
Flight::route('GET /posts/@postId/comments', function(int $postId){
  try {
    $q = Flight::request()->query;
    $limit = isset($q['limit']) ? max(0, (int)$q['limit']) : 50;
    $offset = isset($q['offset']) ? max(0, (int)$q['offset']) : 0;
    Flight::json(Flight::commentsService()->listByPost($postId, $limit, $offset));
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});

/**
 * @OA\Patch(
 *   path="/comments/{id}/status",
 *   tags={"comments"},
 *   summary="Set comment status",
 *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
 *   @OA\RequestBody(required=true, @OA\JsonContent(
 *     required={"status"},
 *     @OA\Property(property="status", type="string", example="hidden", description="One of: visible, hidden")
 *   )),
 *   @OA\Response(response=200, description="Updated comment"),
 *   @OA\Response(response=400, description="Validation error")
 * )
 */
Flight::route('PATCH /comments/@id/status', function(int $id){
  try {
    $data = Flight::request()->data->getData();
    $status = isset($data['status']) ? (string)$data['status'] : '';
    if ($status === '') { Flight::json(['error' => 'status is required'], 400); return; }
    $updated = Flight::commentsService()->setStatus($id, $status);
    Flight::json($updated);
  } catch (Throwable $e) {
    Flight::json(['error' => $e->getMessage()], 400);
  }
});
