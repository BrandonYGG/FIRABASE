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
    // Query orders collection where userId matches the current user's uid
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
      fechaMinEntrega: (order.fechaMinEntrega as Timestamp).toDate(),
      fechaMaxEntrega: (order.fechaMaxEntrega as Timestamp).toDate(),
      createdAt: (order.createdAt as Timestamp).toDate(),
    }));
  }, [rawOrders]);

  return { orders, loading: isLoading, error };
}
