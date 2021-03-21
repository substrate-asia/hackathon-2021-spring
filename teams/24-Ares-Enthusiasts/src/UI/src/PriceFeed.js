import React, { useState, createRef, Component } from 'react';
import { Container, Dimmer, Loader, Grid, Sticky, Message, Menu } from 'semantic-ui-react';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from './substrate-lib';
import { DeveloperConsole } from './substrate-lib/components';

import AccountSelector from './AccountSelector';
import Balances from './Balances';
import BlockNumber from './BlockNumber';
import Events from './Events';
import Interactor from './Interactor';
import Metadata from './Metadata';
import NodeInfo from './NodeInfo';
import TemplateModule from './TemplateModule';
import Transfer from './Transfer';
import Upgrade from './Upgrade';
import AresModule from './AresModule';
import OracleRequest from './OracleRequest';
import Aggregates from './Aggregates';
import PriceChain from './PriceChain';
import Detail from './component/detail';
import UiDemo from './UiDemo';

function Main () {
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${err}`}
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
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <Container>
        <Grid stackable columns='equal'>
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Upgrade accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Interactor accountPair={accountPair} />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule accountPair={accountPair} />
            <AresModule accountPair={accountPair} />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

// export default function App () {
//   return (
//     <SubstrateContextProvider>
//       <Main />
//     </SubstrateContextProvider>
//   );
// }

function App () {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  );
}

function AresEx () {
  const { apiState, keyringState, apiError } = useSubstrate();
  const [accountAddress, setAccountAddress] = useState(null);
 const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);
	
  const loader = text =>
    <Dimmer active>
      <Loader size='small'>{text}</Loader>
    </Dimmer>;

  const message = err =>
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message negative compact floating
          header='Error Connecting to Substrate'
          content={`${err}`}
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
      <Container>
        <Grid stackable columns='equal'>
		  <Grid.Row stretched>
		    <UiDemo accountPair={accountPair} setAccountAddress={setAccountAddress} />
		  </Grid.Row>
          <Grid.Row stretched>
            <OracleRequest />
          </Grid.Row>
          <Grid.Row stretched>
            <Aggregates />
          </Grid.Row>
          <Grid.Row stretched>
            <PriceChain />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

function Ares () {
  return (
    <SubstrateContextProvider>
      <AresEx />
    </SubstrateContextProvider>
  );
}

export default class MenuExampleInverted extends Component {
 
  render () {
    return (
      <div>
        <Router>
          <Route path="/PriceFeed" component={Ares} />
		  <Route path="PriceFeed/detail/:pair" component={Detail} />
        </Router>
      </div>
    );
  }
}
