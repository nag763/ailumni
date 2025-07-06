'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../cognito-config';
import { toast } from 'react-toastify';

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userPool = new CognitoUserPool(cognitoConfig);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          toast.error(`Error getting session: ${err.message}`);
          router.push('/');
          return;
        }
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            toast.error(`Error getting user attributes: ${err.message}`);
            router.push('/');
            return;
          }
          const userData = attributes.reduce((acc, attr) => {
            acc[attr.getName()] = attr.getValue();
            return acc;
          }, {});
          setUser({ ...userData, username: cognitoUser.username });
        });
      });
    } else {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    const userPool = new CognitoUserPool(cognitoConfig);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      toast.success('Logged out successfully!');
      router.push('/');
    }
  };

  if (!user) {
    return <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">Loading user data...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Welcome, {user.username}!</h2>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Information:</h3>
        <ul className="list-disc list-inside">
          {Object.entries(user).map(([key, value]) => (
            <li key={key} className="text-gray-600"><strong>{key}:</strong> {value}</li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
