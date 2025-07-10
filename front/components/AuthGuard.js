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
      toast.warn('You need to authenticate in order to access this page');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="flex items-center text-gray-700 text-lg">
          <svg
            className="mr-3 -ml-1 h-5 w-5 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Verifying authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Or a loading spinner, or a message
  }

  return <>{children}</>;
}
