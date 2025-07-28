import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientSessionProvider } from '@/components/auth/client-session-provider';

export const metadata: Metadata = {
  title: 'NWCS Internship Portal',
  description: 'Internship Portal for NWCS (Networking and Cyber-Security)',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientSessionProvider>
            {children}
            <Toaster />
          </ClientSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
