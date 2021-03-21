import React, { useEffect, useState } from 'react';
import { Table, Grid } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

export default function Main (props) {
  const { api } = useSubstrate();
  const [aggregatorMap, setAggregatorMap] = useState(new Map());

  useEffect(() => {
    let unsubscribe;

    api.query.aresModule.aggregators.entries(allEntries => {
      for (var [key, value] of allEntries) {
        setAggregatorMap(new Map(aggregatorMap.set(key, value)));
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.aresModule.aggregators]);

  return (
    <Grid.Column>
      <h1>Aggregates</h1>
      <Table celled striped size='small'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Account ID</Table.HeaderCell>
            <Table.HeaderCell>Block Number</Table.HeaderCell>
            <Table.HeaderCell>Source</Table.HeaderCell>
            <Table.HeaderCell>Alias</Table.HeaderCell>
            <Table.HeaderCell>Url</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{[...aggregatorMap.keys()].map(k =>
          <Table.Row key={k}>
            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {aggregatorMap.get(k).account_id.toHuman()}
              </span>
            </Table.Cell>
            <Table.Cell width={3} textAlign='right'>{aggregatorMap.get(k).block_number.toHuman()}</Table.Cell>
            <Table.Cell width={3} textAlign='right'>{aggregatorMap.get(k).source.toHuman()}</Table.Cell>
            <Table.Cell width={3} textAlign='right'>{aggregatorMap.get(k).alias.toHuman()}</Table.Cell>
            <Table.Cell width={3} textAlign='right'>{aggregatorMap.get(k).url.toHuman()}</Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
