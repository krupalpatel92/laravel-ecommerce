import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
    quantity: number;
    max?: number;
    min?: number;
    onChange: (quantity: number) => void;
}

export function QuantitySelector({ quantity, max = 99, min = 1, onChange }: QuantitySelectorProps) {
    const handleIncrement = () => {
        if (quantity < max) {
            onChange(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (quantity > min) {
            onChange(quantity - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= min && value <= max) {
            onChange(value);
        } else if (e.target.value === '') {
            onChange(min);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= min}
                className="h-10 w-10"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                type="number"
                min={min}
                max={max}
                value={quantity}
                onChange={handleInputChange}
                className="h-10 w-20 text-center"
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= max}
                className="h-10 w-10"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
