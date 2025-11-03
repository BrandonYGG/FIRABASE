
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserProfileWithId, OrderFirestore, Order } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { OrderCard } from '../orders/order-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Frown, Users, ListOrdered, DollarSign, FileClock, Search } from 'lucide-react';
import { Input } from '../ui/input';

function UserOrders({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return query(
            collection(firestore, 'users', userId, 'pedidos'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, userId]);

    const { data: orders, isLoading, error } = useCollection<OrderFirestore>(ordersQuery);

    const mappedOrders: Order[] = useMemo(() => {
        if (!orders) return [];
        return orders.map(order => ({
            ...order,
            fechaMinEntrega: order.fechaMinEntrega.toDate(),
            fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
            createdAt: order.createdAt.toDate(),
        }));
    }, [orders]);

    if (isLoading) {
        return (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                    </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return <Alert variant="destructive"><AlertDescription>Error al cargar pedidos para este usuario. Verifique los permisos.</AlertDescription></Alert>
    }

    return (
        <div className="bg-muted p-4 rounded-b-md">
            {mappedOrders.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedOrders.map((order) => (
                        <OrderCard key={order.id} order={order} isAdminView={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Frown className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Este usuario aún no tiene pedidos.</p>
                </div>
            )}
        </div>
    )
}

export function AdminDashboard() {
    const firestore = useFirestore();
    const { user: adminUser } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const { data: users, isLoading: usersLoading, error: usersError } = useCollection<UserProfileWithId>(usersQuery);
    
    const filteredUsers = useMemo(() => {
        if (!users || !adminUser) return [];
        
        let allUsers = users.filter(user => user.id !== adminUser.uid);

        if (searchQuery) {
            allUsers = allUsers.filter(user => 
                user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return allUsers;
    }, [users, adminUser, searchQuery]);

    const globalMetrics = useMemo(() => {
        if (!users) return { totalUsers: 0 };
        const totalUsers = users.filter(user => user.id !== adminUser?.uid).length;
        return { totalUsers };
    }, [users, adminUser]);
    
    const isLoading = usersLoading;
    
    if (usersError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error de Permisos</AlertTitle>
                <AlertDescription>No se pudieron cargar los datos de los usuarios. Verifique que el rol 'admin' tenga permisos para listar usuarios en las reglas de Firestore.</AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{globalMetrics.totalUsers}</div>}
                        <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma.</p>
                    </CardContent>
                </Card>
                 <Link href="/admin/pedidos">
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Globales</CardTitle>
                            <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Ver y filtrar todos los pedidos.</p>
                        </CardContent>
                    </Card>
                 </Link>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monto Global</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">Suma de todos los pedidos.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                        <FileClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground">Pedidos esperando aprobación.</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Gestión de Usuarios y Pedidos</CardTitle>
                    <CardDescription>
                    Busca un usuario por nombre o correo y selecciona para ver y administrar sus pedidos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nombre o correo electrónico..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {usersLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <AccordionItem value={user.id} key={user.id} className="border rounded-md bg-card hover:bg-muted/50 transition-colors">
                                    <AccordionTrigger className="p-4 hover:no-underline">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={user.photoURL || undefined} alt="Avatar" className="object-cover"/>
                                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="text-left">
                                                <p className="font-semibold">{user.displayName || 'Sin Nombre'}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                    <UserOrders userId={user.id} />
                                    </AccordionContent>
                                </AccordionItem>
                            )) : (
                                <div className="text-center py-8">
                                    <Frown className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">No se encontraron usuarios que coincidan con la búsqueda.</p>
                                </div>
                            )}
                        </Accordion>
                    )}
                 </CardContent>
            </Card>
        </div>
    )
}

    