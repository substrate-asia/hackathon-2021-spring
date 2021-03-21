import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useSubstrate } from '../../substrate-lib';
import Modal from '../SharedComponents/Modal';
import { TableWrapper, IconAndTextWrapper, Icon } from './styled';

export default function Main (props) {
  const { api, keyring } = useSubstrate();
  const {
    accountPair,
    supplyRate,
    borrowRate,
    prices,
    currencies,
    totalSupply,
    totalBorrow,
    accountBorrow,
    accountCollateral
  } = props;
  const [utilityRate, setUtilityRate] = useState({});
  const [balance, setBalance] = useState({});

  useEffect(() => {
    api.query.loans.utilityRate
      .multi(currencies, (rates) => {
        setUtilityRate(
          rates.reduce(
            (acc, rate, index) => ({
              ...acc,
              [currencies[index]]: (rate.toString() / 1e9) * 100
            }),
            {}
          )
        );
      })
      .catch(console.error);
  }, [api, keyring, currencies, setUtilityRate]);

  useEffect(() => {
    const userCurrencies = currencies.map((currencyId) => {
      return accountPair && [accountPair.address, currencyId];
    });
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
  }, [api, accountPair, currencies, setBalance]);

  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return (
    <>
      <TableWrapper>
        <Table>
          <Thead className="responsiveTable-head">
            <Tr className="responsiveTable-header">
              <Th className="responsiveTable-header-label">Asset</Th>
              <Th className="responsiveTable-header-label">Wallet</Th>
              <Th className="responsiveTable-header-label">Market Size</Th>
              <Th className="responsiveTable-header-label">Borrowed</Th>
              <Th className="responsiveTable-header-label">Supply APY</Th>
              <Th className="responsiveTable-header-label">Borrow APR</Th>
              <Th className="responsiveTable-header-label">Utilization</Th>
              <Th className="responsiveTable-header-label">Action</Th>
              <Th className="responsiveTable-header-label">Action</Th>
            </Tr>
          </Thead>
          <Tbody className="responsiveTable-body">
            {currencies.map((currency) => (
              <Tr className="responsiveTable-row">
                <Td className="responsiveTable-value">
                  <IconAndTextWrapper>
                    <Icon src={`./assets/${currency}-image.png`} />
                    <p>{currency}</p>
                  </IconAndTextWrapper>
                </Td>
                <Td className="responsiveTable-value">
                  {balance &&
                    balance[currency] &&
                    numberWithCommas(balance[currency].toFixed(0))}
                </Td>
                <Td className="responsiveTable-value">
                  {`$${
                    totalSupply &&
                    prices &&
                    numberWithCommas(
                      (totalSupply[currency] * prices[currency]).toFixed(0)
                    )
                  }`}
                </Td>
                <Td className="responsiveTable-value">
                  {`$${
                    totalBorrow &&
                    prices &&
                    numberWithCommas(
                      (totalBorrow[currency] * prices[currency]).toFixed(0)
                    )
                  }`}
                </Td>
                <Td className="responsiveTable-value">
                  {supplyRate && supplyRate[currency] + '%'}
                </Td>
                <Td className="responsiveTable-value">
                  {borrowRate && borrowRate[currency] + '%'}
                </Td>
                <Td className="responsiveTable-value">
                  {utilityRate &&
                    utilityRate[currency] &&
                    utilityRate[currency].toFixed(2) + '%'}
                </Td>
                <Td className="responsiveTable-value">
                  <Modal
                    accountPair={accountPair}
                    currency={currency}
                    action="Deposit"
                    balance={balance}
                    supplyrate={supplyRate[currency]}
                    borrowrate={borrowRate[currency]}
                    totalsupply={totalSupply[currency]}
                    totalborrow={totalBorrow[currency]}
                    price={prices[currency]}
                    marketValue={accountCollateral[currency]}
                  />
                </Td>
                <Td className="responsiveTable-value">
                  <Modal
                    accountPair={accountPair}
                    currency={currency}
                    action="Borrow"
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
            ))}
          </Tbody>
        </Table>
      </TableWrapper>
    </>
  );
}
