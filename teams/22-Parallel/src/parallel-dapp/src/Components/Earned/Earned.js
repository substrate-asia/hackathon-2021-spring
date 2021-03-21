import React, { useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';
import Blob from '../Blob/Blob';
import { PriceCard, SuppliedLabel, AmountLabel, BorrowedLabel } from './styled';

function Main (props) {
  const [earned, setEarned] = useState(0);
  const { accountAddress, accountCollateral, accountBorrow, prices, accountEarned } = props;

  const rate = 20 / 100;
  let totalEarned = getTotalEarned();
  const increaseEarned = (original, rate) => {
    return original + (original * rate) / (365 * 24 * 60 * 60);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      totalEarned = increaseEarned(Number(totalEarned), rate);
      setEarned(totalEarned.toFixed(7));
    }, 250);

    return () => clearInterval(interval);
  }, [accountAddress, accountCollateral, accountBorrow]);

  function getSupplied () {
    let supplied = 0;
    if (accountCollateral) {
      for (const currency in accountCollateral) {
        accountCollateral[currency] &&
          (supplied += accountCollateral[currency] * prices[currency]);
      }
    }
    return supplied.toFixed(4);
  }

  function getBorrowed () {
    let borrowed = 0;
    if (accountBorrow) {
      for (const currency in accountBorrow) {
        accountBorrow[currency] &&
          (borrowed += accountBorrow[currency] * prices[currency]);
      }
    }
    return borrowed.toFixed(4);
  }

  function getTotalEarned () {
    let total = 0;
    if (accountEarned) {
      for (const currency in accountEarned) {
        accountEarned[currency] &&
          (total += accountEarned[currency]);
      }
    }
    return total.toFixed(6);
  }

  return (
    <>
      <Grid.Row stretched>
        <Grid.Column>
          <PriceCard>
            <AmountLabel>${getSupplied()}</AmountLabel>
            <SuppliedLabel>Supplied</SuppliedLabel>
          </PriceCard>
        </Grid.Column>

        <Grid.Column width={6}>
          <Blob earned={earned} />
        </Grid.Column>

        <Grid.Column>
          <PriceCard>
            <AmountLabel>${getBorrowed()}</AmountLabel>
            <BorrowedLabel>Borrowed</BorrowedLabel>
          </PriceCard>
        </Grid.Column>
      </Grid.Row>
    </>
  );
}

export default function Earned (props) {
  return <Main {...props} />;
}
