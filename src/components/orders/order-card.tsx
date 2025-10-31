
'use client'
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, User, HardHat, CreditCard, Wallet, MapPin, DollarSign, Download, Loader2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UrgencyBadge } from './urgency-badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus } from '@/firebase/hooks/update-order-status';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OrderDetailsDialog } from './order-details-dialog';
import { Badge } from '../ui/badge';


type OrderCardProps = {
  order: Order;
  isAdminView?: boolean;
};

export function OrderCard({ order, isAdminView = false }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const fullAddress = `${order.calle} ${order.numero}, ${order.colonia}, ${order.ciudad}, ${order.estado}, C.P. ${order.codigoPostal}`;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return;

    setIsUpdating(true);
    try {
        await updateOrderStatus(order.userId, order.id, newStatus as keyof typeof OrderStatus);
        toast({
            title: "Estado Actualizado",
            description: `El pedido de ${order.obra} ahora está ${newStatus}.`
        })
    } catch(error) {
        console.error("Failed to update status: ", error);
        toast({
            variant: 'destructive',
            title: "Error",
            description: "No se pudo actualizar el estado del pedido."
        })
    } finally {
        setIsUpdating(false);
    }
  }

  const isDelivered = order.status === OrderStatus.Entregado;

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Card className={`transition-all hover:shadow-lg flex flex-col cursor-pointer`}>
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
            <CardContent className="grid gap-4 text-sm flex-grow">
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
            <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-4 rounded-b-lg">
                {isAdminView ? (
                    <div className="flex items-center gap-2">
                        <HardHat className="h-4 w-4 text-muted-foreground"/>
                        {isUpdating ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span>Actualizando...</span>
                            </div>
                        ) : isDelivered ? (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Entregado
                            </Badge>
                        ) : (
                            <Select onValueChange={handleStatusChange} defaultValue={order.status}>
                                <SelectTrigger 
                                    className="w-[150px] h-8 text-xs"
                                    onClick={(e) => e.stopPropagation()} // Prevent dialog from opening when clicking select
                                >
                                    <SelectValue placeholder="Cambiar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(OrderStatus).map((status) => (
                                        <SelectItem key={status} value={status} className="text-xs">
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground flex items-center">
                         <Badge className="text-xs" variant={order.status === 'Entregado' ? 'secondary' : order.status === 'Cancelado' ? 'destructive' : 'default'}>
                            {order.status}
                        </Badge>
                    </div>
                )}
            
                <div className="text-xs text-muted-foreground">
                    Ver detalles
                </div>
            </CardFooter>
            </Card>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
            <OrderDetailsDialog order={order} />
        </DialogContent>
    </Dialog>
  );
}
