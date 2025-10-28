'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` ensures that `initializeFirebase` is called only once per component lifecycle.
  // This is crucial for preventing re-initializations on re-renders.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); // The empty dependency array guarantees this runs only on mount.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
