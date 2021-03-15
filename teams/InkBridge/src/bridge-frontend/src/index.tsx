import React from 'react';
import ReactDOM from 'react-dom';
import { AccountProvider } from './core/context/account';
import { ApiProvider } from './core/context/api';
import './index.css';
import App from './pages/app/app';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <ApiProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </ApiProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
