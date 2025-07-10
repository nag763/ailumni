'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { useRouter } from 'next/navigation';
import {
  handleLogout,
  handleCreateEntry,
  fetchEntries,
  deleteEntry,
} from '../../actions';

export default function AuthPage() {
  const { user, token, isLoading, isAuthenticated, signOut } = useCognitoUser();
  const [newEntryLabel, setNewEntryLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [entries, setEntries] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchEntries(token, setEntries);
    }
  }, [token]);

  const onLogout = () => {
    handleLogout(router, signOut);
  };

  const onCreateEntry = async () => {
    const newEntry = await handleCreateEntry(
      newEntryLabel,
      token,
      setNewEntryLabel,
    );
    if (newEntry) {
      router.push(`/auth/${newEntry.item_id}`);
    }
    setIsCreating(false);
    fetchEntries(token, setEntries);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewEntryLabel('');
  };

  const handleDeleteEntry = async (itemId) => {
    await deleteEntry(itemId, token);
    fetchEntries(token, setEntries);
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
      <div className="flex min-h-screen flex-col items-start bg-gray-50 p-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome, {user.username}!
            </h2>
            <button
              onClick={onLogout}
              className="focus:shadow-outline rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {!isCreating ? (
              <div
                onClick={() => setIsCreating(true)}
                className="flex h-48 w-full cursor-pointer items-center justify-center rounded-lg bg-white p-8 shadow-md transition-colors hover:bg-gray-100"
              >
                <span className="text-8xl font-light text-gray-300">+</span>
              </div>
            ) : (
              <div className="h-auto w-full rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">
                  New Entry
                </h3>
                <input
                  type="text"
                  placeholder="Entry Label"
                  className="mb-4 w-full rounded border border-gray-300 p-2"
                  value={newEntryLabel}
                  onChange={(e) => setNewEntryLabel(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelCreate}
                    className="focus:shadow-outline rounded bg-gray-300 px-4 py-2 font-bold text-gray-700 hover:bg-gray-400 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onCreateEntry}
                    className="focus:shadow-outline rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
            {entries &&
              entries.map((entry) => (
                <div
                  key={entry.item_id}
                  className="relative h-48 w-full cursor-pointer rounded-lg bg-white p-6 shadow-md transition-colors hover:bg-gray-100"
                  onClick={() => router.push(`/auth/${entry.item_id}`)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.item_id);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    {entry.label}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {entry.item_id.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
