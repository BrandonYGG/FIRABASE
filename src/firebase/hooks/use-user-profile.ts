'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';

interface UserProfile {
    fullName?: string;
    companyName?: string;
    email: string;
    role: 'personal' | 'company';
}

export function useUserProfile(userId: string | undefined) {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const uid = userId || user?.uid;

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !uid) return null;
    return doc(firestore, 'users', uid);
  }, [firestore, uid]);

  const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userProfileRef);

  return { userProfile, loading: isLoading, error };
}