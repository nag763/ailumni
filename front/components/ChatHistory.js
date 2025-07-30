'use client';

export default function ChatHistory({ messages, isResponding }) {
  return (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div key={index} className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`rounded-lg p-3 ${message.isUser ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
      {isResponding && (
        <div className="mb-4 flex justify-start">
          <div className="rounded-lg bg-gray-200 p-3 text-gray-800">
            <div className="flex items-center justify-center">
              <span className="animate-pulse rounded-full bg-gray-400 w-2 h-2 mr-1"></span>
              <span style={{ animationDelay: '0.1s' }} className="animate-pulse rounded-full bg-gray-400 w-2 h-2 mr-1"></span>
              <span style={{ animationDelay: '0.2s' }} className="animate-pulse rounded-full bg-gray-400 w-2 h-2"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}