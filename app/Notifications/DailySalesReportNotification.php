<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DailySalesReportNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public array $salesData
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $date = date('F j, Y', strtotime($this->salesData['date']));
        $totalOrders = $this->salesData['total_orders'];
        $totalRevenue = number_format($this->salesData['total_revenue'], 2);
        $avgOrderValue = number_format($this->salesData['average_order_value'], 2);
        $totalItems = $this->salesData['total_items_sold'];

        $message = (new MailMessage)
            ->subject("Daily Sales Report - {$date}")
            ->markdown('emails.daily-sales-report', [
                'salesData' => $this->salesData,
                'date' => $date,
            ]);

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'date' => $this->salesData['date'],
            'total_orders' => $this->salesData['total_orders'],
            'total_revenue' => $this->salesData['total_revenue'],
        ];
    }
}
