import React, { useState, createRef, useEffect } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"
import { makeStyles } from '@material-ui/core/styles'
import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import Header from './containers/Header'
import Role from './containers/Role'
import Fight from './containers/Fight'
import Precious from './containers/Precious'
import ClientInfo from './containers/ClientInfo'
import Server from './containers/Server'
import ServerInfo from './containers/ServerInfo'
import { Link } from 'react-router-dom'

const testKeyring = require('@polkadot/keyring/testing')

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  client: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    height: '50vh',
  },
  server: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    height: '50vh',
  },
  role: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    border: '1px solid gray',
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    width: '50%',
    border: '1px solid gray',
  },
}))

const defaultKeyrings = testKeyring.createTestKeyring({ type: 'sr25519' })
const pairs = defaultKeyrings.getPairs()
const alice = pairs.find(one => one.meta.name === 'alice')
const bob = pairs.find(one => one.meta.name === 'bob')
const queryAsset = [[0, alice.address], [1, alice.address], [2, alice.address], [3, alice.address]]

function Main() {
  const classes = useStyles()
  const { apiState, keyringState, apiError } = useSubstrate();

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>;

  if (apiState === 'ERROR') return message(apiError);
  else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader('Loading accounts (please review any extension\'s authorization)');
  }

  const contextRef = createRef();

  return (
    <div ref={contextRef}>
      <Router>
        <div className={classes.root}>
          <div className={classes.client}>
            <div className={classes.role}>
              <Header />
              <Switch>
                <Route path="/role" component={() => <Role />} />
                <Route path="/fight" component={() => <Fight />} />
                <Route path="/precious" component={Precious} />
                <Route path="/" component={Role} />
              </Switch>

              <div style={{ height: '40px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Link to={`/role`} className={classes.link}>角色</Link>
                <Link to={`/fight`} className={classes.link}>历练</Link>
                <Link to={`/precious`} className={classes.link}>炼宝</Link>
              </div>

            </div>
            <div className={classes.info}>
              <ClientInfo />
            </div>

          </div>
          <div className={classes.server}>
            <div className={classes.role}>
              <Server />
            </div>
            <div className={classes.info}>
              <ServerInfo />
            </div>
          </div>
        </div>
      </Router>
      <DeveloperConsole />
    </div>
  );
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}
