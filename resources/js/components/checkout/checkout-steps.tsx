import { Check, CreditCard, ShoppingCart, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
    currentStep: 1 | 2 | 3;
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const steps = [
        {
            number: 1,
            title: 'Review Cart',
            icon: ShoppingCart,
        },
        {
            number: 2,
            title: 'Shipping',
            icon: Truck,
        },
        {
            number: 3,
            title: 'Payment',
            icon: CreditCard,
        },
    ];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const isUpcoming = step.number > currentStep;

                    return (
                        <div key={step.number} className="flex flex-1 items-center">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                                        isCompleted &&
                                            'border-primary bg-primary text-primary-foreground',
                                        isCurrent &&
                                            'border-primary bg-background text-primary',
                                        isUpcoming &&
                                            'border-muted bg-background text-muted-foreground',
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-6 w-6" />
                                    ) : (
                                        <Icon className="h-6 w-6" />
                                    )}
                                </div>

                                <div className="mt-2 text-center">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            (isCompleted || isCurrent) &&
                                                'text-foreground',
                                            isUpcoming && 'text-muted-foreground',
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                </div>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="mx-4 flex-1">
                                    <div
                                        className={cn(
                                            'h-0.5 w-full transition-colors',
                                            step.number < currentStep
                                                ? 'bg-primary'
                                                : 'bg-muted',
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
