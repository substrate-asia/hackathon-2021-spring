import React, { useState, useEffect } from 'react';
import { Grid, Checkbox } from 'semantic-ui-react';
import Modal from '../SharedComponents/Modal';
import AccountDetails from '../AccountDetails/AccountDetails';
import { useSubstrate } from '../../substrate-lib';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import { NotificationManager } from 'react-notifications';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import Staking from '../Staking/Staking';

import {
  DashBoardTitle,
  DashBoardWrapper,
  MenuWrapper,
  ContentWrapper,
  DepositsTabWrapper,
  StakingTabWrapper,
  LoansTabWrapper,
  TabName,
  IconAndTextWrapper,
  Icon
} from './styled';

export default function Main (props) {
  const { api } = useSubstrate();
  const [paneSelection, setPaneSelection] = useState(0);
  const {
    accountPair,
    supplyRate,
    borrowRate,
    currencies,
    accountCollateral,
    accountBorrow,
    prices,
    collateralAssets,
    setCollateralAssets,
    collateralRate,
    balance,
    accountEarned,
    totalSupply,
    totalBorrow
  } = props;

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected }
    } = accountPair;
    let fromAcct;
    // signer is from Polkadot-js browser extension
    if (isInjected) {
      const injected = await web3FromSource(source);
      fromAcct = address;
      api.setSigner(injected.signer);
    } else {
      fromAcct = accountPair;
    }
    return fromAcct;
  };

  function adjustCollateral (currency) {
    getFromAcct().then((fromAcct) =>
      api.tx.loans
        .collateralAsset(currency, !collateralAssets.includes(currency))
        .signAndSend(fromAcct, ({ events, status }) => {
          if (status.isReady) { NotificationManager.info('Transaction processing'); }
          if (status.isInBlock) {
            events.forEach(({ phase, event: { data, method, section } }) => {
              if (method === 'ExtrinsicFailed') {
                NotificationManager.error('Transaction error');
              } else if (method === 'ExtrinsicSuccess') {
                NotificationManager.success('Transaction success');
              }
            });
          }
        })
    );
  }

  function selectionHandler (currency) {
    collateralAssets.includes(currency)
      ? setCollateralAssets(collateralAssets.filter((d) => d !== currency))
      : setCollateralAssets(collateralAssets.concat([currency]));

    adjustCollateral(currency);
  }

  const panes = [
    {
      menuItem: 'Deposits',
      render: () => (
        <Table>
          <Thead className="responsiveTable-head">
            <Tr className="responsiveTable-header">
              <Th className="responsiveTable-header-label">Asset</Th>
              <Th className="responsiveTable-header-label">Supply Balance</Th>
              <Th className="responsiveTable-header-label">APY</Th>
              <Th className="responsiveTable-header-label">Earned</Th>
              <Th className="responsiveTable-header-label">Collateral</Th>
              <Th className="responsiveTable-header-label">Action</Th>
            </Tr>
          </Thead>
          <Tbody className="responsiveTable-body">
            {currencies.map((currency) =>
              accountCollateral[currency] &&
              accountCollateral[currency] != 0
                ? (
                <Tr className="responsiveTable-row">
                  <Td className="responsiveTable-value">
                    <IconAndTextWrapper>
                      <Icon src={`./assets/${currency}-image.png`} />
                      <p>{currency}</p>
                    </IconAndTextWrapper>
                  </Td>
                  <Td className="responsiveTable-value">
                    {accountCollateral &&
                      accountCollateral[currency] &&
                      accountCollateral[currency].toFixed(4)}
                  </Td>
                  <Td className="responsiveTable-value">
                    {supplyRate && supplyRate[currency] + '%'}
                  </Td>
                  <Td className="responsiveTable-value">
                    $ {accountEarned && accountEarned[currency].toFixed(6)}
                  </Td>
                  <Td className="responsiveTable-value">
                    <Checkbox
                      slider
                      className="checkbox-slider"
                      onClick={() => {
                        selectionHandler(currency);
                      }}
                      toggle
                      checked={collateralAssets.includes(currency)}
                    />
                  </Td>
                  <Td className="responsiveTable-value">
                    <Modal
                      accountPair={accountPair}
                      currency={currency}
                      action="Withdraw"
                      balance={accountCollateral}
                      supplyrate={supplyRate[currency]}
                      borrowrate={borrowRate[currency]}
                      totalsupply={totalSupply[currency]}
                      totalborrow={totalBorrow[currency]}
                      price={prices[currency]}
                      marketValue={accountCollateral[currency]}
                    />
                  </Td>
                </Tr>
                  )
                : (
                <></>
                  )
            )}
          </Tbody>
        </Table>
      )
    },
    {
      menuItem: 'Staking',
      render: () => <Staking accountPair={accountPair} balance={balance} />
    },
    {
      menuItem: 'Loans',
      render: () => (
        <Table>
          <Thead className="responsiveTable-head">
            <Tr className="responsiveTable-header">
              <Th className="responsiveTable-header-label">Asset</Th>
              <Th className="responsiveTable-header-label">Borrowed</Th>
              <Th className="responsiveTable-header-label">APR</Th>
              <Th className="responsiveTable-header-label">Interests</Th>
              <Th className="responsiveTable-header-label">Action</Th>
            </Tr>
          </Thead>
          <Tbody className="responsiveTable-body">
            {currencies.map((currency) =>
              accountBorrow[currency] && accountBorrow[currency] != 0
                ? (
                <Tr className="responsiveTable-row">
                  <Td className="responsiveTable-value">
                    <IconAndTextWrapper>
                      <Icon src={`./assets/${currency}-image.png`} />
                      <p>{currency}</p>
                    </IconAndTextWrapper>
                  </Td>
                  <Td className="responsiveTable-value">
                    {accountBorrow &&
                      accountBorrow[currency] &&
                      accountBorrow[currency].toFixed(8)}
                  </Td>
                  <Td className="responsiveTable-value">
                    {borrowRate && borrowRate[currency] + '%'}
                  </Td>
                  <Td className="responsiveTable-value">
                    $ {accountEarned && accountEarned[currency].toFixed(6)}
                  </Td>
                  <Td className="responsiveTable-value">
                    <Modal
                      accountPair={accountPair}
                      currency={currency}
                      action="Repay"
                      balance={accountBorrow}
                      supplyrate={supplyRate[currency]}
                      borrowrate={borrowRate[currency]}
                      totalsupply={totalSupply[currency]}
                      totalborrow={totalBorrow[currency]}
                      price={prices[currency]}
                      marketValue={accountBorrow[currency]}
                    />
                  </Td>
                </Tr>
                  )
                : (
                <></>
                  )
            )}
          </Tbody>
        </Table>
      )
    }
  ];

  const changePane = (selection) => {
    setPaneSelection(selection);
  };

  return (
    <Grid.Column>
      <DashBoardTitle>My Portfolio</DashBoardTitle>
      <br></br>
      <DashBoardWrapper>
        <MenuWrapper>
          <DepositsTabWrapper
            paneSelection={paneSelection}
            onClick={() => changePane(0)}
          >
            <TabName>Deposits</TabName>
          </DepositsTabWrapper>
          <LoansTabWrapper
            paneSelection={paneSelection}
            onClick={() => changePane(2)}
          >
            <TabName>Loans</TabName>
          </LoansTabWrapper>
          <StakingTabWrapper
            paneSelection={paneSelection}
            onClick={() => changePane(1)}
          >
            <TabName>Staking</TabName>
          </StakingTabWrapper>
        </MenuWrapper>
        <ContentWrapper>{panes[paneSelection].render()}</ContentWrapper>
      </DashBoardWrapper>
      <br></br>
      <AccountDetails
        accountCollateral={accountCollateral}
        accountBorrow={accountBorrow}
        prices={prices}
        collateralAssets={collateralAssets}
        collateralRate={collateralRate}
      />
      <br></br>
    </Grid.Column>
  );
}
