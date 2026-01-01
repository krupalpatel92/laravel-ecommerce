<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Laravel eCommerce API',
    description: 'API documentation for Laravel eCommerce platform'
)]
#[OA\Server(
    url: '/api/v1',
    description: 'API v1 Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum',
    description: 'Enter token in format (Bearer <token>)'
)]
abstract class Controller
{
    //
}
