import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    expiresAt: string;
}

export default function CartExpiryTimer({ expiresAt }: Props) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const diff = expiry - now;

            if (diff <= 0) {
                setTimeLeft('expired');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Mark as urgent if less than 1 hour left
            setIsUrgent(hours < 1);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${seconds}s`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (timeLeft === 'expired') {
        return (
            <Alert variant="destructive">
                <Clock className="size-4" />
                <AlertDescription>
                    Your cart has expired. Items may no longer be available.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert variant={isUrgent ? 'destructive' : 'default'}>
            <Clock className="size-4" />
            <AlertDescription>
                {isUrgent ? (
                    <span className="font-semibold">
                        Cart expires in {timeLeft}
                    </span>
                ) : (
                    <span>Your cart will expire in {timeLeft}</span>
                )}
            </AlertDescription>
        </Alert>
    );
}
