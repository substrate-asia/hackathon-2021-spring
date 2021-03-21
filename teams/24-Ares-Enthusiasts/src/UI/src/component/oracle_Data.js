import React, { Component } from 'react';
import { Table, Grid,Container } from 'semantic-ui-react';
import moment from 'moment'; 

class oracleData extends Component {
	constructor(){
	       super()
	       this.state = {
	           pair:"",
			   dataList:[]
	       }
		   
		   
	   }
	   componentWillReceiveProps(nextProps) {
				let pair=nextProps.datas;
				if(pair){
					this.setState({pair:pair});
					
					fetch('http://api.aresprotocol.com/api/getpriceall/'+pair)
					.then(res => res.json())
					.then(dataList => {
						for (let i = 0; i < dataList.data.length; i++) {
							 dataList.data[i].date=moment(dataList.data[i].date).format('YYYY-MM-DD HH:mm:ss');
						}
						this.setState({dataList: dataList.data}); 
					})
				}
		 }
      componentDidMount() {
	
    } 
	
	
	
    render() {
        return (
				<Grid.Column className='bottom'>
				  <h1>Oracle Data</h1>
				  <Table  celled striped size='small' >
					<Table.Header>
					  <Table.Row>
						<Table.HeaderCell colSpan='1'  textAlign='center' >Oracle</Table.HeaderCell>
						 <Table.HeaderCell colSpan='1' textAlign='center' >Price Answer</Table.HeaderCell>
						  <Table.HeaderCell colSpan='1' textAlign='center' >Time</Table.HeaderCell>
					  </Table.Row>
					</Table.Header>
					<Table.Body>
					{
					  this.state.dataList.map((item, index) => {
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
				</Grid.Column>
        )
    }
}
export default oracleData;
