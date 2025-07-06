'use client';

import { useState, useEffect } from 'react';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from '../cognito-config';

export function useCognitoUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userPool = new CognitoUserPool(cognitoConfig);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (session) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              console.error('Error getting user attributes:', err);
              setUser(null);
              setIsAuthenticated(false);
            } else {
              const userData = attributes.reduce((acc, attr) => {
                acc[attr.getName()] = attr.getValue();
                return acc;
              }, {});
              setUser({ ...userData, username: cognitoUser.username });
              setIsAuthenticated(true);
            }
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      });
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  const signOut = () => {
    const userPool = new CognitoUserPool(cognitoConfig);
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return { user, isLoading, isAuthenticated, signOut };
}
