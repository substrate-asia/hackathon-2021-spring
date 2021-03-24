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
	componentDidMount() {}
		
		
		
	render() {
		return ( <Container>
					<h2 className = "title" > 24 H data </h2> <div className = "flex_" />
					     <div id="main" style={{ width: 600, height: 400 }}></div>
				</Container>
		)
	}
}
export default Echarts24Data;
