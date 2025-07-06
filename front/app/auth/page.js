'use client'

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
    return <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">Loading user data...</div>;
  }

  return (
    <AuthGuard>

    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user.username}!</h2>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Information:</h3>
        <ul className="list-disc list-inside">
          {Object.entries(user).map(([key, value]) => (
            <li key={key} className="text-gray-600"><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
      </div>
    </AuthGuard>
  );
}
