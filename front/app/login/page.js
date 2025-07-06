"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from "amazon-cognito-identity-js";
import cognitoConfig from "../../cognito-config";
import { toast } from "react-toastify";
import RedirectIfAuthenticated from "@/components/RedirectIfAuthenticated";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
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
        toast.success("Login successful!");
        setIsSubmitting(false);
        router.push("/auth");
      },
      onFailure: (err) => {
        toast.error(`Login failed: ${err.message}`);
        setIsSubmitting(false);
        setPassword("");
      },
    });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const attributeList = [];
    attributeList.push({
      Name: "email",
      Value: email,
    });

    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        toast.error(`Sign up failed: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
      toast.success(
        "Sign up successful! Please check your email for the verification code."
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
      toast.success("Account confirmed successfully! You can now log in.");
      setIsConfirmingSignUp(false);
      setIsSignUp(false); // Switch back to login form
      router.push("/auth");
      setIsSubmitting(false);
    });
  };

  return (
    <>
    <RedirectIfAuthenticated/>
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          {isConfirmingSignUp
            ? "Confirm Your Account"
            : isSignUp
            ? "Sign Up for Ailumni"
            : "Login to Ailumni"}
        </h2>
        <form
          onSubmit={
            isConfirmingSignUp
              ? handleConfirmSignUp
              : isSignUp
              ? handleSignUp
              : handleLogin
          }
          className="bg-white p-8 rounded-lg shadow-md w-96"
        >
          {!isConfirmingSignUp && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Password:
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
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
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Verification Code:
              </label>
              <input
                type="text"
                id="verificationCode"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isConfirmingSignUp
                ? "Confirm Sign Up"
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </button>
            {!isConfirmingSignUp && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800"
                disabled={isSubmitting}
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
