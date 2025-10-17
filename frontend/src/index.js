import React from 'react';
import ReactDOM from 'react-dom/client';
import "../src/index.css"
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import UserProvider from './Contexts/UserContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);


