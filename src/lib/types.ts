
import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

export const PaymentType = {
  Efectivo: 'Efectivo',
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
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const MaterialItemSchema = z.object({
  materialId: z.string().min(1, { message: "Debe seleccionar un material." }),
  descripcion: z.string(),
  cantidad: z.number().min(1, { message: "La cantidad debe ser al menos 1." }),
  precioUnitario: z.number(),
});


export const OrderFormSchema = z.object({
  solicitante: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  obra: z.string().min(3, { message: 'El nombre de la obra debe tener al menos 3 caracteres.' }),
  calle: z.string().min(3, { message: 'La calle debe tener al menos 3 caracteres.' }),
  numero: z.string().regex(/^\d+$/, { message: 'El número solo debe contener dígitos.' }).min(1, { message: 'El número es obligatorio.' }),
  codigoPostal: z.string().regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos.' }),
  colonia: z.string().min(3, { message: 'La colonia debe tener al menos 3 caracteres.' }),
  ciudad: z.string().min(1, { message: 'Debe seleccionar una ciudad/municipio.' }),
  estado: z.string().min(1, { message: 'Debe seleccionar un estado.' }),
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
  total: z.number(),
  materiales: z.array(MaterialItemSchema).min(1, { message: "Debe agregar al menos un material." }),
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
})
.refine(data => {
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
    message: "Formato no válido. Solo se aceptan archivos JPG (fotografia) o PDF.",
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
    message: "Formato no válido. Solo se aceptan archivos JPG (fotografia) o PDF.",
    path: ['comprobanteDomicilio'],
});

export type OrderFormData = z.infer<typeof OrderFormSchema>;
export type MaterialItem = z.infer<typeof MaterialItemSchema>;

interface BaseOrder {
  id: string;
  solicitante: string;
  obra: string;
  calle: string;
  numero: string;
  colonia: string;
  codigoPostal: string;
  ciudad: string;
  estado: string;
  tipoPago: z.infer<typeof OrderFormSchema.shape.tipoPago>;
  frecuenciaCredito: z.infer<typeof OrderFormSchema.shape.frecuenciaCredito>;
  metodoPago: z.infer<typeof OrderFormSchema.shape.metodoPago>;
  status: keyof typeof OrderStatus;
  total: number;
  materiales: MaterialItem[];
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

    