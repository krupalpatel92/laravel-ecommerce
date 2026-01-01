@component('mail::message')
# ⚠️ Low Stock Alert

Hello Admin,

The following product is running low on stock and requires immediate attention:

@component('mail::panel')
**Product:** {{ $product->name }}
@if($variation)
**Variation:** {{ $variation->name }}
**SKU:** {{ $variation->sku }}
**Current Stock:** <span style="color: #dc2626; font-weight: bold;">{{ $variation->stock_quantity }} units</span>
@else
**SKU:** {{ $product->slug }}
**Current Stock:** <span style="color: #dc2626; font-weight: bold;">{{ $product->stock_quantity }} units</span>
@endif
**Alert Threshold:** {{ $product->alert_threshold }} units
@endcomponent

⚠️ **Status:** Low Stock - Immediate attention required!

@component('mail::button', ['url' => route('admin.products.edit', $product->id)])
View Product & Restock
@endcomponent

Please take action to restock this item as soon as possible to avoid stockouts.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
