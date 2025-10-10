'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { OrderStatus, PaymentType, CreditFrequency } from '@/lib/types';

const mockOrders: Order[] = [
  {
    id: 'mock-001',
    solicitante: 'Juan Pérez',
    obra: 'Torre Reforma',
    direccion: 'Av. Paseo de la Reforma 483',
    colonia: 'Cuauhtémoc',
    codigoPostal: '06500',
    ciudad: 'Cuauhtémoc',
    estado: 'Ciudad de México',
    fechaMinEntrega: new Date('2025-10-20T00:00:00'),
    fechaMaxEntrega: new Date('2025-10-22T00:00:00'),
    createdAt: new Date('2025-10-18T10:00:00'),
    tipoPago: PaymentType.Credito,
    frecuenciaCredito: CreditFrequency.Quincenal,
    metodoPago: null,
    status: OrderStatus.Pendiente,
    total: 15000.00,
  },
  {
    id: 'mock-002',
    solicitante: 'Ana García',
    obra: 'Plaza Satélite Expansión',
    direccion: 'Circuito Centro Comercial 2251',
    colonia: 'Ciudad Satélite',
    codigoPostal: '53100',
    ciudad: 'Naucalpan de Juárez',
    estado: 'México',
    fechaMinEntrega: new Date('2025-10-25T00:00:00'),
    fechaMaxEntrega: new Date('2025-11-05T00:00:00'),
    createdAt: new Date('2025-10-15T14:30:00'),
    tipoPago: PaymentType.Efectivo,
    frecuenciaCredito: null,
    metodoPago: 'Transferencia',
    status: OrderStatus.EnProceso,
    total: 8500.50,
  },
  {
    id: 'mock-003',
    solicitante: 'Carlos Sánchez',
    obra: 'Residencial Bosques',
    direccion: 'Bosque de Cidros 46',
    colonia: 'Bosques de las Lomas',
    codigoPostal: '05120',
    ciudad: 'Cuajimalpa de Morelos',
    estado: 'Ciudad de México',
    fechaMinEntrega: new Date('2025-11-10T00:00:00'),
    fechaMaxEntrega: new Date('2025-11-20T00:00:00'),
    createdAt: new Date('2025-10-10T09:00:00'),
    tipoPago: PaymentType.Efectivo,
    frecuenciaCredito: null,
    metodoPago: 'Efectivo contra entrega',
    status: OrderStatus.Entregado,
    total: 25000.00,
  },
    {
    id: 'mock-004',
    solicitante: 'Laura Martínez',
    obra: 'Hospital Central',
    direccion: 'Av. Universidad 123',
    colonia: 'Doctores',
    codigoPostal: '06720',
    ciudad: 'Cuauhtémoc',
    estado: 'Ciudad de México',
    fechaMinEntrega: new Date('2025-10-19T00:00:00'),
    fechaMaxEntrega: new Date('2025-10-19T00:00:00'),
    createdAt: new Date('2025-10-18T16:00:00'),
    tipoPago: PaymentType.Credito,
    frecuenciaCredito: CreditFrequency.Mensual,
    metodoPago: null,
    status: OrderStatus.Cancelado,
    total: 5000.00,
  },
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
