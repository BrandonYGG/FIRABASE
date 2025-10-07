
'use server';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server-config';
import { OrderFormSchema } from '@/lib/types';
import { z } from 'zod';

export async function createOrderAction(data: unknown) {
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
  
  const { ...orderData } = result.data;

  try {
    const docData = {
      ...orderData,
      fechaMinEntrega: Timestamp.fromDate(orderData.fechaMinEntrega),
      fechaMaxEntrega: Timestamp.fromDate(orderData.fechaMaxEntrega),
      createdAt: Timestamp.now(),
      status: 'Pendiente' as const,
    };
    
    if (docData.tipoPago !== 'Credito') {
      docData.frecuenciaCredito = null;
      docData.metodoPago = null;
    }

    await addDoc(collection(db, 'pedidos'), docData);

    revalidatePath('/pedidos');
    return { success: true, message: 'Pedido creado con éxito.' };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'No se pudo crear el pedido.' };
  }
}
