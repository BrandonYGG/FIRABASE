
'use server';

import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { OrderFormSchema, type Order, type OrderFormData } from '@/lib/types';
import 'dotenv/config';

// Initialize Firebase Admin SDK
let app: App;
if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    app = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    });
  } else {
    // Fallback for local development if needed, though service account key is preferred
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set. Some server-side Firebase operations might fail.");
    app = initializeApp();
  }
} else {
  app = getApps()[0];
}

const db = getFirestore(app);


export async function createOrderAction(data: OrderFormData, userId: string) {
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
        userId: userId, // Add the user ID to the order
        fechaMinEntrega: Timestamp.fromDate(serializableData.fechaMinEntrega),
        fechaMaxEntrega: Timestamp.fromDate(serializableData.fechaMaxEntrega),
        createdAt: FieldValue.serverTimestamp(),
        status: 'Pendiente' as const,
    };
    
    const docRef = await db.collection('pedidos').add(docData);
    
    // For the response, we can't send back a server-side Timestamp object directly
    // We will use ISO strings as a serializable format.
    const newOrderForClient = {
        id: docRef.id,
        ...serializableData,
        userId: userId,
        fechaMinEntrega: serializableData.fechaMinEntrega.toISOString(),
        fechaMaxEntrega: serializableData.fechaMaxEntrega.toISOString(),
        createdAt: new Date().toISOString(), // Approximate, client will get actual from Firestore listener
        status: docData.status,
    };

    revalidatePath('/pedidos');
    return { success: true, message: 'Pedido creado con éxito.', order: newOrderForClient };
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof Error) {
       return { success: false, message: `No se pudo crear el pedido: ${error.message}` };
    }
    return { success: false, message: 'No se pudo crear el pedido. Ocurrió un error desconocido.' };
  }
}
