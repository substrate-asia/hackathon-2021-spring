import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import App from './pages/App';
import reportWebVitals from './reportWebVitals';
import { GlobalStyle } from './components/Theme/GlobalStyle'

import './i18n';
import { ApiProvider } from './components/Provider/ApiProvider';
import { ExtensionProvider } from './components/Provider/ExtensionProvider';

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <Suspense fallback={null}>
      <ApiProvider>
        <ExtensionProvider>
          <App />
        </ExtensionProvider>
      </ApiProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
