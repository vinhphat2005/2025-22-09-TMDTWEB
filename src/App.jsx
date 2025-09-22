import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { useAuthContext } from 'hooks/useAuthContext';
import { useCartContext } from 'hooks/useCartContext';

import ProductProvider from 'context/product/ProductProvider';
import CheckoutProvider from 'context/checkout/CheckoutProvider';
import { AdminPage } from './components/pages';
import { AdminAddProduct } from './components/pages';
import { AdminCollections } from './components/pages';
import { AdminEditProduct } from './components/pages';
import { Layout } from 'components/layouts';
import { ProtectedRoutes } from 'components/routes';

import {
  HomePage,
  AccountPage,
  AddressesPage,
  LoginPage,
  SignUpPage,
  CollectionPage,
  ProductPage,
  CartPage,
  CheckoutPage,
} from './components/pages';

import { Loader } from './components/common';

import './App.scss';
import 'swiper/css';
const App = () => {
  const { authIsReady } = useAuthContext();
  const { cartIsReady } = useCartContext();
  // mode
  // const [isDarkMode, setIsDarkMode] = useState(false);
  // const location = useLocation();
  // const toggleDarkMode = () => {
  //   setIsDarkMode(!isDarkMode);
  // };
  // const themeClass = isDarkMode ? 'dark' : 'light';
  // mode
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      {/* tooggle mode */}
      {/* <div className={`app ${themeClass}`}> */}
      <div className="fonts_license">
        Font made from{' '}
        <a href="http://www.onlinewebfonts.com">oNline Web Fonts</a>is licensed
        by CC BY 3.0
      </div>

      {(!authIsReady || !cartIsReady) && <Loader />}
      {/* <button className='mode' onClick={toggleDarkMode}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button> */}
      {authIsReady && cartIsReady && (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="collections/:id" element={<CollectionPage />} />
            <Route
              path="products/:id"
              element={
                <ProductProvider>
                  <ProductPage />
                </ProductProvider>
              }

            />
            <Route path="cart" element={<CartPage />} />

            <Route element={<ProtectedRoutes needAuth={true} />}>
              <Route
                path="checkout"
                element={
                  <CheckoutProvider>
                    <CheckoutPage />
                  </CheckoutProvider>
                }
              />
              <Route path="account" element={<AccountPage />} />
              <Route path="account/addresses" element={<AddressesPage />} />
            </Route>

            <Route element={<ProtectedRoutes needAuth={false} />}>
              <Route path="account/login" element={<LoginPage />} />
              <Route path="account/signup" element={<SignUpPage />} />
            </Route>

            <Route element={<ProtectedRoutes needAdmin={true} />}>
              <Route path="admin" element={<AdminPage />} />
              <Route path="admin/products" element={<AdminCollections />} />
              <Route path="admin/products/add" element={<AdminAddProduct />} />
              <Route
                path="admin/products/:productId"
                element={<AdminEditProduct />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      )}

      {/* </div > */}
    </>

  );
};

export default App;
