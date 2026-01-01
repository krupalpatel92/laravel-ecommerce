import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.roles?.includes('superadmin');

    // Use sidebar layout for superadmin, header layout for regular users
    const LayoutTemplate = isSuperAdmin ? AppSidebarLayout : AppHeaderLayout;

    return (
        <LayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </LayoutTemplate>
    );
};
