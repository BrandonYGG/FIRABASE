
'use server';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server-config';
import { OrderFormSchema, type Order } from '@/lib/types';
import 'dotenv/config';

export async function createOrderAction(data: unknown) {
  // Exclude file fields before parsing
  const dataWithoutFiles = { ... (data as object) };
  delete (dataWithoutFiles as any).ine;
  delete (dataWithoutFiles as any).comprobanteDomicilio;
  
  const result = OrderFormSchema.safeParse(dataWithoutFiles);

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

  try {
    const docData = {
      ...orderData,
      fechaMinEntrega: Timestamp.fromDate(orderData.fechaMinEntrega),
      fechaMaxEntrega: Timestamp.fromDate(orderData.fechaMaxEntrega),
      createdAt: Timestamp.now(),
      status: 'Pendiente' as const,
    };
    
    // Clear credit-specific fields if payment is not credit
    if (docData.tipoPago === 'Credito') {
      docData.metodoPago = null;
    } else if (docData.tipoPago === 'Efectivo') {
        docData.metodoPago = null;
        docData.frecuenciaCredito = null;
    }

    const docRef = await addDoc(collection(db, 'pedidos'), docData);
    
    // Build a serializable order object to return to the client
    const newOrder: Omit<Order, 'fechaMinEntrega' | 'fechaMaxEntrega' | 'createdAt'> & { fechaMinEntrega: string; fechaMaxEntrega: string; createdAt: string; } = {
        id: docRef.id,
        solicitante: orderData.solicitante,
        obra: orderData.obra,
        calle: orderData.calle,
        numero: orderData.numero,
        colonia: orderData.colonia,
        codigoPostal: orderData.codigoPostal,
        ciudad: orderData.ciudad,
        estado: orderData.estado,
        tipoPago: orderData.tipoPago,
        frecuenciaCredito: orderData.frecuenciaCredito,
        metodoPago: orderData.metodoPago,
        total: orderData.total,
        materiales: orderData.materiales,
        fechaMinEntrega: orderData.fechaMinEntrega.toISOString(),
        fechaMaxEntrega: orderData.fechaMaxEntrega.toISOString(),
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
