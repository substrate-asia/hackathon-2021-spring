import React from 'react'
import {TabBar} from 'antd-mobile';
import {withRouter} from "react-router-dom";
import ContentMain from '../../components/ContentMain'

@withRouter
class Index extends React.Component {
    props;

    constructor(props) {
        super(props)
        this.props = props;
    }

    async componentDidMount() {
        const isLogin = localStorage.getItem('token') && localStorage.getItem('token').length > 0;
        if (!isLogin) {
            this.props.history.push('/login')
        }
    }

    renderContent() {
        return (
            <div style={{backgroundColor: '#000', height: '100%', textAlign: 'center'}}>
                <ContentMain/>
            </div>
        );
    }

    switch(path) {
        this.setState({
            nowPath: path
        });
        this.props.history.push(path)
    }

    render() {
        const hash = window.location.hash;
        let selectedTab = hash.substr(2, hash.length);
        if (selectedTab.indexOf("/") >= 0) {
            const urlPaths = selectedTab.split("/");
            selectedTab = urlPaths[urlPaths.length - 1];
        }
        return (
            <div style={{
                position: 'fixed',
                height: '100%',
                width: '100%',
                top: 0,
                background:'#000'
            }}>
                <TabBar
                    style={{
                        background:'#000'
                    }}
                    unselectedTintColor="#AAAAAA"
                    tintColor="#FFFFFF"
                    barTintColor="black"
                >
                    <TabBar.Item
                        key="home"
                        icon={<div style={{color: '#AAAAAA', fontSize: 14}}>首页</div>}
                        selectedIcon={<div style={{color: '#FFFFFF', fontSize: 15}}>首页</div>}
                        selected={selectedTab === 'home'}
                        onPress={() => {
                            this.props.history.push('/home')
                        }}
                    >
                        {this.renderContent()}
                    </TabBar.Item>
                    {/*<TabBar.Item*/}
                    {/*    key="friend"*/}
                    {/*    icon={<div style={{color: '#AAAAAA', fontSize: 14}}>朋友</div>}*/}
                    {/*    selectedIcon={<div style={{color: '#FFFFFF', fontSize: 15}}>朋友</div>}*/}
                    {/*    selected={selectedTab === 'friend'}*/}
                    {/*    onPress={() => {*/}
                    {/*        this.props.history.push('friend')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {this.renderContent()}*/}
                    {/*</TabBar.Item>*/}
                    {/*<TabBar.Item*/}
                    {/*    key="add"*/}
                    {/*    icon={<svg t="1611997466374" className="icon" viewBox="0 0 1024 1024" version="1.1"*/}
                    {/*               xmlns="http://www.w3.org/2000/svg" p-id="2338" width="30pt" height="30pt">*/}
                    {/*        <path*/}
                    {/*            d="M832 64H256C185.6 64 128 121.6 128 192v576c0 70.4 57.6 128 128 128h576c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128z m64 704c0 38.4-25.6 64-64 64H256c-38.4 0-64-25.6-64-64V192c0-38.4 25.6-64 64-64h576c38.4 0 64 25.6 64 64v576zM576 256h-64v192h-192v64h192v192h64v-192h192v-64h-192V256z"*/}
                    {/*            p-id="2339" fill="#ffffff"/>*/}
                    {/*    </svg>}*/}
                    {/*    selectedIcon={<svg t="1611997466374" className="icon" viewBox="0 0 1024 1024" version="1.1"*/}
                    {/*                       xmlns="http://www.w3.org/2000/svg" p-id="2338" width="30pt" height="30pt">*/}
                    {/*        <path*/}
                    {/*            d="M832 64H256C185.6 64 128 121.6 128 192v576c0 70.4 57.6 128 128 128h576c70.4 0 128-57.6 128-128V192c0-70.4-57.6-128-128-128z m64 704c0 38.4-25.6 64-64 64H256c-38.4 0-64-25.6-64-64V192c0-38.4 25.6-64 64-64h576c38.4 0 64 25.6 64 64v576zM576 256h-64v192h-192v64h192v192h64v-192h192v-64h-192V256z"*/}
                    {/*            p-id="2339" fill="#ffffff"/>*/}
                    {/*    </svg>}*/}
                    {/*    selected={selectedTab === 'add'}*/}
                    {/*    onPress={() => {*/}
                    {/*        this.props.history.push('add')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {this.renderContent()}*/}
                    {/*</TabBar.Item>*/}
                    {/*<TabBar.Item*/}
                    {/*    key="message"*/}
                    {/*    icon={<div style={{color: '#AAAAAA', fontSize: 14}}>消息</div>}*/}
                    {/*    selectedIcon={<div style={{color: '#FFFFFF', fontSize: 15}}>消息</div>}*/}
                    {/*    selected={selectedTab === 'message'}*/}
                    {/*    onPress={() => {*/}
                    {/*        this.props.history.push('message')*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    {this.renderContent()}*/}
                    {/*</TabBar.Item>*/}
                    <TabBar.Item
                        key="me"
                        icon={<div style={{color: '#AAAAAA', fontSize: 14}}>我的</div>}
                        selectedIcon={<div style={{color: '#FFFFFF', fontSize: 15}}>我的</div>}
                        selected={selectedTab === 'me'}
                        onPress={() => {
                            this.props.history.push('/me')
                        }}
                    >
                        {this.renderContent()}
                    </TabBar.Item>
                </TabBar>
            </div>
        );
    }
}

export default Index
