'use client'
import { OrderForm } from '@/components/orders/order-form';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function NuevoPedidoPage() {

  return (
    <div>
        <Elements stripe={stripePromise} options={{
             fonts: [
                {
                    cssSrc: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap',
                }
             ]
        }}>
            <OrderForm />
        </Elements>
    </div>
  );
}
