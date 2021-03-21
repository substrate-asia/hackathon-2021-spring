import React, { Component } from 'react';
import { Table, Grid,Container } from 'semantic-ui-react';
import * as echarts from 'echarts/lib/echarts';
import Detail24 from './detail_24';

import OracleData from './oracle_Data';
import  'echarts/lib/chart/bar';
import  'echarts/lib/chart/tree';
import  'echarts/lib/chart/graph';
import 'echarts/lib/component/polar'
import 'echarts/lib/chart/lines'
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import './css/detail.css';

class EchartsTest extends Component {
   componentDidMount() {
	   var res = {
	       "colValues": {
	           "0": ["2924", "2326", "2188", "1824", "1706", "1137", "1072", "1054", "826"]
	       },
	       "title": "data",
	       "labels": ["ares_dome_okex","ares_dome_huobi","ares_dome_hobit","ares_dome_BNB" ]
	   }
	   var _data = [{
	       symbolSize: 100,
		   name:'2924',
	       value: [0, 0],
	   }];
	   
	   var _nameArr = [];
	   var _valuelArr = [];
	   var _linesDatas = []
	    _nameArr = res.labels;
	       _valuelArr = res.colValues[0];
	   for (var i = 0; i < _nameArr.length; i++) {
	       _data.push({
	           name: _nameArr[i],
	           s: _valuelArr[i],
	           value:[1,_nameArr.length-i]
	       });
	       _linesDatas.push(
	            [{
	               coord: [0.96, _nameArr.length-i-0.01], 
	           },{
	               coord: [0, 0	], 
	           },
	           
	       ]
	       )
	   }
	   
	  let  option = {
	       polar: {},
	       radiusAxis: {
	           show: false
	       },
	       angleAxis: {
	           type: 'value',
	           show: false,
	           clockwise: false
	           // startAngle: 0
	       },
	       series: [{
	               type: 'graph',
	               hoverAnimation: false,
	               coordinateSystem: 'polar',
	               label: {
	                   normal: {
	                       show: true,
	                       position: 'outside',
	                       fontSize: 16,
	                      formatter: function(params) {
	                           var num = 20;
	                           var s = ''
	                           if(params.data.name){
	                               var _length = params.data.name.length;
	                               var c =_length/num
	                               for(var i=0;i<c;i++){
	                                   var index = i*num;
	                                   var end = (i+1)*num;
	                                   console.log(index+ ','+ end+ ','+params.data.name.substring(index,end))
	                                   if(i!==0){
	                                       s=s+'\n'
	                                   }
	                                   s=s+params.data.name.substring(index,end)
	                                   
	                               }
	                           }
	                           if (params.data.s) {
	                               s = s + '\n' + '(' + params.data.s + ')'
	                           }
	                           return s
	                       }, 
	                       color: '#000000'
	   
	                   }
	               },
	               symbol: '',
	               symbolSize: 22,
	               nodes: _data,
	               silent: false,
	               zlevel:2
	           },
	           {
	               type: 'lines',
	               coordinateSystem: 'polar',
	               lineStyle: {
	                   color: '#0ffff7',
	                   width: 1,
	                   opacity: 0.9,
	                   curveness: .3
	               },
	               effect: {
	                   show: true,
	                   symbol: 'roundRect',
	                   symbolSize: [5, 8],
	                   color: '#ff0000',
	                   trailLength: 0.4,
	                   label: {
	                       show: false
	                   },
	               },
	               data: _linesDatas,
	               markLine: {
	   
	               },
	               label: {
	                   show: false
	               },
	               symbol: ['none', 'arrow'],
	               symbolSize: 10,
	               zlevel: 1
	           }
	       ]
	   };
        var myChart = echarts.init(document.getElementById('main'));
        myChart.setOption(option);
		this.setState({pair:this.props.match.params.pair});
    } 
	constructor(){
	       super()
	       this.state = {
	           pair:""
	       }
	   }
    render() {
        return (
		<Container> 
			<h2>{this.state.pair} Price</h2>
			<div className="flex_" >
				<div  className="aggregation-box" >
					<div>Trusted price</div>
					<div>$ 9.213525</div>
					<div>Primary aggregation parameter</div>
					<div>Secondary aggregation parameter</div>
					<div>Heartbeat <span>16:27:58</span></div>
					<div>Oracle responses </div>
					<div>Working / Total <span>7 / 7</span></div>
					<div>Update time <span>2020-12-19</span></div>
					<div>2020-12-19 <span>06:02 PM</span></div>
				</div>
				<div  className="wd_50" >
					<div id="main" style={{ width: 600, height: 500 }}></div>
				</div>
			</div>
			/* <Detail24  key={this.state.key}  datas={this.state.pair} ></Detail24> */
			<OracleData key={this.state.key}  datas={this.state.pair}  ></OracleData>
			<div className="bottom" ></div>
		</Container>
		
          
        );
    }
}

export default EchartsTest;
