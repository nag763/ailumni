'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCognitoUser } from '../hooks/useCognitoUser';
import { toast } from 'react-toastify';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useCognitoUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.warn('You need to authenticate in order to access this page')
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return null; // Or a loading spinner, or a message
  }

  return <>{children}</>;
}
