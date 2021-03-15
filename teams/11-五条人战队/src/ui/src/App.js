import React, { Fragment, Suspense } from 'react'

import './App.css';
import { SubstrateContextProvider, AccountsContextProvider } from './substrate-lib';
import Routers from './router';
import { BrowserRouter } from 'react-router-dom';

const LoadingMessage = () => ("I'm loading...");

function Main() {
  return (
    <div className="App">
      <Fragment>
        <Suspense fallback={<LoadingMessage />} maxDuration={500}>
          <BrowserRouter>
            <Routers />
          </BrowserRouter>
        </Suspense>
      </Fragment>
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
        <AccountsContextProvider>
          <Main />
        </AccountsContextProvider>
    </SubstrateContextProvider>
  )
}
