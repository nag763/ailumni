'use client';

import { useEffect, useState } from 'react';
import { useCognitoUser } from '../../../hooks/useCognitoUser';
import { fetchEntry } from '../../../actions';
import { useParams } from 'next/navigation';

export default function ItemDetailsPage() {
  const { token } = useCognitoUser();
  const [entry, setEntry] = useState(null);
  const { itemId } = useParams();

  useEffect(() => {
    if (token && itemId) {
      fetchEntry(token, itemId, setEntry);
    }
  }, [token, itemId]);

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="flex items-center text-lg text-gray-700">
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
          Fetching item details...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-start bg-gray-50 p-8">
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="mb-4 text-3xl font-bold text-gray-800">{entry.label}</h2>
        <p className="mb-2 text-lg text-gray-600">ID: {entry.item_id}</p>
        <p className="text-lg text-gray-600">
          Created At: {new Date(entry.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
