
'use server';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server-config';
import { OrderFormSchema, type Order, type OrderFormData, type MaterialItem } from '@/lib/types';
import 'dotenv/config';

export async function createOrderAction(data: OrderFormData) {
  const result = OrderFormSchema.safeParse(data);

  if (!result.success) {
    let formattedErrors: { path: (string | number)[]; message: string }[] = [];
    result.error.issues.forEach(issue => {
        formattedErrors.push({
            path: issue.path,
            message: issue.message
        });
    });
    return { success: false, errors: formattedErrors, message: "Por favor revise los campos del formulario." };
  }
  
  const orderData = result.data;
  
  // Exclude file inputs before sending to server action
  const { ine, comprobanteDomicilio, ...serializableData } = orderData;

  try {
    const docData = {
        ...serializableData,
        fechaMinEntrega: Timestamp.fromDate(serializableData.fechaMinEntrega),
        fechaMaxEntrega: Timestamp.fromDate(serializableData.fechaMaxEntrega),
        createdAt: Timestamp.now(),
        status: 'Pendiente' as const,
    };
    
    const docRef = await addDoc(collection(db, 'pedidos'), docData);
    
    const newOrder: Omit<Order, 'fechaMinEntrega' | 'fechaMaxEntrega' | 'createdAt'> & { fechaMinEntrega: string; fechaMaxEntrega: string; createdAt: string; } = {
        id: docRef.id,
        solicitante: serializableData.solicitante,
        obra: serializableData.obra,
        calle: serializableData.calle,
        numero: serializableData.numero,
        colonia: serializableData.colonia,
        codigoPostal: serializableData.codigoPostal,
        ciudad: serializableData.ciudad,
        estado: serializableData.estado,
        tipoPago: serializableData.tipoPago,
        frecuenciaCredito: serializableData.frecuenciaCredito,
        metodoPago: serializableData.metodoPago,
        total: serializableData.total,
        materiales: serializableData.materiales,
        fechaMinEntrega: serializableData.fechaMinEntrega.toISOString(),
        fechaMaxEntrega: serializableData.fechaMaxEntrega.toISOString(),
        createdAt: docData.createdAt.toDate().toISOString(),
        status: docData.status,
    };

    revalidatePath('/pedidos');
    return { success: true, message: 'Pedido creado con éxito.', order: newOrder };
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
       return { success: false, message: `No se pudo crear el pedido: ${error.message}` };
    }
    return { success: false, message: 'No se pudo crear el pedido. Ocurrió un error desconocido.' };
  }
}
