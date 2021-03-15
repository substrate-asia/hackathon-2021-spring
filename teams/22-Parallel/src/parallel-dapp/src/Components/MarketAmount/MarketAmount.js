import React from 'react';
import { MarketContainer, MarketValue, MarketTitle } from './styled';

export default function MarketAmount (props) {
  const { prices, totalSupply, totalBorrow } = props;

  function getTotalMarket () {
    let totalMarket = 0;
    for (const currency in totalSupply) {
      totalMarket += totalSupply[currency] * prices[currency];
      totalMarket -= totalBorrow[currency] * prices[currency];
    }
    return Math.abs(totalMarket).toFixed(2);
  }

  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return (
    <MarketContainer>
      <MarketTitle>Total Market</MarketTitle>
      <MarketValue>{`$ ${numberWithCommas(getTotalMarket())}`}</MarketValue>
    </MarketContainer>
  );
}
