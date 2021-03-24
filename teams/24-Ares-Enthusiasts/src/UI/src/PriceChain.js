import React, { useEffect, useState } from 'react';
import { Table, Grid } from 'semantic-ui-react';
import { useSubstrate } from './substrate-lib';
import {  Link,NavLink } from 'react-router-dom';
import { Drawer, Button,Modal } from 'antd';
import './main.css';
import DataSoure from './component/detail';


export default function Main (props) {
  const { api } = useSubstrate();
  // price
  const [dataList, setDataList] = useState([]);
 

  useEffect(() => {
    let unsubscribe;

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
    console.log("====================")
    setVisible(false);
  };

  return (

    <Grid.Column>
      <h1>Price on Chain</h1>
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
								 
									<Button  type="primary" onClick={showDrawer.bind(this,item.symbol)} >View</Button>
								 
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
