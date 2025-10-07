'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order, OrderFirestore } from '@/lib/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // This check is to prevent Firebase errors during Next.js build process
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as OrderFirestore;
          ordersData.push({
            id: doc.id,
            ...data,
            fechaMinEntrega: data.fechaMinEntrega.toDate(),
            fechaMaxEntrega: data.fechaMaxEntrega.toDate(),
            createdAt: data.createdAt.toDate(),
          });
        });
        setOrders(ordersData);
        setLoading(false);
      },
      (err) => {
        console.error("Firebase snapshot error: ", err);
        setError(new Error("Failed to fetch orders from Firestore."));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { orders, loading, error };
}
