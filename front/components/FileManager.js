'use client';

import { useState, useEffect } from 'react';
import { useCognitoUser } from '@/hooks/useCognitoUser';

import fetchAPI from '@/lib/fetchAPI';

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
    setFileToUpload(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const uploadUrl = await getUploadUrl(token, itemId, fileToUpload.name);
    await uploadFile(uploadUrl, fileToUpload);
    setFileToUpload(null);
    listFiles(token, itemId, setFiles);
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Files</h3>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!fileToUpload} className="bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">
          Upload
        </button>
      </div>
      <ul>
        {files?.map((file) => (
          <li key={file.key} className="flex justify-between items-center p-2 border-b">
            <span>{file.key}</span>
            <span>{Math.round(file.size / 1024)} KB</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
