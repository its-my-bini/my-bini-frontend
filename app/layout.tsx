import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Bini - AI Girlfriend',
  description: 'Chat with your AI girlfriend powered by Web3',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
