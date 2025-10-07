
'use server';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server-config';
import { OrderFormSchema } from '@/lib/types';

export async function createOrderAction(data: unknown) {
  const result = OrderFormSchema.safeParse(data);

  if (!result.success) {
    let formattedErrors = {};
    result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if(!formattedErrors[path]){
            formattedErrors[path] = issue.message;
        }
    });
    return { success: false, errors: formattedErrors };
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
