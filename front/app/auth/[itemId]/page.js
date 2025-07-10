'use client';

import { useEffect, useState } from 'react';
import { useCognitoUser } from '../../../hooks/useCognitoUser';
import { fetchEntry } from '../../../actions';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../../../components/LoadingSpinner';

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
    return <LoadingSpinner message="Fetching item details..." />;
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
