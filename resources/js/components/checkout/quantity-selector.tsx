import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export default function QuantitySelector({
    value,
    onChange,
    min = 1,
    max = 999,
    disabled = false,
}: QuantitySelectorProps) {
    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value, 10);

        if (isNaN(newValue)) {
            onChange(min);
            return;
        }

        if (newValue < min) {
            onChange(min);
        } else if (newValue > max) {
            onChange(max);
        } else {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="outline"
                size="sm"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                type="button"
                className="h-8 w-8 p-0"
            >
                <Minus className="h-3 w-3" />
            </Button>

            <Input
                type="number"
                value={value}
                onChange={handleInputChange}
                min={min}
                max={max}
                disabled={disabled}
                className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <Button
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                type="button"
                className="h-8 w-8 p-0"
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    );
}
