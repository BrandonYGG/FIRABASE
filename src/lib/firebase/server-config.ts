import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: FirebaseApp;
let db: Firestore;

// Initialize Firebase for server-side
if (typeof window === 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
} else {
    // This part is for client-side, but server-config should ideally not be used on the client.
    // In a universal component, this might be necessary.
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    db = getFirestore(app);
}


export { app, db };
