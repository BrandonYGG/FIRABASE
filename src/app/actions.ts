
'use server';

import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase/server-config';
import { OrderFormSchema } from '@/lib/types';
import { z } from 'zod';
import Stripe from 'stripe';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createPaymentIntentAction(amount: number) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects the amount in cents
            currency: 'mxn',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return { success: true, clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return { success: false, message: 'No se pudo iniciar el proceso de pago.' };
    }
}


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
    
    // Clear credit-specific fields if payment is not credit
    if (docData.tipoPago === 'Credito') {
      docData.metodoPago = null;
    } else if (docData.tipoPago === 'Efectivo') {
        docData.metodoPago = null;
        docData.frecuenciaCredito = null;
    }

    await addDoc(collection(db, 'pedidos'), docData);

    revalidatePath('/pedidos');
    return { success: true, message: 'Pedido creado con éxito.' };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'No se pudo crear el pedido.' };
  }
}

    