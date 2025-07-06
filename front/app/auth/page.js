'use client';

import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, isLoading, isAuthenticated, signOut } = useCognitoUser();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    toast.success('Logged out successfully!');
    router.push('/');
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        Loading user data...
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          Welcome, {user.username}!
        </h2>
        <div className="w-96 rounded-lg bg-white p-8 shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">
            Your Information:
          </h3>
          <ul className="list-inside list-disc">
            {Object.entries(user).map(([key, value]) => (
              <li key={key} className="text-gray-600">
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="focus:shadow-outline mt-8 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
          >
            Logout
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
