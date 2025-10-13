
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Wand2, Trash2, PlusCircle } from 'lucide-react';
import { OrderFormSchema, PaymentType, CreditFrequency } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createOrderAction } from '@/app/actions';
import { getUrgency, UrgencyBadge } from '@/components/orders/urgency-badge';
import type { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import mxLocations from '@/lib/data/mx-locations.json';
import { Textarea } from '../ui/textarea';
import { generateOrderPdf } from '@/lib/pdf-generator';

type OrderFormValues = z.infer<typeof OrderFormSchema>;

const mockMaterials = [
    { id: 'cemento-01', nombre: 'Cemento Cruz Azul 50kg', precio: 250 },
    { id: 'cemento-02', nombre: 'Mortero 50kg', precio: 220 },
    { id: 'cal-01', nombre: 'Calidra 25kg', precio: 80 },
    { id: 'varilla-01', nombre: 'Varilla 3/8" 12m', precio: 180 },
    { id: 'varilla-02', nombre: 'Varilla 1/2" 12m', precio: 320 },
    { id: 'varilla-03', nombre: 'Varilla 5/8" 12m', precio: 500 },
    { id: 'alambron-01', nombre: 'Alambrón 1/4" (rollo)', precio: 1200 },
    { id: 'alambre-01', nombre: 'Alambre Recocido (kg)', precio: 40 },
    { id: 'ladrillo-01', nombre: 'Ladrillo Rojo (millar)', precio: 3500 },
    { id: 'block-01', nombre: 'Block Hueco 12x20x40cm', precio: 14 },
    { id: 'block-02', nombre: 'Block Macizo 10x20x40cm', precio: 12 },
    { id: 'arena-01', nombre: 'Arena (m³)', precio: 400 },
    { id: 'grava-01', nombre: 'Grava (m³)', precio: 450 },
    { id: 'pegazulejo-01', nombre: 'Pegazulejo 20kg', precio: 150 },
    { id: 'yeso-01', nombre: 'Yeso 25kg', precio: 90 },
]

export function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      solicitante: '',
      obra: '',
      calle: '',
      numero: '',
      colonia: '',
      codigoPostal: '',
      ciudad: '',
      estado: '',
      tipoPago: undefined,
      frecuenciaCredito: undefined,
      metodoPago: '',
      total: 0, 
      materiales: [{ materialId: '', cantidad: 1, precioUnitario: 0, descripcion: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "materiales",
  });

  const tipoPago = form.watch('tipoPago');
  const selectedEstado = form.watch('estado');
  const materiales = form.watch('materiales');

  useEffect(() => {
    const total = materiales.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
    form.setValue('total', total);
  }, [materiales, form]);

  const municipios = useMemo(() => {
    if (!selectedEstado) return [];
    const estadoData = mxLocations.find(e => e.nombre === selectedEstado);
    return estadoData ? estadoData.municipios : [];
  }, [selectedEstado]);
  
  const urgencySuggestion = useMemo(() => {
    if (!date?.to) return null;
    return getUrgency(date.to).suggestion;
  }, [date]);


  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true);

    const formattedData = {
        ...data,
        calle: data.calle.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
        colonia: data.colonia.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
    };
    
    const result = await createOrderAction(formattedData);

    if (result.success && result.order) {
      toast({
        title: 'Éxito',
        description: result.message,
      });
      generateOrderPdf({
        ...result.order,
        createdAt: new Date(result.order.createdAt), // Rehydrate string to Date for PDF
      });
      router.push('/pedidos');
    } else {
        if (result.errors) {
            result.errors.forEach(err => {
                form.setError(err.path.join('.') as keyof OrderFormValues, {
                    type: 'manual',
                    message: err.message,
                });
            });
        }
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message || 'Por favor revise los campos del formulario.',
        });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Registrar Pedido de Materiales</CardTitle>
        <CardDescription>Complete los detalles para solicitar sus materiales de construcción.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <CardTitle className="text-lg font-headline">Información del Solicitante</CardTitle>
                <div className="grid md:grid-cols-2 gap-4 md:gap-8">
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
            </div>
            
            <div className="space-y-4">
                <CardTitle className="text-lg font-headline">Dirección de Entrega</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                    <FormField
                        control={form.control}
                        name="calle"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Calle</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. Av. Principal" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej. 123" {...field} onChange={(e) => {
                                        const { value } = e.target;
                                        field.onChange(value.replace(/\D/g, ''));
                                    }}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                     <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un estado" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {mxLocations.map((estado) => (
                                    <SelectItem key={estado.nombre} value={estado.nombre}>{estado.nombre}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="ciudad"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{selectedEstado === 'Ciudad de México' ? 'Delegación' : 'Municipio'}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEstado}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={selectedEstado ? `Seleccione un${selectedEstado === 'Ciudad de México' ? 'a delegación' : ' municipio'}` : "Seleccione un estado primero"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {municipios.map((municipio) => (
                                    <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                    control={form.control}
                    name="colonia"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Colonia</FormLabel>
                             <FormControl>
                                <Input placeholder="Ej. Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={form.control}
                    name="codigoPostal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. 50000" {...field} onChange={(e) => {
                                const { value } = e.target;
                                field.onChange(value.replace(/\D/g, ''));
                            }}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <div className="space-y-4">
                 <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            <CardTitle className="text-lg font-headline">Materiales del Pedido</CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border rounded-md relative">
                                        <FormField
                                            control={form.control}
                                            name={`materiales.${index}.materialId`}
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-4">
                                                    <FormLabel>Material</FormLabel>
                                                    <Select onValueChange={(value) => {
                                                        const material = mockMaterials.find(m => m.id === value);
                                                        field.onChange(value);
                                                        form.setValue(`materiales.${index}.precioUnitario`, material?.precio || 0);
                                                        form.setValue(`materiales.${index}.descripcion`, material?.nombre || '');
                                                    }} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar material"/>
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {mockMaterials.map((material) => (
                                                                <SelectItem key={material.id} value={material.id}>
                                                                    {material.nombre}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`materiales.${index}.cantidad`}
                                            render={({ field }) => (
                                                <FormItem className="sm:col-span-2">
                                                    <FormLabel>Cantidad</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="sm:col-span-3 flex flex-col justify-center">
                                            <FormLabel>Subtotal</FormLabel>
                                            <p className="font-medium h-10 flex items-center">
                                               S/ {(materiales[index].cantidad * materiales[index].precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="sm:col-span-3 flex items-end">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar material</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ materialId: '', cantidad: 1, precioUnitario: 0, descripcion: '' })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Material
                                </Button>
                                <div className="flex justify-end items-center pt-4">
                                     <h3 className="text-lg font-bold">Total del Pedido:</h3>
                                     <p className="text-lg font-bold ml-2">S/ {form.watch('total').toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="space-y-4">
                <CardTitle className="text-lg font-headline">Cronograma y Pago</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
                <FormItem className="flex flex-col">
                    <FormLabel>Rango de Fechas de Entrega</FormLabel>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                                form.trigger(['fechaMinEntrega', 'fechaMaxEntrega']);
                            }}
                            numberOfMonths={2}
                            locale={es}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        />
                        <div className="p-2 border-t">
                            <Button
                                disabled={!date?.from || !date?.to}
                                onClick={() => setIsCalendarOpen(false)}
                                className="w-full"
                                size="sm"
                            >
                                Confirmar
                            </Button>
                        </div>
                        </PopoverContent>
                    </Popover>
                    <FormDescription>
                        El día de inicio se marca en verde, el final en rojo y el día actual en morado.
                    </FormDescription>
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
                        <div className="flex items-start text-sm text-muted-foreground p-2 rounded-md bg-accent/10 border border-accent/20">
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
                <div className="flex flex-col space-y-8 border-l-4 border-primary pl-4 animate-in fade-in-50">
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
                        name="ine"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>INE (Frente y reverso)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => onChange(e.target.files)} 
                                        {...rest}
                                    />
                                </FormControl>
                                <FormDescription>
                                    El archivo puede ser JPG (fotografía) o PDF. ¿Necesitas reducir el tamaño? <a href="https://www.iloveimg.com/es/comprimir-imagen/comprimir-jpg" target="_blank" rel="noopener noreferrer" className="underline text-primary">Comprimir imagen</a>, <a href="https://www.ilovepdf.com/es/comprimir_pdf" target="_blank" rel="noopener noreferrer" className="underline text-primary">Comprimir PDF</a>.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="comprobanteDomicilio"
                        render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Comprobante de Domicilio</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => onChange(e.target.files)}
                                        {...rest} 
                                    />
                                </FormControl>
                                <FormDescription>
                                    No mayor a 3 meses. El archivo puede ser JPG (fotografía) o PDF. ¿Necesitas reducir el tamaño? <a href="https://www.iloveimg.com/es/comprimir-imagen/comprimir-jpg" target="_blank" rel="noopener noreferrer" className="underline text-primary">Comprimir imagen</a>, <a href="https://www.ilovepdf.com/es/comprimir_pdf" target="_blank" rel="noopener noreferrer" className="underline text-primary">Comprimir PDF</a>.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                )}
            </div>

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
