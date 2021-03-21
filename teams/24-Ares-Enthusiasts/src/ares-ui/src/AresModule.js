import React, { useEffect, useState } from 'react';
import { Form, Table, Grid, Card, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import config from './config';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');

  // The currently stored value
  const [registered, setRegistered] = useState(false);

  // The Ares Aggregators
  const [operatorAddress, setOperatorAddress] = useState('');

  // price
  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [dotPrice, setDotPrice] = useState(0);

  useEffect(() => {
    let unsubscribe;
    if (accountPair === null) {
      return;
    }
    if (typeof (accountPair) === 'undefined') {
      return;
    }
    setOperatorAddress(accountPair.address);
    console.log('operator: ' + operatorAddress);

    api.query.aresModule.aggregators(accountPair.address, newValue => {
      setRegistered(newValue.block_number > 0);
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [accountPair, api.query.aresModule, api.query.aresModule.aggregators, operatorAddress]);

  useEffect(() => {
    let unsubscribe;

    api.query.aresModule.oracleResults.multi(['btcusdt', 'ethusdt', 'dotusdt'], newValues => {
      console.log(newValues);
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
    <Grid.Column width={8}>
      <h1>Are Module</h1>
      <Card centered>
        <Card.Content textAlign='center'>
          <Statistic
            label='have registered?'
            value={String(registered)}
          />
        </Card.Content>
      </Card>
      <Form>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='register'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'aresModule',
              callable: 'registerAggregator',
              inputParams: ['ok,huobi', 'bob', 'http://141.164.45.97:8080/ares/api'],
              paramFields: [true, true, true]
            }}
          />
          <TxButton
            accountPair={accountPair}
            label='unregister'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'aresModule',
              callable: 'unregisterAggregator',
              inputParams: [],
              paramFields: []
            }}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label='get btc price'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'aresModule',
              callable: 'initiateRequest',
              inputParams: [config.AGGREGATOR_ADDRESS, 'btcusdt', '0'],
              paramFields: [true, true, true]
            }}
          />
          <TxButton
            accountPair={accountPair}
            label='get eth price'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'aresModule',
              callable: 'initiateRequest',
              inputParams: [config.AGGREGATOR_ADDRESS, 'ethusdt', '0'],
              paramFields: [true, true, true]
            }}
          />
          <TxButton
            accountPair={accountPair}
            label='get dot price'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'aresModule',
              callable: 'initiateRequest',
              inputParams: [config.AGGREGATOR_ADDRESS, 'dotusdt', '0'],
              paramFields: [true, true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
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

export default function AresModule (props) {
  const { api } = useSubstrate();
  return (api.query.aresModule && api.query.aresModule.aggregators && api.query.aresModule.requests
    ? <Main {...props} /> : null);
}
