import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { Poppins, PT_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontSans = PT_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '700'],
});

const fontHeading = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700'],
});


export const metadata: Metadata = {
  title: 'OrderFlow Construct',
  description: 'Gestión de pedidos de materiales para construcción.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontSans.variable,
          fontHeading.variable
      )}>
        <FirebaseClientProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster />
            </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
