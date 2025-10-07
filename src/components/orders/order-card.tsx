
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User, HardHat, CreditCard, Wallet, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UrgencyBadge } from './urgency-badge';

type OrderCardProps = {
  order: Order;
};

export function OrderCard({ order }: OrderCardProps) {
  
  const fullAddress = `${order.direccion}, ${order.colonia}, ${order.ciudad}, ${order.estado}, C.P. ${order.codigoPostal}`;

  return (
    <Card className={`transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-headline">{order.obra}</CardTitle>
            <CardDescription className="flex items-center pt-1">
                <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                <span>{order.ciudad}, {order.estado}</span>
            </CardDescription>
          </div>
          <UrgencyBadge date={order.fechaMaxEntrega} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">Solicitante:</span> {order.solicitante}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>
            <span className="font-semibold">Entrega:</span> {format(order.fechaMinEntrega, 'P', { locale: es })} - {format(order.fechaMaxEntrega, 'P', { locale: es })}
          </span>
        </div>
        <div className="flex items-center">
          {order.tipoPago === 'Credito' ? <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> : <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>
            <span className="font-semibold">Pago:</span> {order.tipoPago}
            {order.tipoPago === 'Credito' && ` (${order.frecuenciaCredito})`}
          </span>
        </div>
         <div className="flex items-start">
          <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span><span className="font-semibold">Dirección:</span> {fullAddress}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground flex items-center">
            <HardHat className="mr-2 h-4 w-4" />
            <span>Estado: {order.status}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
