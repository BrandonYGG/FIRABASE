'use client'
import { OrderList } from '@/components/orders/order-list';

export default function VerPedidosPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
        Historial de Pedidos
      </h1>
      <OrderList />
    </div>
  );
}
