import React, { useEffect, useState } from 'react';
import { Form, Table, Grid, Card, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton} from './substrate-lib/components';

import { Drawer, Button,Modal } from 'antd';
import DataSoure from './component/detail';

import config from './config';

import './main.css';

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
  // price
  const [dataList, setDataList] = useState([]);
  let data_list=[
    {name:'btc_usdt',symbol:'btcusdt',price:''},
    {name:'eth_usdt',symbol:'ethusdt',price:''},
    {name:'dot_usdt',symbol:'dotusdt',price:''},
    {name:'bnb_usdt',symbol:'bnbusdt',price:''},
    {name:'ada_usdt',symbol:'adausdt',price:''},
    {name:'xrp_usdt',symbol:'xrpusdt',price:''},
    {name:'ltc_usdt',symbol:'ltcusdt',price:''},
    {name:'bch_usdt',symbol:'bchusdt',price:''},
    {name:'xlm_usdt',symbol:'xlmusdt',price:''} 
  ]
  
  let multi=[];
  for (let index = 0; index < data_list.length; index++) {
      multi.push(data_list[index].symbol);
  }

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

    api.query.aresModule.oracleResults.multi(multi, newValues => {
		  for (let index = 0; index < data_list.length; index++) {
		    data_list[index].price= parseInt(newValues[index][newValues[index].length - 1]) / 1000;
		  }
		  setDataList(data_list);
	}).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api.query.aresModule.oracleResults]);
		
		const [visible, setVisible] = useState(false);
		const [pair, setPair] = useState(false);
		
const showDrawer = (e) => {
    setPair(e);
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };
		
		
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
              inputParams: ['ok,huobi', 'bob', 'http://api.aresprotocol.com/api'],
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
	        <Table.HeaderCell colSpan='1'>Name</Table.HeaderCell>
	        <Table.HeaderCell colSpan='1'>Price</Table.HeaderCell>
	    			 <Table.HeaderCell colSpan='1' textAlign='center' >Operation</Table.HeaderCell>
	      </Table.Row>
	    </Table.Header>
	    <Table.Body>
	    {
	  					  dataList.map((item, index) => {
	  						return <Table.Row  key={index} >
	  								<Table.Cell textAlign='center' >{item.name}</Table.Cell>
	  								<Table.Cell textAlign='center'>{item.price?item.price:'no price'}</Table.Cell>
	  								 <Table.Cell textAlign='center'>
											<TxButton
											  accountPair={accountPair}
											  label='price '
											  type='SIGNED-TX'
                        style={{border:'1px solid transparent !important'}}
											  setStatus={setStatus}
											  attrs={{
											    palletRpc: 'aresModule',
											    callable: 'initiateRequest',
											    inputParams: [config.AGGREGATOR_ADDRESS,item.symbol, '0'],
											    paramFields: [true, true, true]
											  }}
											/>
	  									<Button  type="default" onClick={showDrawer.bind(this,item.symbol)} >View</Button>
	  								 </Table.Cell>
	  							  </Table.Row>
	  					  })
	  					}
	     
	    </Table.Body>
	  </Table>
	  
	  
	   <Modal
	     title="Aggregates"
	     visible={visible}
	     width={1200}
	     onCancel={onClose}
	     footer={null}
	   >
	      <DataSoure  myClose={onClose.bind(this)}    datas={pair}  ></DataSoure>
	    </Modal>
	  
    </Grid.Column>
  );
}

export default function AresModule (props) {
  const { api } = useSubstrate();
  return (api.query.aresModule && api.query.aresModule.aggregators && api.query.aresModule.requests
    ? <Main {...props} /> : null);
}
