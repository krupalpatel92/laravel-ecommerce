import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Period } from '@/types/dashboard.types';
import { router } from '@inertiajs/react';

interface PeriodSelectorProps {
    value: Period;
    onChange?: (period: Period) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    const handleChange = (newPeriod: Period) => {
        if (onChange) {
            onChange(newPeriod);
        } else {
            router.get(
                '/admin/dashboard',
                { period: newPeriod },
                { preserveState: true, preserveScroll: true }
            );
        }
    };

    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="w-[140px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
        </Select>
    );
}
