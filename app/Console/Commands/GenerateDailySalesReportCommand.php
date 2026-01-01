<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\GenerateDailySalesReportJob;
use Illuminate\Console\Command;

class GenerateDailySalesReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sales:report {--date=today : The date for the report (default: today)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and send daily sales report to superadmin users';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $date = $this->option('date');

        $this->info('Dispatching daily sales report job...');

        GenerateDailySalesReportJob::dispatch($date === 'today' ? null : $date);

        $this->info('Daily sales report job has been dispatched to the queue.');
        $this->comment('Run "php artisan queue:work" to process the job.');

        return Command::SUCCESS;
    }
}
