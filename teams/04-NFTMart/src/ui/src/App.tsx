/* eslint-disable import/prefer-default-export */
import * as React from 'react';
import { HashRouter, Switch, Route, useLocation } from 'react-router-dom';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider } from 'react-query';

import PolkaProvider from './api/polka/provider';
import TransHOC from './components/trans';
import theme from './themes';
import Header from './components/header';
import Footer from './components/footer';
import { getClient } from './api/graph';
import { queryClient } from './api/query';
import { scrollTo } from './utils/ui';

import './i18n';

import Home from './pages/home';
import Explore from './pages/explore';
import Wallet from './pages/wallet';
import Create from './pages/create';
import CreateCollection from './pages/create-collection';
import EditUser from './pages/edit-user';
import Detail from './pages/detail';
import MyCollections from './pages/collections';

const ControlledLayout = () => {
  const location = useLocation();

  // Scroll on top when route changes
  React.useEffect(() => {
    scrollTo(0);
    return () => {
      // cleanup
    };
  }, [location.pathname, location.search]);

  return (
    <>
      <Header sticky />
      <PolkaProvider>
        <Switch>
          <Route exact strict path="/" component={Home} />
          <Route exact strict path="/explore" component={Explore} />
          <Route exact strict path="/profile" component={EditUser} />
          <Route exact strict path="/wallet" component={Wallet} />
          <Route exact strict path="/detail/:classId/:tokenId" component={Detail} />
          <Route exact strict path="/collections" component={MyCollections} />
          <Route exact strict path="/create" component={Create} />
          <Route exact strict path="/create-collection" component={CreateCollection} />
        </Switch>
      </PolkaProvider>
      <Footer />
    </>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApolloProvider client={getClient()}>
        <ChakraProvider theme={theme}>
          <CSSReset />
          <HashRouter>
            <TransHOC>
              <ControlledLayout />
            </TransHOC>
          </HashRouter>
        </ChakraProvider>
      </ApolloProvider>
    </QueryClientProvider>
  );
};
