@component('mail::message')
# Daily Sales Report

Hello Admin,

Here's your daily sales summary for **{{ $date }}**:

---

## Sales Overview

<table style="width: 100%; margin: 20px 0;">
<tr>
<td style="padding: 15px; background-color: #f0fdf4; border-radius: 8px; text-align: center;">
<strong style="font-size: 18px; color: #16a34a;">Total Orders</strong><br>
<span style="font-size: 32px; color: #15803d;">{{ $salesData['total_orders'] }}</span>
</td>
<td style="width: 20px;"></td>
<td style="padding: 15px; background-color: #f0f9ff; border-radius: 8px; text-align: center;">
<strong style="font-size: 18px; color: #0284c7;">Total Revenue</strong><br>
<span style="font-size: 32px; color: #0369a1;">${{ number_format($salesData['total_revenue'], 2) }}</span>
</td>
</tr>
</table>

<table style="width: 100%; margin: 20px 0;">
<tr>
<td style="padding: 15px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
<strong style="font-size: 18px; color: #d97706;">Average Order Value</strong><br>
<span style="font-size: 32px; color: #b45309;">${{ number_format($salesData['average_order_value'], 2) }}</span>
</td>
<td style="width: 20px;"></td>
<td style="padding: 15px; background-color: #f3e8ff; border-radius: 8px; text-align: center;">
<strong style="font-size: 18px; color: #9333ea;">Total Items Sold</strong><br>
<span style="font-size: 32px; color: #7e22ce;">{{ $salesData['total_items_sold'] }}</span>
</td>
</tr>
</table>

---

## Payment Status

- **Paid:** {{ $salesData['payment_status']['paid'] }} orders
- **Pending:** {{ $salesData['payment_status']['pending'] }} orders
- **Failed:** {{ $salesData['payment_status']['failed'] }} orders

---

## Order Status

- **Completed:** {{ $salesData['order_status']['completed'] }} orders
- **Processing:** {{ $salesData['order_status']['processing'] }} orders
- **Pending:** {{ $salesData['order_status']['pending'] }} orders
- **Cancelled:** {{ $salesData['order_status']['cancelled'] }} orders

---

@if(count($salesData['top_products']) > 0)
## Top Selling Products

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<thead>
<tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
<th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Product</th>
<th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Quantity Sold</th>
<th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Revenue</th>
</tr>
</thead>
<tbody>
@foreach($salesData['top_products'] as $index => $product)
<tr style="border-bottom: 1px solid #f3f4f6;">
<td style="padding: 12px;">
<strong style="color: #6366f1;">{{ $index + 1 }}.</strong> {{ $product['name'] }}
</td>
<td style="padding: 12px; text-align: center;">{{ $product['quantity'] }}</td>
<td style="padding: 12px; text-align: right; font-weight: 600; color: #16a34a;">
${{ number_format($product['revenue'], 2) }}
</td>
</tr>
@endforeach
</tbody>
</table>
@else
<div style="padding: 20px; background-color: #fef2f2; border-radius: 8px; text-align: center; color: #991b1b;">
No products were sold on this date.
</div>
@endif

---

@component('mail::button', ['url' => route('dashboard')])
View Admin Dashboard
@endcomponent

<div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; text-align: center;">
This report covers all orders from 00:00:00 to 23:59:59 on {{ $date }}.
</div>

Thanks,<br>
{{ config('app.name') }}
@endcomponent
