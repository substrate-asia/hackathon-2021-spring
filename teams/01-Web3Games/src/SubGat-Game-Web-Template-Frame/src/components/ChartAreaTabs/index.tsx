import React, {Component} from 'react';
import { Tabs } from 'antd';
const { TabPane } = Tabs;

function callback(key: any) {
    console.log(key);
}

class ChartAreaTabs extends Component {
    render() {
        return (
            <Tabs style={{flexDirection:'row',marginLeft:'850px',marginTop:'50px',fontSize:'20px',color:'aliceblue'}} defaultActiveKey="1" onChange={callback}>
                <TabPane  tab="日活用户" key="1">
                </TabPane>
                <TabPane  tab="交易金额" key="2">
                </TabPane>
                <TabPane  tab="交易笔数" key="3">
                </TabPane>
            </Tabs>
        );
    }
}

export default ChartAreaTabs;
