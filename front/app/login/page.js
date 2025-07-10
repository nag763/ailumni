'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RedirectIfAuthenticated from '@/components/RedirectIfAuthenticated';
import SubmitButton from '@/components/SubmitButton';
import { handleLogin, handleSignUp, handleConfirmSignUp } from '../../actions';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirmingSignUp, setIsConfirmingSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const onLogin = (e) => {
    e.preventDefault();
    handleLogin(router, username, password, setPassword, setIsSubmitting);
  };

  const onSignUp = (e) => {
    e.preventDefault();
    handleSignUp(
      username,
      password,
      email,
      setIsConfirmingSignUp,
      setIsSubmitting,
    );
  };

  const onConfirmSignUp = (e) => {
    e.preventDefault();
    handleConfirmSignUp(
      router,
      username,
      verificationCode,
      setIsConfirmingSignUp,
      setIsSignUp,
      setIsSubmitting,
    );
  };

  return (
    <>
      <RedirectIfAuthenticated />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">
          {isConfirmingSignUp
            ? 'Confirm Your Account'
            : isSignUp
              ? 'Sign Up for Ailumni'
              : 'Login to Ailumni'}
        </h2>
        <form
          onSubmit={
            isConfirmingSignUp ? onConfirmSignUp : isSignUp ? onSignUp : onLogin
          }
          className="w-96 rounded-lg bg-white p-8 shadow-md"
        >
          {!isConfirmingSignUp && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              {isSignUp && (
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              )}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-gray-700"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  className="focus:shadow-outline mb-3 w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {isConfirmingSignUp && (
            <div className="mb-4">
              <label
                htmlFor="verificationCode"
                className="mb-2 block text-sm font-bold text-gray-700"
              >
                Verification Code:
              </label>
              <input
                type="text"
                id="verificationCode"
                className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <SubmitButton
              isSubmitting={isSubmitting}
              buttonText={
                isConfirmingSignUp
                  ? 'Confirm Sign Up'
                  : isSignUp
                    ? 'Sign Up'
                    : 'Sign In'
              }
              submittingText="Processing..."
            />
            {!isConfirmingSignUp && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="inline-block align-baseline text-sm font-bold text-blue-600 hover:text-blue-800"
                disabled={isSubmitting}
              >
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
