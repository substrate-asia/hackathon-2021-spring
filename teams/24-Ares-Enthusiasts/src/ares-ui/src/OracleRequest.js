import React, { useEffect, useState } from 'react';
import { Table, Grid } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';

export default function Main (props) {
  const { api } = useSubstrate();
  const [requestsMap, setRequestsMap] = useState(new Map());

  useEffect(() => {
    let unsubscribe;

    api.query.aresModule.requests.entries(allEntries => {
      console.log(allEntries);
      for (var [key, value] of allEntries) {
        setRequestsMap(new Map(requestsMap.set(key, value)));
      }
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.query.aresModule.requests]);

  return (
    <Grid.Column>
      <h1>Oracle Request</h1>
      <Table celled striped size='small'>
        <Table.Header>
          <Table.Row>
            {/* <Table.HeaderCell>ID</Table.HeaderCell> */}
            <Table.HeaderCell>Aggregator ID</Table.HeaderCell>
            <Table.HeaderCell>Block Number</Table.HeaderCell>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell>Work ID</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{[...requestsMap.keys()].map(k =>
          <Table.Row key={k}>
            {/* <Table.Cell width={3} textAlign='right'>{k}</Table.Cell> */}
            <Table.Cell width={10}>
              <span style={{ display: 'inline-block', minWidth: '31em' }}>
                {requestsMap.get(k).aggregator_id.toHuman()}
              </span>
            </Table.Cell>
            <Table.Cell width={3} textAlign='right'>{requestsMap.get(k).block_number.toHuman()}</Table.Cell>
            <Table.Cell width={3} textAlign='right'>{requestsMap.get(k).token.toHuman()}</Table.Cell>
            <Table.Cell width={3} textAlign='right'>{requestsMap.get(k).work_id.toHuman()}</Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
