'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { useCollectionGroup } from '@/firebase/hooks/use-collection-group';
import { OrderFirestore, Order } from '@/lib/types';
import { OrderCard } from '../orders/order-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderFilters } from '../orders/order-filters';


export function AllOrdersList() {
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || '';

    const allOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'pedidos'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: allOrders, isLoading, error } = useCollectionGroup<OrderFirestore>(allOrdersQuery);
    
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [paymentTypeFilter, setPaymentTypeFilter] = useState('');

    const mappedAndFilteredOrders: Order[] = useMemo(() => {
        if (!allOrders) return [];
        return allOrders
            .map(order => ({
                ...order,
                fechaMinEntrega: order.fechaMinEntrega.toDate(),
                fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
                createdAt: order.createdAt.toDate(),
            }))
            .filter(order => {
                const statusMatch = statusFilter ? order.status === statusFilter : true;
                const paymentTypeMatch = paymentTypeFilter ? order.tipoPago === paymentTypeFilter : true;
                return statusMatch && paymentTypeMatch;
            });
    }, [allOrders, statusFilter, paymentTypeFilter]);


    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>No se pudieron cargar los pedidos. Por favor, intente de nuevo más tarde.</AlertDescription>
            </Alert>
        );
    }

    return (
         <div>
            <OrderFilters
                setStatusFilter={setStatusFilter}
                setPaymentTypeFilter={setPaymentTypeFilter}
            />
             {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                    </div>
                    </div>
                ))}
                </div>
            ) : mappedAndFilteredOrders.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mappedAndFilteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} isAdminView={true}/>
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold font-headline">No se encontraron pedidos</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        No hay pedidos que coincidan con los filtros seleccionados.
                    </p>
                </div>
            )}
        </div>
    )

}
