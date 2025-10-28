'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { OrderFirestore } from '@/lib/types';

export function useOrders() {
  const firestore = useFirestore();
  const { user } = useUser();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'pedidos'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: orders, isLoading: loading, error } = useCollection<OrderFirestore>(ordersQuery);

  const mappedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.map(order => ({
      ...order,
      // Convert Firestore Timestamps to JS Date objects
      fechaMinEntrega: order.fechaMinEntrega.toDate(),
      fechaMaxEntrega: order.fechaMaxEntrega.toDate(),
      createdAt: order.createdAt.toDate(),
    }));
  }, [orders]);

  return { orders: mappedOrders, loading, error };
}
