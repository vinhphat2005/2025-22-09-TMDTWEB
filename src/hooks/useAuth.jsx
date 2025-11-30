import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification, // Import sendEmailVerification
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth } from 'db/config';
import { db } from 'db/config';
import { useAuthContext } from './useAuthContext';
import { useCartContext } from './useCartContext';
import { handleError } from 'helpers/error/handleError';

export const useAuth = () => {
  const { user, dispatch: dispatchAuthAction } = useAuthContext();
  const { dispatch: dispatchCartAction } = useCartContext();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValue, setDefaultValue] = useState(false);

  const signUp = async ({ name, lastName, email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ name, lastName, email });

    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Send a verification email to the user
      await sendEmailVerification(user);

      const userData = {
        name,
        lastName,
        email,
        phoneNumber: null,
        addresses: [],
        isVerified: false, // Set isVerified to false initially
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      dispatchAuthAction({ type: 'LOGIN', payload: { user, ...userData } });
      
      setIsLoading(false);
      
      return { success: true, message: 'Account created! Please check your email to verify.' };
    } catch (err) {
      console.error(err);
      setError(handleError(err));
      setIsLoading(false);
      return { success: false };
    }
  };

  const login = async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ email });

    try {
      dispatchCartAction({ type: 'IS_LOGIN' });
      
      // Only try to get anonymous cart if user exists (was previously anonymous)
      if (user && user.uid) {
        const anonymousCartRef = doc(db, 'carts', user.uid);
        const anonymousCartDoc = await getDoc(anonymousCartRef);

        await signInWithEmailAndPassword(auth, email, password);

        if (anonymousCartDoc.exists()) {
          deleteDoc(doc(db, 'carts', user.uid));
        }
      } else {
        // No anonymous user, just sign in directly
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError(handleError(err));
      dispatchCartAction({ type: 'IS_NOT_LOGIN' });
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signOut(auth);
      dispatchCartAction({ type: 'DELETE_CART' });
      dispatchAuthAction({ type: 'LOGOUT' });
    } catch (err) {
      console.error(err);
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  return { signUp, login, logout, isLoading, error, defaultValue };
};
