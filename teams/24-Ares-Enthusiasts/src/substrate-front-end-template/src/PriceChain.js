import React, { useEffect, useState } from 'react';
import { Table, Grid } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

export default function Main (props) {
  const { api } = useSubstrate();
  // price
  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [dotPrice, setDotPrice] = useState(0);

  useEffect(() => {
    let unsubscribe;

    api.query.aresModule.oracleResults.multi(['btcusdt', 'ethusdt', 'dotusdt'], newValues => {
      // console.log(newValues);
      const [btcprice, ethprice, dotprice] = newValues;
      setBtcPrice(parseInt(btcprice[btcprice.length - 1]) / 1000);
      setEthPrice(parseInt(ethprice[ethprice.length - 1]) / 1000);
      setDotPrice(parseInt(dotprice[dotprice.length - 1]) / 1000);
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.aresModule.oracleResults]);

  return (
    <Grid.Column>
      <h1>Price on Chain</h1>
      <Table celled striped size='small'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan='3'>Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>BTC-USDT</Table.Cell>
            <Table.Cell textAlign='right'>{String(btcPrice)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>ETH-USDT</Table.Cell>
            <Table.Cell textAlign='right'>{String(ethPrice)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>DOT-USDT</Table.Cell>
            <Table.Cell textAlign='right'>{String(dotPrice)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
