
import Link from 'next/link';
import { Construction } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="absolute top-4 left-4">
             <Link href="/" className="flex items-center space-x-2 text-foreground">
                <Construction className="h-6 w-6 text-primary" />
                <