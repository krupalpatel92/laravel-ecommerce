import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as cartsIndex } from '@/routes/admin/carts';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as adminDashboardIndex } from '@/routes/admin/dashboard';
import { index as adminOrdersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { index as ordersIndex } from '@/routes/orders';
import { index as shopProductsIndex } from '@/routes/products';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Package, Receipt, ShoppingBag, ShoppingCart, Tag } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.roles?.includes('superadmin');

    const customerNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Shop Products',
            href: shopProductsIndex(),
            icon: ShoppingBag,
        },
        {
            title: 'My Orders',
            href: ordersIndex(),
            icon: Receipt,
        },
    ];

    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: adminDashboardIndex(),
            icon: LayoutGrid,
        },
        {
            title: 'Categories',
            href: categoriesIndex(),
            icon: Tag,
        },
        {
            title: 'Products',
            href: productsIndex(),
            icon: Package,
        },
        {
            title: 'Orders',
            href: adminOrdersIndex(),
            icon: Receipt,
        },
        {
            title: 'Users Carts',
            href: cartsIndex(),
            icon: ShoppingCart,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={customerNavItems} label="Shopping" />
                {isSuperAdmin && <NavMain items={adminNavItems} label="Administration" />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
