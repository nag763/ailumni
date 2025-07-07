'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import cognitoConfig from '../../cognito-config';
import { toast } from 'react-toastify';
import RedirectIfAuthenticated from '@/components/RedirectIfAuthenticated';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirmingSignUp, setIsConfirmingSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const userPool = new CognitoUserPool(cognitoConfig);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        toast.success('Login successful!');
        setIsSubmitting(false);
        router.push('/auth');
      },
      onFailure: (err) => {
        toast.error(`Login failed: ${err.message}`);
        setIsSubmitting(false);
        setPassword('');
      },
    });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const attributeList = [];
    attributeList.push({
      Name: 'email',
      Value: email,
    });

    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        toast.error(`Sign up failed: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
      toast.success(
        'Sign up successful! Please check your email for the verification code.',
      );
      setIsConfirmingSignUp(true);
      setIsSubmitting(false);
    });
  };

  const handleConfirmSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) {
        toast.error(`Verification failed: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
      toast.success('Account confirmed successfully! You can now log in.');
      setIsConfirmingSignUp(false);
      setIsSignUp(false); // Switch back to login form
      router.push('/login');
      setIsSubmitting(false);
    });
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
            isConfirmingSignUp
              ? handleConfirmSignUp
              : isSignUp
                ? handleSignUp
                : handleLogin
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
            <button
              type="submit"
              className="focus:shadow-outline rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
                  Processing...
                </div>
              ) : isConfirmingSignUp ? (
                'Confirm Sign Up'
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Sign In'
              )}
            </button>
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
