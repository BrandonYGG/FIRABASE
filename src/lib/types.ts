
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];


export const OrderFormSchema = z.object({
  solicitante: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  obra: z.string().min(3, { message: 'El nombre de la obra debe tener al menos 3 caracteres.' }),
  direccion: z.string().min(5, { message: 'La dirección debe tener al menos 5 caracteres.' }),
  codigoPostal: z.string().regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos.' }),
  colonia: z.string().min(3, { message: 'La colonia debe tener al menos 3 caracteres.' }),
  ciudad: z.string().min(3, { message: 'La ciudad debe tener al menos 3 caracteres.' }),
  estado: z.string().min(3, { message: 'El estado debe tener al menos 3 caracteres.' }),
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
  ine: z.any().optional(),
  comprobanteDomicilio: z.any().optional(),
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
}).refine(data => {
    if (data.tipoPago === 'Credito') {
        return data.ine && data.ine?.length > 0;
    }
    return true;
}, {
    message: 'El archivo del INE es obligatorio para el crédito.',
    path: ['ine'],
})
.refine(data => {
    if (data.tipoPago === 'Credito' && data.ine && data.ine.length > 0) {
        return data.ine[0].size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `El tamaño máximo del archivo del INE es de 5MB.`,
    path: ['ine'],
})
.refine(data => {
    if (data.tipoPago === 'Credito' && data.ine && data.ine.length > 0) {
        return ACCEPTED_FILE_TYPES.includes(data.ine[0].type);
    }
    return true;
}, {
    message: "Formato no válido. Solo se aceptan archivos JPG, PNG, WEBP o PDF.",
    path: ['ine'],
})
.refine(data => {
    if (data.tipoPago === 'Credito') {
        return data.comprobanteDomicilio && data.comprobanteDomicilio?.length > 0;
    }
    return true;
}, {
    message: 'El comprobante de domicilio es obligatorio para el crédito.',
    path: ['comprobanteDomicilio'],
})
.refine(data => {
    if (data.tipoPago === 'Credito' && data.comprobanteDomicilio && data.comprobanteDomicilio.length > 0) {
        return data.comprobanteDomicilio[0].size <= MAX_FILE_SIZE;
    }
    return true;
}, {
    message: `El tamaño máximo del comprobante es de 5MB.`,
    path: ['comprobanteDomicilio'],
})
.refine(data => {
    if (data.tipoPago === 'Credito' && data.comprobanteDomicilio && data.comprobanteDomicilio.length > 0) {
        return ACCEPTED_FILE_TYPES.includes(data.comprobanteDomicilio[0].type);
    }
    return true;
}, {
    message: "Formato no válido. Solo se aceptan archivos JPG, PNG, WEBP o PDF.",
    path: ['comprobanteDomicilio'],
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
