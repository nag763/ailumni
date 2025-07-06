'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCognitoUser } from '../hooks/useCognitoUser';

export default function RedirectIfAuthenticated() {
  const { isAuthenticated, isLoading } = useCognitoUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
