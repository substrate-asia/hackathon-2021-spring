import React, { useState } from 'react';
import {
  AccountDetailsWrapper,
  AccordionButton,
  ContentWrapper,
  ValuesWrapper,
  LeftValuesWrapper,
  RightValuesWrapper,
  WheelsWrapper,
  Label,
  Value,
  LabelAndValueWrapper,
  HealthLabel,
  DonutChartWrapper,
  DonutChartLabel
} from './styled';

import PieCharts from './PieCharts';

export default function AccountDetails (props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    accountCollateral,
    accountBorrow,
    prices,
    collateralAssets,
    collateralRate
  } = props;

  function getSupplied () {
    let supplied = 0;
    if (accountCollateral) {
      for (const currency in accountCollateral) {
        accountCollateral[currency] &&
          (supplied += accountCollateral[currency] * prices[currency]);
      }
    }
    return supplied.toFixed(3);
  }

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

  function getComposition (data, sum) {
    const result = [];
    for (const key in data) {
      result.push({
        name: key,
        value: parseFloat((((data[key] * prices[key]) / sum) * 100).toFixed(2))
      });
    }
    return result;
  }

  function getLTV () {
    return ((getBorrowed() / getTotalBorrowLimit()) * 100).toFixed(2);
  }

  function getBorrowLimitLeft () {
    return (getTotalBorrowLimit() - getBorrowed()).toFixed(3);
  }

  function getHealthFactor () {
    return (getSupplied() / getBorrowed()).toFixed(3);
  }

  const toggleExpandable = () => {
    setIsExpanded(!isExpanded);
  };

  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return (
    <AccountDetailsWrapper>
      <AccordionButton
        onClick={() => toggleExpandable()}
        isExpanded={isExpanded}
      >
        {isExpanded ? ' - Portfolio overview' : ' + Portfolio overview'}
      </AccordionButton>
      {isExpanded
        ? (
        <ContentWrapper>
          <ValuesWrapper>
            <LeftValuesWrapper>
              <LabelAndValueWrapper>
                <Label>Balance:</Label>
                <Value>$ {numberWithCommas(getSupplied())}</Value>
              </LabelAndValueWrapper>
              <LabelAndValueWrapper>
                <Label>Borrowed:</Label>
                <Value>$ {numberWithCommas(getBorrowed())}</Value>
              </LabelAndValueWrapper>
              <LabelAndValueWrapper>
                <Label>Collateral:</Label>
                <Value>$ {numberWithCommas(getTotalCollateral())}</Value>
              </LabelAndValueWrapper>
            </LeftValuesWrapper>
            <RightValuesWrapper>
              <LabelAndValueWrapper>
                <Label>Health Factor:</Label>
                <HealthLabel>{getHealthFactor()}</HealthLabel>
              </LabelAndValueWrapper>
              <LabelAndValueWrapper>
                <Label>Current LTV:</Label>
                <HealthLabel>{getLTV()}%</HealthLabel>
              </LabelAndValueWrapper>
              <LabelAndValueWrapper>
                <Label>Borrow Capacity Left:</Label>
                <HealthLabel>
                  $ {numberWithCommas(getBorrowLimitLeft())}
                </HealthLabel>
              </LabelAndValueWrapper>
            </RightValuesWrapper>
          </ValuesWrapper>
          <WheelsWrapper>
            <DonutChartWrapper>
              <PieCharts
                composition={getComposition(accountCollateral, getSupplied())}
              />
              <DonutChartLabel>Supply Composition</DonutChartLabel>
            </DonutChartWrapper>
            <DonutChartWrapper>
              <PieCharts
                composition={getComposition(accountBorrow, getBorrowed())}
              />
              <DonutChartLabel>Borrow Composition</DonutChartLabel>
            </DonutChartWrapper>
          </WheelsWrapper>
        </ContentWrapper>
          )
        : null}
    </AccountDetailsWrapper>
  );
}
