<?php

declare(strict_types=1);

namespace App\Actions\Order;

use App\Models\Order;
use App\Services\OrderService;

class UpdateOrderStatusAction
{
    private const VALID_STATUSES = [
        'pending',
        'processing',
        'completed',
        'cancelled',
    ];

    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Execute the action to update order status.
     *
     * @param  array{order_id: int, status: string}  $data
     *
     * @throws \Exception
     */
    public function execute(array $data): Order
    {
        if (! in_array($data['status'], self::VALID_STATUSES)) {
            throw new \Exception("Invalid status: {$data['status']}");
        }

        $order = Order::findOrFail($data['order_id']);

        return $this->orderService->updateOrderStatus($order, $data['status']);
    }
}
