'use client';

import { useEffect, useState } from 'react';
import { useCognitoUser } from '../../../hooks/useCognitoUser';
import { fetchEntry } from '../../../actions';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import FileManager from '../../../components/FileManager';
import { useRouter } from 'next/navigation';

export default function ItemDetailsPage() {
  const { token } = useCognitoUser();
  const [entry, setEntry] = useState(null);
  const { itemId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (token && itemId) {
      fetchEntry(token, itemId, setEntry);
    }
  }, [token, itemId]);

  if (!entry) {
    return <LoadingSpinner message="Fetching item details..." />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel: Documents */}
      <div className="flex w-1/3 flex-col border-r border-gray-200 bg-white">
        <button className="px-4 py-2 text-sm text-gray-600 bg-gray-700 text-white hover:text-gray-200" onClick={() => router.push('/auth')}>
          Go back
        </button>
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            {entry.label}
          </h2>
          <p className="mb-1 text-sm text-gray-600">ID: {entry.item_id}</p>
          <p className="text-sm text-gray-600">
            Created At: {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex-grow overflow-y-auto">
          <FileManager itemId={itemId} />
        </div>
      </div>

      {/* Right Panel: Chat Interface */}
      <div className="flex w-2/3 flex-col">
        <div className="flex-grow p-6">
          <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
            </div>
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4">
              <div className="mb-4 flex justify-start">
                <div className="rounded-lg bg-gray-200 p-3">
                  <p className="text-sm text-gray-800">
                    Hello! How can I help you today?
                  </p>
                </div>
              </div>
              <div className="mb-4 flex justify-end">
                <div className="rounded-lg bg-indigo-500 p-3 text-white">
                  <p className="text-sm">
                    I have a question about this document.
                  </p>
                </div>
              </div>
              {/* More messages can be added here */}
            </div>
            {/* Chat Input */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full rounded-full border-gray-300 py-2 pl-4 pr-10 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
