import React, { useEffect, useState } from 'react';
import { Table, Grid } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import { Drawer, Button ,Modal} from 'antd';

import moment from 'moment'; 
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

  const onClose = () => {
    setVisible(false);
  };


  const [visible, setVisible] = useState(false);

  const [dataList, setDataList] = useState([]);


  const showDrawer = (e) => {
      console.log(e);
      setVisible(true);
      fetch('http://api.aresprotocol.com/api/getpriceall/dotusdt')
      .then(res => res.json())
      .then(dataList => {
        for (let i = 0; i < dataList.data.length; i++) {
          dataList.data[i].date=moment(dataList.data[i].date).format('YYYY-MM-DD HH:mm:ss');
       }
        setDataList(dataList.data);
      })
  };

  

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
            <Table.HeaderCell textAlign='center' >Operation</Table.HeaderCell>
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
            <Table.Cell style= {{witdh: '400px' }}  textAlign='center' >
            <span style={{ display: 'inline-block', minWidth: '15em' }}>
              <Button  type="primary" onClick={showDrawer.bind(this,aggregatorMap.get(k).url.toHuman())} >OPEN</Button>
              </span>
            </Table.Cell>
          </Table.Row>
        )}
        </Table.Body>
      </Table>
	  
	  <Modal
	    title="Aggregates"
	    visible={visible}
	    onCancel={onClose}
	    footer={null}
	  >
          <div> <Button type="dashed"  onClick={onClose.bind(this)} >Close</Button> </div>
         <Table  celled striped size='small' >
					<Table.Header>
					  <Table.Row>
						<Table.HeaderCell colSpan='1'  textAlign='center' >Market</Table.HeaderCell>
						 <Table.HeaderCell colSpan='1' textAlign='center' >Price Answer</Table.HeaderCell>
						  <Table.HeaderCell colSpan='1' textAlign='center' >Time</Table.HeaderCell>
					  </Table.Row>
					</Table.Header>
					<Table.Body>
					{
					  dataList.map((item, index) => {
						return <Table.Row  key={index} >
								<Table.Cell textAlign='center' >{item.market}</Table.Cell>
								<Table.Cell textAlign='center'>{item.price}</Table.Cell>
								 <Table.Cell textAlign='center'>
										{item.date}
								 </Table.Cell>
							  </Table.Row>
					  })
					}
					</Table.Body>
				  </Table> 



       
      </Modal>
    </Grid.Column>
  );
}
