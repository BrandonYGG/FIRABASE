
'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';

interface UserProfile {
    fullName?: string;
    companyName?: string;
    email: string;
    role: 'personal' | 'company';
    // other fields if they exist
}

export function useUserProfile(userId: string | undefined) {
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile, isLoading, error } = useDoc<UserProfile>(userProfileRef);

  return { userProfile, loading: isLoading, error };
}
