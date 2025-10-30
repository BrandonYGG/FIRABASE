
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User, HardHat, CreditCard, Wallet, MapPin, DollarSign, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UrgencyBadge } from './urgency-badge';
import { Button } from '@/components/ui/button';
import { generateOrderPdf } from '@/lib/pdf-generator';

type OrderCardProps = {
  order: Order;
};

export function OrderCard({ order }: OrderCardProps) {
  
  const fullAddress = `${order.calle} ${order.numero}, ${order.colonia}, ${order.ciudad}, ${order.estado}, C.P. ${order.codigoPostal}`;

  const handleDownload = () => {
    generateOrderPdf(order);
  }

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
          {order.tipoPago === 'Tarjeta' ? <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> : <Wallet className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>
            <span className="font-semibold">Pago:</span> {order.tipoPago}
            {order.tipoPago === 'Tarjeta' && ` (${order.frecuenciaCredito})`}
          </span>
        </div>
         <div className="flex items-start">
          <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span><span className="font-semibold">Dirección:</span> {fullAddress}</span>
        </div>
        {order.total && (
        <div className="flex items-center font-semibold">
          <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Total: ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
        </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center">
            <HardHat className="mr-2 h-4 w-4" />
            <span>Estado: {order.status}</span>
        </div>
        <Button variant="outline" size="icon" onClick={handleDownload} aria-label="Descargar PDF del pedido">
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
