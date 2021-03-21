import React, { Component } from 'react';
var ReactART = React.ART;
import { Table, Grid,Container } from 'semantic-ui-react';
import {  Link,NavLink } from 'react-router-dom';
import { Drawer, Button } from 'antd';
import * as echarts from 'echarts/lib/echarts';
import OracleData from './oracle_Data';
import  'echarts/lib/chart/bar';
import  'echarts/lib/chart/tree';
import  'echarts/lib/chart/graph';
import 'echarts/lib/component/polar'
import 'echarts/lib/chart/lines'
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import './css/detail.css';
import moment from 'moment'; 

class EchartsTest extends Component {

	componentWillReceiveProps(nextProps) {
		let symbol=nextProps.datas;
		if(symbol){
			fetch('http://api.aresprotocol.com/api/getpriceall/'+symbol)
			.then(res => res.json())
			.then(dataList => {
				for (let i = 0; i < dataList.data.length; i++) {
							 dataList.data[i].angle=(i+1)*360/ dataList.data.length;
							let corex = 375,coreY =300, r = 280;
							let x = corex + r * Math.cos( dataList.data[i].angle * Math.PI / 180)
							let y = coreY + r * Math.sin( dataList.data[i].angle * Math.PI/180)
							 dataList.data[i].x=x;
							 dataList.data[i].y=y;
							 dataList.data[i].transform='translate('+x+','+y+')'
						}
						
						this.setState({length:dataList.data.length});
				this.setState({pair:symbol});
				this.setState({dataList: dataList.data}); 
			})
			
			fetch('http://api.aresprotocol.com//api/getPartyPrice/'+symbol)
			.then(res => res.json())
			.then(partyPrice => {
				   var date=moment(partyPrice.data.ts).format('YYYY-MM-DD');
				 var time=moment(partyPrice.data.ts).format('HH:mm:ss');
				 this.setState({partyPrice: partyPrice.data,time:time,date:date}); 
			})
			
		}
 }
	   
   componentDidMount() {
		let symbol=this.props.datas;
		if(symbol){
			fetch('http://api.aresprotocol.com/api/getpriceall/'+symbol)
			.then(res => res.json())
			.then(dataList => {
				for (let i = 0; i < dataList.data.length; i++) {
							dataList.data[i].angle=(i+1)*360/ dataList.data.length;
							let corex = 375,coreY =300, r = 280;
							let x = corex + r * Math.cos( dataList.data[i].angle * Math.PI / 180)
							let y = coreY + r * Math.sin( dataList.data[i].angle * Math.PI/180)
							dataList.data[i].x=x;
							dataList.data[i].y=y;
							dataList.data[i].transform='translate('+x+','+y+')'
						}
						
						this.setState({length:dataList.data.length});
				this.setState({pair:symbol});
				this.setState({dataList: dataList.data}); 
			})
			
			fetch('http://api.aresprotocol.com//api/getPartyPrice/'+symbol)
			.then(res => res.json())
			.then(partyPrice => {
				var date=moment(partyPrice.data.ts).format('YYYY-MM-DD');
				var time=moment(partyPrice.data.ts).format('HH:mm:ss');
				this.setState({partyPrice: partyPrice.data,time:time,date:date}); 
			})
			
		}
	 
   }	
  
   close(){
	console.log(this); // null
	this.props.myClose();
	}
  
	constructor(){
	       super()
	       this.state = {
	           pair:"",
			   dataList:[],
			   partyPrice:{},
			   time:'',
			   date:'',
			   length:0
	       }
	   }


	 
    render() {
		
	
		const toFixed = ( dight, bits = 3 ) => {
			return Math.round( dight * Math.pow( 10, bits ) ) / Math.pow( 10, bits )
		  }
			  
        return (
		<Container  className="container" > 
			<div className="flex_ font20"  onClick={this.close.bind(this)} > <Button  type="dashed" className="margn10" to="/Price Feed">Close</Button> <span>{this.state.pair} Price</span></div>
			<div className="flex_" >
				<div  className="aggregation-box" >
					<div>Trusted price</div>
					<div>$ {this.state.partyPrice.price}</div>
					<div>Heartbeat <span>{this.state.time}</span></div>
					<div>Oracle responses </div>
					<div>Working / Total <span>{this.state.length+'/'+this.state.length} </span></div>
					<div>Update time <span>{this.state.date}</span></div>
					<div>{this.state.date} <span>{this.state.time}</span></div>
				</div>
				<div  className="wd_50" >
					<svg viewBox="0 0 775 600" width="750" height="600" preserveAspectRatio="xMidYMid meet">
						{
						  this.state.dataList.map((item, index) => {
							return <line className="vis__line vis__line--pending" x1="375" y1="300" key={index} x2={item.x} y2={item.y}></line>
						  })
						}
						
						{
						  this.state.dataList.map((item, index) => {
								return 	<g data-testid="vis-oracle"  className="vis__oracle-group" transform={item.transform} >
									<circle className="vis__oracle vis__oracle--pending" r="10"></circle>
									<g className="vis__oracle-label"><text className="vis__oracle-label--name" x="20" y="-5">{item.market}</text></g>
								</g>
						  })
						}
						
						<g data-testid="vis-contract" className="vis__contract-group" transform="translate(375,300)">
							<circle className="vis__contract vis__contract--fulfilled" r="60"></circle>
							<g transform="translate(-15,-35)">
								<path d=""
								 transform="scale(0.03)"></path>
							</g>
							<g className="vis__contract-label"><text className="vis__contract-label--answer" y="15" textAnchor="middle">${toFixed(this.state.partyPrice.price,6)}</text></g>
						</g> 
					</svg>
					
				</div>
			</div>
			<OracleData key={this.state.key}  datas={this.state.pair}  ></OracleData>
			<div className="bottom" ></div>
		</Container>
		
          
        );
    }
}

export default EchartsTest;
