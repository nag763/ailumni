'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { useRouter } from 'next/navigation';
import { handleLogout, handleCreateEntry, fetchUserData } from '../../actions';

export default function AuthPage() {
  const { user, token, isLoading, isAuthenticated, signOut } = useCognitoUser();
  const [userData, setUserData] = useState(null);
  const [newEntryLabel, setNewEntryLabel] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserData(token, setUserData);
    }
  }, [isAuthenticated, token]);

  const onLogout = () => {
    handleLogout(router, signOut);
  };

  const onCreateEntry = () => {
    handleCreateEntry(newEntryLabel, token, setNewEntryLabel);
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
            onClick={onLogout}
            className="focus:shadow-outline mt-8 rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
          >
            Logout
          </button>
        </div>
        <div className="w-96 rounded-lg bg-white p-8 shadow-md mt-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Create New Entry:</h3>
          <input
            type="text"
            placeholder="Entry Label"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            value={newEntryLabel}
            onChange={(e) => setNewEntryLabel(e.target.value)}
          />
          <button
            onClick={onCreateEntry}
            className="focus:shadow-outline rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Create Entry
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
