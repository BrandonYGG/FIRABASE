'use client';
import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserProfileWithId, OrderFirestore, Order } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { OrderCard } from '../orders/order-card';
import { Frown } from 'lucide-react';

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
        return <Alert variant="destructive"><AlertDescription>Error al cargar pedidos.</AlertDescription></Alert>
    }

    return (
        <div className="bg-muted p-4 rounded-b-md">
            {mappedOrders.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedOrders.map((order) => (
                        <OrderCard key={order.id} order={order} />
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
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading, error } = useCollection<UserProfileWithId>(usersQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No se pudieron cargar los usuarios. Verifique los permisos de administrador.</AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {users?.map(user => (
                <AccordionItem value={user.id} key={user.id} className="border rounded-md bg-card">
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
    )
}
