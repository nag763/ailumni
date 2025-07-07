'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, token, isLoading, isAuthenticated, signOut } = useCognitoUser();
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log({ isAuthenticated, token });
    if (isAuthenticated && token) {
      fetch(process.env.NEXT_PUBLIC_API_ENDPOINT + 'api/v1/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => {
          console.error(err);
          toast.error('Failed to fetch user data.');
        });
    }
  }, [isAuthenticated, token]);

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
          {userData ? (
            <ul className="list-inside list-disc">
              {Object.entries(userData).map(([key, value]) => (
                <li key={key} className="text-gray-600">
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading user data...</p>
          )}
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
