'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Order, OrderFirestore } from '@/lib/types';

export function useOrders() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'pedidos'), orderBy('createdAt', 'desc'));
  }, [firestore]);

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
