
'use client';

import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Construction, LayoutDashboard, ListOrdered, FilePlus2, LogOut, Settings, CalendarIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    // Format: 10/ Octubre / 2025
    setCurrentDate(format(today, "d/ MMMM / yyyy", { locale: es }));
  }, []);


  const sidebarMenuItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/pedidos', label: 'Mis Pedidos', icon: ListOrdered },
      { href: '/pedidos/nuevo', label: 'Nuevo Pedido', icon: FilePlus2 },
      { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
  ]
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center space-x-2 px-2">
                    <Construction className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-lg">OrderFlow</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {sidebarMenuItems.map((item) =>(
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                            <Link href={item.href}>
                                <item.icon/>
                                {item.label}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <SidebarTrigger className="sm:hidden" />
                 <div className="ml-auto flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="overflow-hidden rounded-full"
                        >
                            <Avatar>
                                <AvatarImage src="https://upload.wikimedia.org/wikipedia/en/3/34/Jimmy_McGill_BCS_S3.png" alt="Avatar" className="object-contain" />
                                <AvatarFallback>JM</AvatarFallback>
                            </Avatar>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">Configuración</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Soporte</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/">
                                <LogOut className="mr-2" />
                                Cerrar Sesión
                            </Link>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
             <footer className="p-4 sm:px-6">
                <div className="flex justify-end">
                    {currentDate && (
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>{currentDate}</span>
                    </div>
                    )}
                </div>
            </footer>
        </SidebarInset>
    </SidebarProvider>
  );
}
