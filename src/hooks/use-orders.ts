'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { OrderStatus, PaymentType, CreditFrequency } from '@/lib/types';

const mockOrders: Order[] = [
  // Data removed as requested to show an empty state.
];


export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate a network request
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  return { orders, loading, error };
}
