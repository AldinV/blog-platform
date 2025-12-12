<?php
use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *   security={
 *     {"BearerAuth":{}}
 *   }
 * )
 */
/**
 * @OA\Info(
 *   title="Blog Platform API",
 *   description="OpenAPI documentation for the Blog Platform backend",
 *   version="1.0.0",
 *   @OA\Contact(email="aldin.visnjic@stu.ibu.edu.ba", name="Aldin Visnjic")
 * )
 */

/**
 * @OA\Server(
 *     url="http://localhost/blog-platform/backend",
 *     description="API server"
 * ),
 * @OA\Server(
 *     url="https://production-domain/backend",
 *     description="API server"
 * )
 */

/**
 * @OA\SecurityScheme(
 *   securityScheme="BearerAuth",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT"
 * )
 */
