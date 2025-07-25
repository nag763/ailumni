'use client';

import { useState, useEffect } from 'react';
import { useCognitoUser } from '@/hooks/useCognitoUser';

import fetchAPI from '@/lib/fetchAPI';
import { toast } from 'react-toastify';

async function listFiles(token, itemId, setFiles) {
  try {
    const data = await fetchAPI('GET', `/api/v1/user/entries/${itemId}/files`, null, token);
    setFiles(data);
  } catch (error) {
    // Error is already handled by fetchAPI
  }
}

async function getUploadUrl(token, itemId, fileName) {
  try {
    const data = await fetchAPI('GET', `/api/v1/user/entries/${itemId}/upload-url?fileName=${fileName}`, null, token);
    return data.url;
  } catch (error) {
    // Error is already handled by fetchAPI
  }
}

async function uploadFile(url, file) {
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
}

async function deleteFile(token, itemId, fileName) {
  try {
    await fetchAPI('DELETE', `/api/v1/user/entries/${itemId}/files?fileName=${fileName}`, null, token);
    return true;
  } catch (error) {
    // Error is already handled by fetchAPI
    return false;
  }
}

export default function FileManager({ itemId }) {
  const { token } = useCognitoUser();
  const [files, setFiles] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);

  useEffect(() => {
    if (token && itemId) {
      listFiles(token, itemId, setFiles);
    }
  }, [token, itemId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const uploadUrl = await getUploadUrl(token, itemId, fileToUpload.name);
    await uploadFile(uploadUrl, fileToUpload);
    setFileToUpload(null);
    listFiles(token, itemId, setFiles);
  };

  return (
    <div className="mt-10 bg-white rounded-xl  p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center gap-2">
        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
        </svg>
        File Manager
      </h3>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center  gap-3">
        <input
          type="file"
          onChange={handleFileChange}
          className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          onClick={handleUpload}
          disabled={!fileToUpload}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:bg-gray-400 transition-colors font-semibold shadow"
        >
          {fileToUpload ? `Upload "${fileToUpload.name}"` : 'Upload'}
        </button>
        {fileToUpload && (
          <span className="text-sm text-gray-500 ml-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
            </svg>
            {fileToUpload.name} ({Math.round(fileToUpload.size / 1024)} KB)
            <button
              onClick={() => setFileToUpload(null)}
              className="ml-2 text-red-500 hover:underline"
              title="Clear selection"
            >
              ✕
            </button>
          </span>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        {files?.length === 0 ? (
          <div className="text-gray-400 italic flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            No files uploaded yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {files?.map((file) => (
              <li key={file.key} className="flex justify-between items-center py-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-6 h-6 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16V4a2 2 0 012-2h8l6 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
                  </svg>
                  <span className="truncate max-w-xs font-medium text-gray-800" title={file.key}>{file.key}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-sm">{Math.round(file.size / 1024)} KB</span>
                  <button
                    onClick={async () => {
                      if (await deleteFile(token, itemId, file.key)) {
                        toast.info(`File "${file.key}" deleted successfully.`);
                        listFiles(token, itemId, setFiles);
                      }
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors shadow group-hover:scale-105"
                    title={`Delete ${file.key}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
