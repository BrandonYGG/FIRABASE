'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import { OrderFormSchema, PaymentType, CreditFrequency } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createOrderAction } from '@/app/actions';
import { getUrgency, UrgencyBadge } from './urgency-badge';
import type { DateRange } from 'react-day-picker';

type OrderFormValues = z.infer<typeof OrderFormSchema>;

export function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      solicitante: '',
      obra: '',
      ubicacion: '',
      tipoPago: undefined,
      frecuenciaCredito: undefined,
      metodoPago: '',
    },
  });

  const tipoPago = form.watch('tipoPago');
  
  const urgencySuggestion = useMemo(() => {
    if (!date?.to) return null;
    return getUrgency(date.to).suggestion;
  }, [date]);

  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true);
    const result = await createOrderAction(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Éxito',
        description: result.message,
      });
      router.push('/pedidos');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Por favor revise los campos del formulario.',
      });
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Registrar Pedido de Materiales</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="solicitante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Solicitante</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="obra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Obra</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Edificio Central" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ubicacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación de la Obra</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Av. Principal 123, Ciudad" {...field} />
                  </FormControl>
                  <FormDescription>Si ha hecho pedidos previos, intente usar la misma ubicación.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-8 items-start">
               <FormItem className="flex flex-col">
                  <FormLabel>Rango de Fechas de Entrega</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                                {format(date.to, "LLL dd, y", { locale: es })}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y", { locale: es })
                            )
                          ) : (
                            <span>Seleccione un rango de fechas</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                       <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(range) => {
                            setDate(range);
                            if(range?.from) form.setValue('fechaMinEntrega', range.from);
                            if(range?.to) form.setValue('fechaMaxEntrega', range.to);
                        }}
                        numberOfMonths={2}
                        locale={es}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="mt-2">
                    {form.formState.errors.fechaMinEntrega?.message || form.formState.errors.fechaMaxEntrega?.message}
                  </FormMessage>
               </FormItem>
              
               <div className="space-y-2">
                  <FormLabel>Cronograma de Urgencia</FormLabel>
                  <div className="p-4 border rounded-md min-h-[40px] flex items-center justify-center">
                    {date?.to ? (
                       <UrgencyBadge date={date.to} showText={true}/>
                    ) : (
                      <p className="text-sm text-muted-foreground">Seleccione una fecha final</p>
                    )}
                  </div>
                   {urgencySuggestion && (
                    <div className="flex items-start text-sm text-accent-foreground/80 p-2 rounded-md bg-accent/10 border border-accent/20">
                      <Wand2 className="h-4 w-4 mr-2 mt-0.5 text-accent flex-shrink-0"/>
                      <p>{urgencySuggestion}</p>
                    </div>
                  )}
               </div>
            </div>

            <FormField
              control={form.control}
              name="tipoPago"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Pago</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4"
                    >
                      {Object.values(PaymentType).map((type) => (
                        <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={type} />
                          </FormControl>
                          <FormLabel className="font-normal">{type}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipoPago === 'Credito' && (
              <div className="grid md:grid-cols-2 gap-8 border-l-4 border-primary pl-4 animate-in fade-in-50">
                <FormField
                  control={form.control}
                  name="frecuenciaCredito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia de Crédito</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(CreditFrequency).map((freq) => (
                            <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metodoPago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarjeta o Método de Pago</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Tarjeta VISA **** 1234" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Pedido
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
