'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  User,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

type AuthCallbacks = {
  onSuccess?: (user: User) => void;
  onError?: (error: any) => void;
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callbacks?: AuthCallbacks): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      callbacks?.onSuccess?.(userCredential.user);
    })
    .catch(error => {
      callbacks?.onError?.(error);
    });
}


/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callbacks?: AuthCallbacks): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        callbacks?.onSuccess?.(userCredential.user);
    })
    .catch(error => {
        callbacks?.onError?.(error);
    });
}
