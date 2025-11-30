import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Provider from 'context/Provider';

import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <HelmetProvider>
    <Router>
      <Provider>
        <App />
      </Provider>
    </Router>
  </HelmetProvider>
  // </React.StrictMode>
);
