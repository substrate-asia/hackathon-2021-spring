import React, {Component} from 'react';
import { Line } from '@ant-design/charts';

const data = [
    { day: '周一', value: 3 },
    { day: '周二', value: 4 },
    { day: '周三', value: 3.5 },
    { day: '周四', value: 5 },
    { day: '周五', value: 4.9 },
    { day: '周六', value: 6 },
    { day: '周日', value: 7 },
];

const config = {
    data,
    height: 400,
    xField: 'day',
    yField: 'value',
    point: {
        size: 5,
        shape: 'diamond',
    },
};

class ChartArea extends Component {
    render() {
        return (
            <Line style={{width:'550px',height:'370px',marginTop:'50px',marginLeft:'700px'}} {...config} />
        );
    }
}

export default ChartArea;
