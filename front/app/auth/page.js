'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, token, isLoading, isAuthenticated, signOut } = useCognitoUser();
  const [userData, setUserData] = useState(null);
  const [newEntryLabel, setNewEntryLabel] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch(process.env.API_ENDPOINT + 'api/v1/user/entries', {
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

  const handleCreateEntry = () => {
    if (!newEntryLabel) {
      toast.error('Entry label cannot be empty.');
      return;
    }

    const endpoint = process.env.API_ENDPOINT;
    if(!endpoint) {
      throw new Error("API_ENDPOINT is not defined")
    }

    fetch(process.env.API_ENDPOINT + 'api/v1/user/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ label: newEntryLabel }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          toast.success(data.message);
          setNewEntryLabel('');
        } else if (data.error) {
          toast.error(data.error);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to create entry.');
      });
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
            onClick={handleCreateEntry}
            className="focus:shadow-outline rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          >
            Create Entry
          </button>
        </div>
      </div>
    </AuthGuard>
  );
}
