import React, { FC, ReactElement } from 'react';
import './app.css';
import { useApi } from '../../core/hooks/use-api';
import { Action } from './action';
import { Head } from './head';

const Main: FC = (): ReactElement => {
  return (
    <div className="App" style={{ height: '100%', background: 'rgb(239, 239, 239)' }}>
      <Head />
      <div className="content">
        <div>
          <Action />
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isApiReady } = useApi();
  if (!isApiReady) {
    return <div>Connecting....</div>;
  }

  return (
    <Main></Main>
  );
}

export default App;
