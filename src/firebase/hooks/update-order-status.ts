
'use client';

import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';

// Since this is a client-side utility, we get the firestore instance inside the function.
// This avoids issues with trying to initialize Firebase on the server.

export const updateOrderStatus = async (userId: string, orderId: string, newStatus: string) => {
    // We can't use the useFirestore() hook here as this is not a component.
    // So we initialize firebase and get the instance.
    const { firestore } = initializeFirebase();
    
    if (!userId || !orderId) {
        throw new Error('User ID and Order ID must be provided.');
    }

    const orderRef = doc(firestore, 'users', userId, 'pedidos', orderId);

    try {
        await updateDoc(orderRef, {
            status: newStatus,
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        
        // Create and emit a contextual error for permission issues
        const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: { status: newStatus },
        });
        errorEmitter.emit('permission-error', permissionError);

        // Re-throw the original error to be caught by the caller
        throw error;
    }
};
