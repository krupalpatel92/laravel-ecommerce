<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RoleSeeder::class);
    $this->seed(\Database\Seeders\PermissionSeeder::class);
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
});

describe('Authorization Tests', function () {
    test('guest cannot access product endpoints', function () {
        $response = $this->getJson('/api/v1/products');

        $response->assertUnauthorized();
    });

    test('customer role cannot access product endpoints', function () {
        $user = User::factory()->create();
        $user->assignRole('customer');

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'Test',
                'type' => 'single',
                'price' => 99.99,
                'stock_quantity' => 100,
                'status' => 'draft',
            ]);

        $response->assertForbidden();
    });

    test('superadmin can access product endpoints', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products');

        $response->assertSuccessful();
    });
});

describe('Product List Tests', function () {
    test('superadmin can list products', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        Product::factory()->count(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products');

        $response->assertSuccessful()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'type',
                        'price',
                        'stock_quantity',
                        'alert_threshold',
                        'status',
                        'is_low_stock',
                        'is_out_of_stock',
                        'created_at',
                        'updated_at',
                    ],
                ],
            ]);
    });

    test('pagination works', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        Product::factory()->count(20)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products?per_page=10');

        $response->assertSuccessful()
            ->assertJsonCount(10, 'data')
            ->assertJsonStructure([
                'data',
                'links',
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    });

    test('filter by status works', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        Product::factory()->count(2)->create(['status' => 'published']);
        Product::factory()->count(3)->create(['status' => 'draft']);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products?status=published');

        $response->assertSuccessful()
            ->assertJsonCount(2, 'data');
    });

    test('filter by type works', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        Product::factory()->count(2)->create(['type' => 'single']);
        Product::factory()->count(3)->create(['type' => 'variable']);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products?type=single');

        $response->assertSuccessful()
            ->assertJsonCount(2, 'data');
    });

    test('search by name works', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        Product::factory()->create(['name' => 'iPhone 15 Pro']);
        Product::factory()->create(['name' => 'Samsung Galaxy']);
        Product::factory()->create(['name' => 'iPhone 14']);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products?search=iPhone');

        $response->assertSuccessful()
            ->assertJsonCount(2, 'data');
    });
});

describe('Product Creation Tests', function () {
    test('superadmin can create single product', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Test Product',
            'description' => 'Test description',
            'type' => 'single',
            'price' => 99.99,
            'stock_quantity' => 100,
            'alert_threshold' => 10,
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertCreated()
            ->assertJson([
                'data' => [
                    'name' => 'Test Product',
                    'slug' => 'test-product',
                    'type' => 'single',
                    'price' => 99.99,
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'slug' => 'test-product',
        ]);
    });

    test('superadmin can create variable product', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Variable Product',
            'type' => 'variable',
            'price' => 0,
            'stock_quantity' => 0,
            'status' => 'draft',
            'variations' => [
                [
                    'name' => 'Small',
                    'sku' => 'VAR-SM-001',
                    'price' => 29.99,
                    'stock_quantity' => 50,
                    'attributes' => ['size' => 'Small'],
                ],
                [
                    'name' => 'Large',
                    'sku' => 'VAR-LG-001',
                    'price' => 39.99,
                    'stock_quantity' => 30,
                    'attributes' => ['size' => 'Large'],
                ],
            ],
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertCreated();

        $this->assertDatabaseHas('products', [
            'name' => 'Variable Product',
            'type' => 'variable',
        ]);
    });

    test('can attach categories on creation', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $categories = Category::factory()->count(2)->create();

        $data = [
            'name' => 'Product with Categories',
            'type' => 'single',
            'price' => 49.99,
            'stock_quantity' => 50,
            'status' => 'published',
            'category_ids' => $categories->pluck('id')->toArray(),
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertCreated();

        $product = Product::where('name', 'Product with Categories')->first();

        expect($product->categories)->toHaveCount(2);
    });

    test('slug is auto-generated', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Amazing Product Name',
            'type' => 'single',
            'price' => 29.99,
            'stock_quantity' => 25,
            'status' => 'draft',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertCreated()
            ->assertJson([
                'data' => [
                    'slug' => 'amazing-product-name',
                ],
            ]);
    });

    test('activity log is created on product creation', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Logged Product',
            'type' => 'single',
            'price' => 19.99,
            'stock_quantity' => 10,
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertCreated();

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Product::class,
            'description' => 'created',
        ]);
    });
});

describe('Validation Tests', function () {
    test('name is required', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'type' => 'single',
            'price' => 99.99,
            'stock_quantity' => 100,
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    test('price must be numeric', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Test Product',
            'type' => 'single',
            'price' => 'not-a-number',
            'stock_quantity' => 100,
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    });

    test('type must be valid enum', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Test Product',
            'type' => 'invalid-type',
            'price' => 99.99,
            'stock_quantity' => 100,
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    });

    test('status must be valid enum', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Test Product',
            'type' => 'single',
            'price' => 99.99,
            'stock_quantity' => 100,
            'status' => 'invalid-status',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    });

    test('stock quantity must be integer', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $data = [
            'name' => 'Test Product',
            'type' => 'single',
            'price' => 99.99,
            'stock_quantity' => 'not-an-integer',
            'status' => 'published',
        ];

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['stock_quantity']);
    });
});

describe('Product Update Tests', function () {
    test('superadmin can update product', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create([
            'name' => 'Original Name',
            'type' => 'single',
            'price' => 50.00,
        ]);

        $data = [
            'name' => 'Updated Name',
            'price' => 75.00,
        ];

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", $data);

        $response->assertSuccessful()
            ->assertJson([
                'data' => [
                    'name' => 'Updated Name',
                    'price' => 75.00,
                ],
            ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Name',
        ]);
    });

    test('can sync categories', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create();
        $oldCategories = Category::factory()->count(2)->create();
        $newCategories = Category::factory()->count(2)->create();

        $product->categories()->attach($oldCategories->pluck('id'));

        $data = [
            'category_ids' => $newCategories->pluck('id')->toArray(),
        ];

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", $data);

        $response->assertSuccessful();

        $product->refresh();

        expect($product->categories)->toHaveCount(2);
        expect($product->categories->pluck('id')->toArray())
            ->toMatchArray($newCategories->pluck('id')->toArray());
    });

    test('cannot change type if variations exist', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create(['type' => 'variable']);
        $product->variations()->create([
            'name' => 'Size: Large',
            'sku' => 'PROD-L',
            'price' => 99.99,
            'stock_quantity' => 50,
        ]);

        $data = [
            'type' => 'single',
        ];

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", $data);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    });

    test('activity log tracks changes', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create(['name' => 'Original']);

        $data = ['name' => 'Updated'];

        $response = $this->actingAs($user)
            ->putJson("/api/v1/products/{$product->id}", $data);

        $response->assertSuccessful();

        $this->assertDatabaseHas('activity_log', [
            'subject_type' => Product::class,
            'subject_id' => $product->id,
            'description' => 'updated',
        ]);
    });
});

describe('Product Delete Tests', function () {
    test('superadmin can delete product', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    });

    test('cannot delete product with existing orders', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create();

        // Simulate product has orders by creating order_items directly
        \DB::table('orders')->insert([
            'user_id' => $user->id,
            'order_number' => 'ORD-'.time(),
            'total' => 100.00,
            'status' => 'pending',
            'payment_status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderId = \DB::getPdo()->lastInsertId();

        \DB::table('order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 100.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertUnprocessable();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
        ]);
    });

    test('variations cascade delete', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create(['type' => 'variable']);
        $variation = $product->variations()->create([
            'name' => 'Size: Medium',
            'sku' => 'PROD-M',
            'price' => 89.99,
            'stock_quantity' => 30,
        ]);

        $variationId = $variation->id;

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('product_variations', [
            'id' => $variationId,
        ]);
    });

    test('media is cleared on deletion', function () {
        $user = User::factory()->create();
        $user->assignRole('superadmin');

        $product = Product::factory()->create();

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/products/{$product->id}");

        $response->assertNoContent();
    });
});
