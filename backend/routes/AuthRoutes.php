<?php
use OpenApi\Annotations as OA;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

Flight::group('/auth', function() {
  /**
   * @OA\Post(
   *   path="/auth/register",
   *   tags={"auth"},
   *   summary="Register a new user",
   *   @OA\RequestBody(required=true, @OA\JsonContent(
   *     required={"email","password"},
   *     @OA\Property(property="name", type="string", example="Jane Doe"),
   *     @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
   *     @OA\Property(property="password", type="string", example="StrongP@ssw0rd"),
   *     @OA\Property(property="role", type="string", example="user")
   *   )),
   *   @OA\Response(response=200, description="Registered user")
   * )
   */
  Flight::route('POST /register', function() {
    $data = Flight::request()->data->getData();
    $res = Flight::authService()->register($data);
    if ($res['success']) { Flight::json($res['data']); return; }
    Flight::json(['error' => $res['error']], 400);
  });

  /**
   * @OA\Post(
   *   path="/auth/login",
   *   tags={"auth"},
   *   summary="Login and receive JWT",
   *   @OA\RequestBody(required=true, @OA\JsonContent(
   *     required={"email","password"},
   *     @OA\Property(property="email", type="string", format="email", example="jane@example.com"),
   *     @OA\Property(property="password", type="string", example="StrongP@ssw0rd")
   *   )),
   *   @OA\Response(response=200, description="User data with token")
   * )
   */
  Flight::route('POST /login', function() {
    $data = Flight::request()->data->getData();
    $res = Flight::authService()->login($data);
    if ($res['success']) { Flight::json($res['data']); return; }
    Flight::json(['error' => $res['error']], 400);
  });
});
