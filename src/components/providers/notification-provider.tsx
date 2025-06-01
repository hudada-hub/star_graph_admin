'use client';

import { Toaster } from 'sonner';

export function NotificationProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
        />
    );
} 