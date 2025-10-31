
'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, getDocs, collectionGroup } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserProfileWithId, OrderFirestore, Order } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { OrderCard } from '../orders/order-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Frown, Users, ListOrdered, DollarSign, FileClock } from 'lucide-react';
import { useCollectionGroup } from '@/firebase/hooks/use-collection-group';

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
        return <Alert variant="destructive"><AlertDescription>Error al cargar pedidos. Verifique los permisos.</AlertDescription></Alert>
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
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Fetch all users except the admin themselves
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const { data: users, isLoading: usersLoading, error: usersError } = useCollection<UserProfileWithId>(usersQuery);

    // This is the problematic query that we are removing. We will fetch orders per user instead.
    const allOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'pedidos'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: allOrders, isLoading: ordersLoading, error: ordersError } = useCollectionGroup<OrderFirestore>(allOrdersQuery);
    
    const filteredUsers = useMemo(() => {
        if (!users || !adminUser) return [];
        return users.filter(user => user.id !== adminUser.uid);
    }, [users, adminUser]);

    const globalMetrics = useMemo(() => {
        if (!allOrders || !users) return { totalOrders: 0, totalAmount: 0, pendingOrders: 0, totalUsers: 0 };
        
        const totalAmount = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const pendingOrders = allOrders.filter(order => order.status === 'Pendiente').length;

        return {
            totalOrders: allOrders.length,
            totalAmount,
            pendingOrders,
            totalUsers: filteredUsers.length
        };
    }, [allOrders, users, adminUser, filteredUsers]);

    const isLoading = usersLoading || ordersLoading;
    
    // We only show the users error, as the orders error is the one causing issues.
    if (usersError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No se pudieron cargar los datos de los usuarios. Verifique los permisos de administrador para listar usuarios.</AlertDescription>
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
                            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                            <ListOrdered className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{globalMetrics.totalOrders}</div>}
                            <p className="text-xs text-muted-foreground">Todos los pedidos registrados.</p>
                        </CardContent>
                    </Card>
                 </Link>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monto Global</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${globalMetrics.totalAmount.toLocaleString('es-MX')}</div>}
                        <p className="text-xs text-muted-foreground">Suma de todos los pedidos.</p>
                    </CardContent>
                </Card>
                <Link href={{ pathname: '/admin/pedidos', query: { status: 'Pendiente' } }}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                            <FileClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{globalMetrics.pendingOrders}</div>}
                            <p className="text-xs text-muted-foreground">Pedidos esperando acción.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Gestión de Usuarios y Pedidos</CardTitle>
                    <CardDescription>
                    Seleccione un usuario para ver y administrar sus pedidos individuales.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {usersLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {filteredUsers?.map(user => (
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
                            ))}
                        </Accordion>
                    )}
                    {ordersError && (
                         <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error de Permisos en Pedidos</AlertTitle>
                            <AlertDescription>No se pudieron cargar las métricas globales de pedidos. Verifique que el rol 'admin' tenga permisos para consultas de grupo (`collectionGroup`) en Firestore.</AlertDescription>
                        </Alert>
                    )}
                 </CardContent>
            </Card>
        </div>
    )
}

    