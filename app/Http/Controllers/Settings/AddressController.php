<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    /**
     * Display the user's addresses management page.
     */
    public function index(): Response
    {
        return Inertia::render('settings/addresses');
    }
}
