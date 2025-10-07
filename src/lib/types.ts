
import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

export const PaymentType = {
  Contado: 'Contado',
  Credito: 'Credito',
} as const;

export const CreditFrequency = {
  Semanal: 'Semanal',
  Quincenal: 'Quincenal',
  Mensual: 'Mensual',
} as const;

export const OrderStatus = {
    Pendiente: 'Pendiente',
    EnProceso: 'En proceso',
    Entregado: 'Entregado',
    Cancelado: 'Cancelado',
} as const;

export const OrderFormSchema = z.object({
  solicitante: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  obra: z.string().min(3, { message: 'El nombre de la obra debe tener al menos 3 caracteres.' }),
  direccion: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }),
  codigoPostal: z.string().regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos.' }),
  colonia: z.string().min(1, { message: 'Debe seleccionar una colonia.' }),
  ciudad: z.string().min(1, { message: 'La ciudad es un campo requerido.' }),
  estado: z.string().min(1, { message: 'El estado es un campo requerido.' }),
  fechaMinEntrega: z.coerce.date({
    required_error: "La fecha mínima de entrega es obligatoria.",
    invalid_type_error: "Formato de fecha inválido.",
  }),
  fechaMaxEntrega: z.coerce.date({
    required_error: "La fecha máxima de entrega es obligatoria.",
    invalid_type_error: "Formato de fecha inválido.",
  }),
  tipoPago: z.nativeEnum(PaymentType, {
    required_error: 'Debe seleccionar un tipo de pago.',
  }),
  frecuenciaCredito: z.nativeEnum(CreditFrequency).nullable().optional(),
  metodoPago: z.string().nullable().optional(),
}).refine(data => data.fechaMaxEntrega >= data.fechaMinEntrega, {
    message: 'La fecha máxima no puede ser anterior a la fecha mínima.',
    path: ['fechaMaxEntrega'],
}).refine(data => {
    if (data.tipoPago === 'Credito') {
        return !!data.frecuenciaCredito;
    }
    return true;
}, {
    message: 'Debe seleccionar una frecuencia para el crédito.',
    path: ['frecuenciaCredito'],
}).refine(data => {
    if (data.tipoPago === 'Credito') {
        return !!data.metodoPago && data.metodoPago.length > 0;
    }
    return true;
}, {
    message: 'El método de pago es obligatorio para el crédito.',
    path: ['metodoPago'],
});

export type OrderFormData = z.infer<typeof OrderFormSchema>;

interface BaseOrder {
  id: string;
  solicitante: string;
  obra: string;
  direccion: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  tipoPago: z.infer<typeof OrderFormSchema.shape.tipoPago>;
  frecuenciaCredito: z.infer<typeof OrderFormSchema.shape.frecuenciaCredito>;
  metodoPago: z.infer<typeof OrderFormSchema.shape.metodoPago>;
  status: keyof typeof OrderStatus;
}

export interface Order extends BaseOrder {
  fechaMinEntrega: Date;
  fechaMaxEntrega: Date;
  createdAt: Date;
}

export interface OrderFirestore extends BaseOrder {
  fechaMinEntrega: Timestamp;
  fechaMaxEntrega: Timestamp;
  createdAt: Timestamp;
}
