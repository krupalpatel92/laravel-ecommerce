<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Cart;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupExpiredCartsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cart:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete expired guest carts and their items';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $deletedCount = DB::transaction(function () {
            // Find expired carts
            $expiredCarts = Cart::query()
                ->expired()
                ->get();

            $count = $expiredCarts->count();

            // Delete items and carts
            foreach ($expiredCarts as $cart) {
                $cart->items()->delete();
                $cart->delete();
            }

            return $count;
        });

        $this->info("Cleaned up {$deletedCount} expired carts");

        return self::SUCCESS;
    }
}
