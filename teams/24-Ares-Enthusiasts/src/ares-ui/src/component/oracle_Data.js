import React, { Component } from 'react';
import { Table, Grid,Container } from 'semantic-ui-react';

class oracleData extends Component {
	constructor(){
	       super()
	       this.state = {
	           pair:""
	       }
	   }
	   componentWillReceiveProps(nextProps) {
				let pair=nextProps.datas;
				this.setState({pair:pair});
		
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
						<Table.HeaderCell colSpan='1'>Oracle</Table.HeaderCell>
						 <Table.HeaderCell colSpan='1' textAlign='center' >Price Answer</Table.HeaderCell>
						  <Table.HeaderCell colSpan='1' textAlign='center' >Time</Table.HeaderCell>
					  </Table.Row>
					</Table.Header>
					<Table.Body>
					  <Table.Row>
						<Table.Cell>BTC-USDT</Table.Cell>
						<Table.Cell textAlign='right'>1212121</Table.Cell>
						 <Table.Cell textAlign='center'>
							112121212
						 </Table.Cell>
					  </Table.Row>
					</Table.Body>
				  </Table>
				</Grid.Column>
        )
    }
}
export default oracleData;
