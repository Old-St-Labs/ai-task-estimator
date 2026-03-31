import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'AI Task Estimator',
    description: 'Estimate task effort with AI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
