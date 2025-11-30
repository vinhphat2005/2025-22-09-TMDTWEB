import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { useAuthContext } from 'hooks/useAuthContext';
import { useCartContext } from 'hooks/useCartContext';

const ProtectedRoutes = ({ needAuth, needAdmin }) => {
  const { user, isAdmin } = useAuthContext();
  const { cartIsReady } = useCartContext();
  const { pathname, state } = useLocation();

  if (needAdmin) {
    if (isAdmin) {
      return <Outlet />;
    }

    if (!isAdmin) {
      return <Navigate to="/" />;
    }
  }

  if (needAuth) {
    if (user && cartIsReady) {
      return <Outlet />;
    }

    if (!user && cartIsReady) {
      return <Navigate to="/account/login" state={pathname} />;
    }
  }

  if (!needAuth) {
    if (!user && cartIsReady) {
      return <Outlet />;
    }

    if (user && cartIsReady) {
      if (state === '/checkout') {
        return <Navigate to={state} />;
      } else if (state === '/account') {
        return <Navigate to={state} />;
      }
      return <Navigate to="/" />;
    }
  }

  return <Navigate to="/" />;
};

export default ProtectedRoutes;
