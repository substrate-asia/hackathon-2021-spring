import React, {Component} from 'react';
import TopHeaderCSS from './TopHeader.module.css'
import logo from '../../images/web3game-logo-horizontal-white.svg'
import logo2 from '../../images/web3game-logo-horizontal-black.svg'
import { Layout,Image,Menu} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {Link,Route} from "react-router-dom";
import Register from "../Register";
import About from "../About";

// import Pocket from "../Pocket";

const { Header} = Layout;


class TopHeader extends Component {

    render() {
        return (
            <div>
            <Layout className="layout">
                <Header style={{height:'42px',backgroundColor:'rgba(255, 255, 255)'}}>
                    <Image style={{marginLeft:'500px'}} width={200} height={42} preview={false} src={logo2}/>
                </Header>
                <Header style={{height:'84px',backgroundColor:'rgba(18, 18, 23)'}}>
                    <Image style={{marginLeft:'350px'}} width={200} height={84} preview={false} src={logo}/>
                    <Menu style={{marginTop:'-111px',marginLeft:'550px',backgroundColor:'rgba(18, 18, 23)'}} theme="dark" mode="horizontal">
                        <Menu.Item className={TopHeaderCSS.size} key="1">游戏资料</Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="2">新闻快讯</Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="3">活动专区</Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="4">社区交流</Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="5">玩家设计</Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="6"><a href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot.elara.patract.io#/settings">查询服务</a></Menu.Item>
                        <Menu.Item className={TopHeaderCSS.size} key="7">其他游戏</Menu.Item>
                        <SearchOutlined style={{fontSize:'30px',width:'55px'}} />
                        <Menu.Item className={TopHeaderCSS.size} key="8"><Link to='/login'>登陆注册</Link></Menu.Item>
                        <Route path='/login' component={Register}/>
                        <Route path='/test' component={About}/>
                    </Menu>
                </Header>
            </Layout>
            </div>
        );
    }
}

export default TopHeader;



