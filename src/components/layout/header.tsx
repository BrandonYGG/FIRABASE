import Link from 'next/link';
import { Construction, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Construction className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">OrderFlow Construct</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-2 text-sm font-medium ml-auto">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Link>
          </Button>
          <Button asChild>
            <Link href="/auth/register">
               <UserPlus className="mr-2 h-4 w-4" />
              Registrarse
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
