'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '../../components/AuthGuard';
import { useCognitoUser } from '../../hooks/useCognitoUser';
import { useRouter } from 'next/navigation';
import { handleLogout, handleCreateEntry, fetchEntries } from '../../actions';

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
    await handleCreateEntry(newEntryLabel, token, setNewEntryLabel);
    setIsCreating(false);
    fetchEntries(token, setEntries);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewEntryLabel('');
  };

  const handleDeleteEntry = (itemId) => {
    console.log(`TODO: Implement deletion for item ${itemId}`);
    // After implementing delete in actions.js and backend:
    // await handleDeleteEntry(itemId, token);
    // fetchEntries(token, setEntries);
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
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {!isCreating ? (
              <div
                onClick={() => setIsCreating(true)}
                className="flex items-center justify-center w-full h-48 rounded-lg bg-white p-8 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span className="text-8xl text-gray-300 font-light">+</span>
              </div>
            ) : (
              <div className="w-full h-auto rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-700">New Entry</h3>
                <input
                  type="text"
                  placeholder="Entry Label"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
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
            {entries && entries.map(entry => (
              <div key={entry.item_id} className="relative w-full h-48 rounded-lg bg-white p-6 shadow-md">
                <button
                  onClick={() => handleDeleteEntry(entry.item_id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{entry.label}</h3>
                <p className="text-sm text-gray-500">ID: {entry.item_id.substring(0,8)}...</p>
                <p className="text-sm text-gray-500">Created: {new Date(entry.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
