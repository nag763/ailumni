'use client';

import { useEffect, useState } from 'react';
import { useCognitoUser } from '@/hooks/useCognitoUser';
import { fetchEntry } from '@/actions';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileManager from '@/components/FileManager';
import { callAgent } from '@/actions';
import ChatHistory from '@/components/ChatHistory';
import ChatInput from '@/components/ChatInput';
import { useRouter } from 'next/navigation';

export default function ItemDetailsPage() {
  const { token } = useCognitoUser();
  const [entry, setEntry] = useState(null);
  const { itemId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    if (token && itemId) {
      fetchEntry(token, itemId, setEntry);
    }
  }, [token, itemId]);

  const handleSendMessage = async (message) => {
    setMessages((prevMessages) => [...prevMessages, { text: message, isUser: true }]);
    setIsResponding(true);
    const response = await callAgent(token, message, itemId);
    setMessages((prevMessages) => [...prevMessages, { text: response.message, isUser: false }]);
    setIsResponding(false);
  };

  const router = useRouter();

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
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
          </div>
          <ChatHistory messages={messages} />
          <ChatInput onSendMessage={handleSendMessage} disabled={isResponding} />
        </div>
      </div>
    </div>
  );
}