
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import cognitoConfig from './cognito-config';
import { toast } from 'react-toastify';
import fetchAPI from './lib/fetchAPI';

const userPool = new CognitoUserPool(cognitoConfig);

export const handleLogin = (router, username, password, setPassword, setIsSubmitting) => {
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
    onSuccess: () => {
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

export const handleSignUp = (username, password, email, setIsConfirmingSignUp, setIsSubmitting) => {
  setIsSubmitting(true);

  const attributeList = [];
  attributeList.push({
    Name: 'email',
    Value: email,
  });

  userPool.signUp(username, password, attributeList, null, (err) => {
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

export const handleConfirmSignUp = (router, username, verificationCode, setIsConfirmingSignUp, setIsSignUp, setIsSubmitting) => {
  setIsSubmitting(true);

  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  cognitoUser.confirmRegistration(verificationCode, true, (err) => {
    if (err) {
      toast.error(`Verification failed: ${err.message}`);
      setIsSubmitting(false);
      return;
    }
    toast.success('Account confirmed successfully! You can now log in.');
    setIsConfirmingSignUp(false);
    setIsSignUp(false);
    router.push('/login');
    setIsSubmitting(false);
  });
};

export const handleLogout = (router, signOut) => {
  signOut();
  toast.success('Logged out successfully!');
  router.push('/');
};

export const handleCreateEntry = async (label, token, setNewLabel) => {
  try {
    const newEntry = await fetchAPI('POST', '/api/v1/user/entries', { label }, token);
    setNewLabel('');
    toast.success('Entry created successfully!');
    return newEntry;
  } catch (error) {
    // Error is already handled by fetchAPI
  }
};

export const deleteEntry = async (itemId, token) => {
  try {
    await fetchAPI('DELETE', `/api/v1/user/entries/${itemId}`, null, token);
    toast.success('Entry deleted successfully!');
  } catch (error) {
    // Error is already handled by fetchAPI
  }
};

export const fetchEntries = (token, setEntries, setIsLoading) => {
  setIsLoading(true);
  fetchAPI('GET', 'api/v1/user/entries', null, token)
    .then((data) => setEntries(data))
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export const fetchEntry = (token, itemId, setEntry) => {
  fetchAPI('GET', `api/v1/user/entries/${itemId}`, null, token)
    .then((data) => setEntry(data))
    .catch((err) => {
      console.error(err);
    });
};

export const callAgent = async (token, message, itemId) => {
  if (!token || !itemId) return;

  const data = {
    session_id: itemId,
    message: message,
  }

  try {
    const response = await fetchAPI('POST', '/api/v1/agent', data, token);
    return response;
  } catch (error) {
    console.error("Failed to call agent:", error);
    throw error;
  }
};