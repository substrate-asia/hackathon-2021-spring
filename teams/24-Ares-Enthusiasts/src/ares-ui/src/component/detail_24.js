import React, {
	Component
} from 'react';
import {
	Table,
	Grid,
	Container
} from 'semantic-ui-react';

import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';


class Echarts24Data extends Component {
	componentDidMount() {
		        var myChart = echarts.init(document.getElementById('main'));
				myChart.clear();

		        myChart.setOption({
		            xAxis: {
		                type: 'category',
		                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		            },
		            yAxis: {
		                type: 'value'
		            },
		            series: [{
		                data: [520, 932, 901, 1934, 1290, 1330, 1320],
		                type: 'line'
		            }]       
		        });
	}
		
		
		
	render() {
		return ( <Container>
					<h2 className = "title" > 24 H data </h2> <div className = "flex_" />
					     <div id="main" style={{ width: 600, height: 400 }}></div>
				</Container>
		)
	}
}
export default Echarts24Data;
