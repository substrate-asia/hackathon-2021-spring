import React, { useState, createRef, useEffect } from 'react';

import {
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
  Progress
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider, useSubstrate } from '../../substrate-lib';
import { DeveloperConsole } from '../../substrate-lib/components';

import AccountSelector from '../AccountSelector/AccountSelector';
import './App.css';

import Landingpage from '../../landingComponents/Landingpage';
import Debug from '../Debug/Debug';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Earned from '../Earned/Earned';
import Market from '../Market/Market';
import Dashboard from '../Dashboard/Dashboard';
import MarketAmount from '../MarketAmount/MarketAmount';

import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import {
  WelcomeMessage,
  ProgressBarLabelWrapper,
  Label,
  StyledContainer
} from './styled';

function Main (props) {
  const { setSocket } = props;
  const { api, apiState, keyring, keyringState, apiError } = useSubstrate();
  const [accountAddress, setAccountAddress] = useState(null);
  const [supplyRate, setSupplyRate] = useState({});
  const [borrowRate, setBorrowRate] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState({});
  const [borrowIndex, setBorrowIndex] = useState({});
  const [accountCollateral, setAccountCollateral] = useState({});
  const [accountBorrow, setAccountBorrow] = useState({});
  const [totalBorrow, setTotalBorrow] = useState({});
  const [totalSupply, setTotalSupply] = useState({});
  const [collateralAssets, setCollateralAssets] = useState([]);
  const [collateralRate, setCollateralRate] = useState([]);
  const [prices, setPrices] = useState({});
  const [balance, setBalance] = useState({});
  const [accountEarned, setAccountEarned] = useState({});

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans
        .currencies((data) => {
          setCurrencies(data.toHuman());
        })
        .catch(console.error);
  }, [api, accountAddress, setCurrencies]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.supplyRate
        .multi(currencies, (rates) => {
          setSupplyRate(
            rates.reduce(
              (acc, rate, index) => ({
                ...acc,
                [currencies[index]]: (
                  (rate.toString() / 1e9) *
                  5256000 *
                  100
                ).toFixed(2)
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setSupplyRate]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.borrowRate
        .multi(currencies, (rates) => {
          setBorrowRate(
            rates.reduce(
              (acc, rate, index) => ({
                ...acc,
                [currencies[index]]: (
                  (rate.toString() / 1e9) *
                  5256000 *
                  100
                ).toFixed(2)
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setBorrowRate]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.exchangeRate
        .multi(currencies, (rates) => {
          setExchangeRate(
            rates.reduce(
              (acc, rate, index) => ({
                ...acc,
                [currencies[index]]: JSON.parse(rate) / 1e9
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setExchangeRate]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.borrowIndex
        .multi(currencies, (rates) => {
          setBorrowIndex(
            rates.reduce(
              (acc, rate, index) => ({
                ...acc,
                [currencies[index]]: JSON.parse(rate)
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setBorrowIndex]);

  useEffect(() => {
    const userCurrencies = currencies.map((currencyId) => {
      return [currencyId, accountAddress];
    });
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.accountCollateral
        .multi(userCurrencies, (positions) => {
          setAccountCollateral(
            positions.reduce(
              (acc, position, index) => ({
                ...acc,
                [currencies[index]]:
                  (JSON.parse(position) / 1e18) *
                  exchangeRate[currencies[index]]
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, accountAddress, exchangeRate, setAccountCollateral]);

  useEffect(() => {
    const userCurrencies = currencies.map((currencyId) => {
      return [currencyId, accountAddress];
    });
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.accountBorrows
        .multi(userCurrencies, (positions) => {
          setAccountBorrow(
            positions.reduce(
              (acc, position, index) => ({
                ...acc,
                [currencies[index]]:
                  (JSON.parse(position).principal *
                    (borrowIndex[currencies[index]] /
                      (JSON.parse(position).interestIndex === 0
                        ? borrowIndex[currencies[index]]
                        : JSON.parse(position).interestIndex))) /
                  1e18
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, accountAddress, borrowIndex, setAccountBorrow]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.ocwOracle &&
      api.query.ocwOracle.prices
        .multi(currencies, (prices) => {
          setPrices(
            prices.reduce(
              (acc, price, index) => ({
                ...acc,
                [currencies[index]]: price.toHuman()
                  ? JSON.parse(price)[0] / 1000
                  : 1
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setPrices]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.totalBorrows
        .multi(currencies, (positions) => {
          setTotalBorrow(
            positions.reduce(
              (acc, position, index) => ({
                ...acc,
                [currencies[index]]: JSON.parse(position) / 1e18
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setTotalBorrow]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.totalSupply
        .multi(currencies, (positions) => {
          setTotalSupply(
            positions.reduce(
              (acc, position, index) => ({
                ...acc,
                [currencies[index]]:
                  (JSON.parse(position) / 1e18) *
                  exchangeRate[currencies[index]]
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, exchangeRate, setTotalSupply]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans
        .accountCollateralAssets(accountAddress, (assets) => {
          setCollateralAssets(assets.toHuman());
        })
        .catch(console.error);
  }, [api, accountAddress, setCollateralAssets]);

  useEffect(() => {
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.collateralRate
        .multi(currencies, (positions) => {
          setCollateralRate(
            positions.reduce(
              (acc, position, index) => ({
                ...acc,
                [currencies[index]]: JSON.parse(position) / 1e9
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, currencies, setCollateralRate]);

  useEffect(() => {
    const userCurrencies = currencies.map((currencyId) => {
      return accountAddress && [accountAddress, currencyId];
    });
    api &&
      api.query &&
      api.query.tokens &&
      api.query.tokens.accounts
        .multi(userCurrencies, (balances) => {
          setBalance(
            balances.reduce(
              (acc, balance, index) => ({
                ...acc,
                [currencies[index]]: JSON.parse(balance).free / 1e18
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [api, accountAddress, currencies, setBalance]);

  useEffect(() => {
    const userCurrencies = currencies.map((currencyId) => {
      return [currencyId, accountAddress];
    });
    api &&
      api.query &&
      api.query.loans &&
      api.query.loans.accountEarned
        .multi(userCurrencies, (earns) => {
          setAccountEarned(
            earns.reduce(
              (acc, earn, index) => ({
                ...acc,
                [currencies[index]]:
                  (exchangeRate[currencies[index]] -
                    JSON.parse(earn).exchangeRatePrior / 1e9) *
                    accountCollateral[currencies[index]] +
                  (JSON.parse(earn).totalEarnedPrior / 1e9) *
                    prices[currencies[index]]
              }),
              {}
            )
          );
        })
        .catch(console.error);
  }, [
    api,
    accountAddress,
    currencies,
    accountCollateral,
    prices,
    exchangeRate,
    setAccountEarned
  ]);

  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  const loader = (text) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );

  const message = (err) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>
  );

  if (apiState === 'ERROR') {
    return (
      <>
        <message err={apiError} />
        <button>Local host</button>
      </>
    );
  } else if (apiState !== 'READY') return loader('Connecting to Substrate');

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const contextRef = createRef();

  function getBorrowed () {
    let borrowed = 0;
    if (accountBorrow) {
      for (const currency in accountBorrow) {
        accountBorrow[currency] &&
          (borrowed += accountBorrow[currency] * prices[currency]);
      }
    }
    return borrowed.toFixed(3);
  }

  function getTotalCollateral () {
    let supplied = 0;
    if (collateralAssets) {
      for (const currency in accountCollateral) {
        accountCollateral[currency] &&
          collateralAssets.includes(currency) &&
          (supplied += accountCollateral[currency] * prices[currency]);
      }
    }
    return supplied.toFixed(3);
  }

  function getTotalBorrowLimit () {
    let borrowLimit = 0;
    if (collateralAssets && collateralRate) {
      for (const currency in accountCollateral) {
        accountCollateral[currency] &&
          collateralAssets.includes(currency) &&
          (borrowLimit +=
            accountCollateral[currency] *
            prices[currency] *
            collateralRate[currency]);
      }
    }
    return borrowLimit.toFixed(3);
  }

  function getLTV () {
    return ((getBorrowed() / getTotalBorrowLimit()) * 100).toFixed(2);
  }

  function getBorrowLimitLeft () {
    return (getTotalBorrowLimit() - getBorrowed()).toFixed(2);
  }

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector setAccountAddress={setAccountAddress} />
      </Sticky>
      <br></br>
      <NotificationContainer />
      <StyledContainer fluid={true}>
        <WelcomeMessage>Hi, welcome back!</WelcomeMessage>
        <br></br>
        <Grid stackable columns={'equal'}>
          <Earned
            accountAddress={accountAddress}
            accountCollateral={accountCollateral}
            accountBorrow={accountBorrow}
            prices={prices}
            accountEarned={accountEarned}
          />
          <Grid.Row>
            <Grid.Column>
              <br></br>
              <ProgressBarLabelWrapper>
                <Label>Borrow Limit Utilization</Label>
                <Label>{`$${getBorrowLimitLeft()} (${getLTV()}%)`}</Label>
              </ProgressBarLabelWrapper>
              <Progress
                percent={getLTV()}
                size="tiny"
                inverted
                color="blue"
                indicating
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Dashboard
              accountPair={accountPair}
              supplyRate={supplyRate}
              borrowRate={borrowRate}
              currencies={currencies}
              accountCollateral={accountCollateral}
              accountBorrow={accountBorrow}
              prices={prices}
              collateralAssets={collateralAssets}
              setCollateralAssets={setCollateralAssets}
              collateralRate={collateralRate}
              balance={balance}
              accountEarned={accountEarned}
              totalSupply={totalSupply}
              totalBorrow={totalBorrow}
            />
          </Grid.Row>
          <Grid.Row>
            <MarketAmount
              prices={prices}
              totalSupply={totalSupply}
              totalBorrow={totalBorrow}
            />
          </Grid.Row>
          <Grid.Row>
            <Market
              accountPair={accountPair}
              supplyRate={supplyRate}
              borrowRate={borrowRate}
              prices={prices}
              currencies={currencies}
              totalSupply={totalSupply}
              totalBorrow={totalBorrow}
              accountBorrow={accountBorrow}
              accountCollateral={accountCollateral}
            />
          </Grid.Row>
        </Grid>
      </StyledContainer>
      <DeveloperConsole />
    </div>
  );
}
export default function App () {
  const [socket, setSocket] = useState('ws://127.0.0.1:9944');

  return (
    <HashRouter>
      <SubstrateContextProvider socket={socket}>
        <Switch>
          <Route
            path="/app"
            render={(props) => <Main {...props} setSocket={setSocket} />}
          />
          <Route path="/debug" component={Debug} />
          <Route path="/" component={Landingpage} />
        </Switch>
      </SubstrateContextProvider>
    </HashRouter>
  );
}
