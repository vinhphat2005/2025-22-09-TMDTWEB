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
    } catch (err) {
      console.error(err);
      setError(handleError(err));
      setIsLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ email });

    try {
      dispatchCartAction({ type: 'IS_LOGIN' });
      const anonymousUser = user;

      const anonymousCartRef = doc(db, 'carts', anonymousUser.uid);
      const anonymousCartDoc = await getDoc(anonymousCartRef);

      await signInWithEmailAndPassword(auth, email, password);

      if (anonymousCartDoc.exists()) {
        deleteDoc(doc(db, 'carts', anonymousUser.uid));
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
