'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import type { Order, OrderFirestore } from '@/lib/types';

export function useOrders() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collection(firestore, 'pedidos'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: rawOrders, isLoading, error } = useCollection<OrderFirestore>(ordersQuery);
  
  const orders = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.map(order => ({
      ...order,
      fechaMinEntrega: order.fechaMinEntrega instanceof Timestamp ? order.fechaMinEntrega.toDate() : new Date(order.fechaMinEntrega),
      fechaMaxEntrega: order.fechaMaxEntrega instanceof Timestamp ? order.fechaMaxEntrega.toDate() : new Date(order.fechaMaxEntrega),
      createdAt: order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt),
    } as Order));
  }, [rawOrders]);

  return { orders, loading: isLoading, error };
}
