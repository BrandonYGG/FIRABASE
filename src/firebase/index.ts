'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { useMemo, type DependencyList } from 'react';

// This function is memoized by the caller, so we don't need to memoize it here.
function getSdks(firebaseApp: FirebaseApp): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}


/**
 * Initializes and returns Firebase services.
 * It ensures that Firebase is initialized only once.
 * It is NOT a hook and can be called outside of a React component.
 * @returns An object containing the Firebase app, auth, and firestore instances.
 */
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (getApps().length === 0) {
    // If no app is initialized, initialize one.
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  // If an app is already initialized, use it.
  return getSdks(getApp());
}


// Export hooks and providers
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Custom hook to memoize Firebase queries
type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | MemoFirebase<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);

  if (typeof memoized !== 'object' || memoized === null) return memoized;

  (memoized as MemoFirebase<T>).__memo = true;

  return memoized;
}
