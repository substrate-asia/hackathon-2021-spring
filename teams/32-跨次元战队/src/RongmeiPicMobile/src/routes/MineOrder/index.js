import React from 'react'
import {Button, Flex, Tabs, WhiteSpace} from "antd-mobile";
import {api} from "../../services/api/ApiProvider";
import Header from "../../components/Header";

const tabs = [
    {title: '全部'},
    {title: '等待中'},
    {title: '审核中'},
    {title: '排队中'},
    {title: '进行中'},
    {title: '异常订单'},
    {title: '退款中'},
    {title: '已完成'},
    {title: '已关闭'}
];

function formatDate(time) {
    let date = new Date(time);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = date.getDate() + ' ';
    let h = date.getHours() + ':';
    let m = date.getMinutes() + ':';
    let s = date.getSeconds();
    return Y + M + D + h + m + s;
}

class MineOrder extends React.Component {
    state = {
        status: tabs[0].title,
        data: []
    }

    async componentDidMount() {
        const res = await api.orderService.getMineOrders(this.state.status)
        this.setState({
            data: res.orderItems
        })
    }

    async changeTab(tab) {
        const res = await api.orderService.getMineOrders(tab.title);
        this.setState({
            status: tab.title,
            data: res.orderItems
        })
    }

    renderContent = tab =>
        (<div style={{
            backgroundColor: '#F1F1F1'
        }}>
            {
                this.state.data.map((item) => (
                    <div style={{backgroundColor: 'white', marginBottom: '10px'}}>
                        <WhiteSpace/>
                        <Flex style={{marginBottom: '10px'}}>
                            <Flex.Item>
                                <div style={{
                                    textAlign: 'left',
                                    margin: '5px',
                                    color: '#333',
                                    fontSize: '12px'
                                }}>订单号:{item.orderId}</div>
                            </Flex.Item>
                            <Flex.Item>
                                <div style={{
                                    textAlign: 'right'
                                }}><Button type="primary" inline size="small" style={{
                                    marginRight: '6px',
                                    fontSize: '12px'
                                }}>{item.status}</Button></div>
                            </Flex.Item>
                        </Flex>
                        <div style={{padding: '0 15px', backgroundColor: '#F1F1F1'}}>
                            <div style={{display: 'flex', padding: '15px 0'}}>
                                <img style={{height: '64px', marginRight: '15px'}} src={item.avatarUrl} alt=""/>
                                <div style={{lineHeight: 1, marginTop: '5px'}}>
                                    <span style={{float: 'left'}}>
                                        <div style={{
                                            marginBottom: '10px',
                                            fontSize: '14px',
                                            color: '#333',
                                            fontWeight: 'bold',
                                            float: 'left'
                                        }}>{item.userGroupTitle}</div>
                                        <div style={{
                                            marginTop: '45px',
                                            color: '#333',
                                            fontSize: '10px',
                                        }}>提交时间：{formatDate(item.createTime)}</div>
                                    </span>
                                    <span style={{
                                        float: 'right', color: '#333',
                                        fontSize: '10px', textAlign: 'right'
                                    }}>
                                            <div
                                                style={{
                                                    marginBottom: '15px',
                                                    color: '#108ee9'
                                                }}>进度：{item.completeNum}/{item.totalNum}</div>
                                            <div style={{marginBottom: '5px'}}>￥{item.largePrice / 100000}</div>
                                            <div>x{item.totalNum}</div>
                                        </span>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'right',
                            margin: '10px',
                            marginTop: '15px',
                            color: '#333',
                            fontSize: '12px'
                        }}>共{item.totalNum}件商品 合计￥{item.largePrice * item.totalNum / 100000}</div>
                        <WhiteSpace/>
                    </div>
                ))
            }
        </div>);

    render() {
        return (
            <div>
                <Header title={"我的订单"}
                        theme={{bgColor: 'black', title: 'white', mode: 'dark'}}
                        back={() => {
                            this.props.history.goBack();
                        }}/>
                <Tabs tabs={tabs} onChange={(tab, index) => {
                    this.changeTab(tab)
                }} renderTabBar={props => <Tabs.DefaultTabBar {...props} page={5}/>}>
                    {this.renderContent}
                </Tabs>
                <WhiteSpace/>
            </div>
        );
    }
}

export default MineOrder
