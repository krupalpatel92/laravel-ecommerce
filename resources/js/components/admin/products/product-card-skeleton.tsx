import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductCardSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden">
            {/* Product Image Skeleton */}
            <Skeleton className="aspect-square w-full" />

            <CardHeader className="pb-3">
                <div className="space-y-1.5">
                    {/* Title Skeleton */}
                    <Skeleton className="h-5 w-3/4" />
                    {/* Slug Skeleton */}
                    <Skeleton className="h-3 w-1/2" />
                </div>

                {/* Status and Type Badges Skeleton */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pb-3">
                {/* Category Badges Skeleton */}
                <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>

                {/* Description Skeleton */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Price and Stock Skeleton */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}
