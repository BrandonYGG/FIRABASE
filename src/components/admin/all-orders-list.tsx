
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { OrderFirestore, Order } from '@/lib/types';
import { OrderCard } from '../orders/order-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown, ShieldAlert, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

export function AllOrdersList() {
    const firestore = useFirestore();
    const [searchQuery, setSearchQuery] = useState('');

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !searchQuery) return null;
        // Search by `obra` field. This requires an index.
        return query(collection(firestore, 'pedidos'), where('obra', '==', searchQuery));
    }, [firestore, searchQuery]);

    const { data: allOrders, isLoading, error } = useCollection<OrderFirestore>(ordersQuery);

    const mappedOrders: Order[] = useMemo(() => {
        if (!allOrders) return [];
        return allOrders.map(order => ({
            ...order,
            fechaMinEntrega: order.fechaMinEntrega.toDate(),
            fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
            createdAt: order.createdAt.toDate(),
        }));
    }, [allOrders]);

    return (
        <div>
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar pedido por nombre exacto de la obra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                     {error && (
                        <Alert variant="destructive" className="mt-4">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Error de Búsqueda o Permisos</AlertTitle>
                            <AlertDescription>No se pudo realizar la búsqueda. Es posible que necesite crear un índice en Firestore para el campo 'obra' en la colección 'pedidos', o verificar sus permisos de administrador.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : mappedOrders.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mappedOrders.map((order) => (
                        <OrderCard key={order.id} order={order} isAdminView={true} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold font-headline">
                        {searchQuery ? 'No se encontraron pedidos' : 'Realice una búsqueda'}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {searchQuery ? 'No hay pedidos que coincidan con la búsqueda.' : 'Ingrese el nombre exacto de una obra para buscar un pedido.'}
                    </p>
                </div>
            )}
        </div>
    )
}

    