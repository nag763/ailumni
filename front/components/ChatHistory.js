'use client';

export default function ChatHistory({ messages }) {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`rounded-lg p-3 ${message.isUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
