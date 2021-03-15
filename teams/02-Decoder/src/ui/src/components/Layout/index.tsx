import React, { FC, useEffect, useMemo } from 'react';
import { NavBar } from '../NavBar';
import styled from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';

import { Market } from '@/pages/Market'
// import { Bank } from '@/pages/Bank'
// import { Lend } from '@/pages/Lend'
import { Deposit } from '@/pages/Bank/Deposit'
import { Borrow } from '@/pages/Lend/Borrow'
import { Nodes } from '@/config/nodes'
import { useApi, useIsAppReady } from '@/hooks';

const Container = styled.div`
  display:block;
  width: 1080px;
  margin: 84px auto;
  border-radius: 12px;
`;
const LoadingBox = styled.div`
  position:fixed;
  z-index:1;
  display:flex;
  background:var(--light-bg);
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
`;
export const Layout: FC = ({ children }) => {
  const { init } = useApi();

  const isAppReady = useIsAppReady();

  useEffect(() => {
    console.log(isAppReady);

    // initialize api
    if (isAppReady) return;

    init(Nodes.testnet[0].url);
  }, [init, isAppReady]);

  const content = useMemo(() => {

    if (!isAppReady) {
      return (
        <LoadingBox>
          <LoadingOutlined style={{
            fontSize: 32,
            color: 'var(--primary-color)'
          }} />
        </LoadingBox>
      );
    }

    return (
      <Container>
        <Switch>
          <Route exact strict path="/" component={Market} />
          <Route exact strict path="/lend" component={Borrow} />
          <Route exact strict path="/bank" component={Deposit} />
          {/* <Route exact strict path="/deposit/:tokenId" component={Deposit} />
          <Route exact strict path="/borrow/:tokenId" component={Borrow} /> */}
        </Switch>
        {children}
      </Container>
    )
  }, [children, isAppReady])

  return (
    <Router>
      <NavBar />
      {content}
    </Router>
  )
}