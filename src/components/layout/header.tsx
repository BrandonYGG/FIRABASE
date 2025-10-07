import Link from 'next/link';
import { Construction } from 'lucide-react';

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
        <nav className="flex items-center space-x-6 text-sm font-medium ml-auto">
          <Link
            href="/pedidos/nuevo"
            className="transition-colors hover:text-primary"
          >
            Nuevo Pedido
          </Link>
          <Link
            href="/pedidos"
            className="transition-colors hover:text-primary"
          >
            Ver Pedidos
          </Link>
        </nav>
      </div>
    </header>
  );
}
