import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

interface CheckoutLayoutProps {
    children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <h1 className="text-2xl font-bold">Laravel eCommerce</h1>
                        </Link>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">{children}</main>

            <footer className="mt-auto border-t py-6 text-center text-sm text-muted-foreground">
                <p>&copy; 2025 Laravel eCommerce. All rights reserved.</p>
            </footer>
        </div>
    );
}
