import React, {Component} from 'react';
import  MainContentCSS from './MainContent.module.css'
import { Button,Carousel,Menu,List,Image} from 'antd';
import GongGao from '../../images/GongGao.png'
import Images5 from '../../images/5.jpg'
import Images6 from '../../images/6.jpg'
import Images7 from '../../images/7.png'
import Images8 from '../../images/8.jpg'
import ChartArea from "../ChartArea";
import ChartAreaTabs from "../ChartAreaTabs";

// 更换video地址
const video = "//player.bilibili.com/player.html?aid=627693112&bvid=BV1Wt4y1e7kB&cid=253590920&page=1"

const listdata = [
    {
        title: '2027年我看你又厉害了',
    },
    {
        title: '2026年我看你又厉害了',
    },
    {
        title: '2025年我看你又厉害了',
    },
    {
        title: '2024年我看你又厉害了',
    },
    {
        title: '2023年我看你又厉害了',
    },
    {
        title: '2022年我看你又厉害了',
    },
    {
        title: '2021年我看你又厉害了',
    },
];




class MainContent extends Component {

    render() {
        return (
            <div>
                {/*//上部分背景*/}
                <div  className={MainContentCSS.background}>
                {/*两个大按钮*/}
                    <Button  type="primary" className={MainContentCSS.StartGame}>开始游戏</Button><br/>
                    <Button  className={MainContentCSS.DownloadGame}>下载游戏</Button>
                {/*轮播图*/}
                    <Carousel style={{margin:'-300px 0 0 -75px'}} autoplay effect="fade">
                    <div>
                        <h3 className={MainContentCSS.images1}>.</h3>
                    </div>
                    <div>
                        <h3 className={MainContentCSS.images2}>.</h3>
                    </div>
                    <div>
                        <h3 className={MainContentCSS.images3}>.</h3>
                    </div>
                    <div>
                        <h3 className={MainContentCSS.images4}>.</h3>
                    </div>
                    </Carousel>
                    {/*列表菜单选项*/}
                    <Menu  className={MainContentCSS.config} selectable={false}>
                        <Menu.Item style={{margin:'0px 0 0 16px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="hot">热门</Menu.Item>
                        <Menu.Item style={{margin:'-40px 0 0 68px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="new">新闻</Menu.Item>
                        <Menu.Item style={{margin:'-40px 0 0 120px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="notice">公告</Menu.Item>
                        <Menu.Item style={{margin:'-40px 0 0 172px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="activity">活动</Menu.Item>
                        <Menu.Item style={{margin:'-40px 0 0 224px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="community">社区</Menu.Item>
                        <Menu.Item style={{margin:'-40px 0 0 276px',padding:'0',borderBottom:'1px solid black'}} className={MainContentCSS.size} key="other">...</Menu.Item>
                    </Menu>
                    {/*大标题公告*/}
                    <div  style={{margin:'-250px 0 0 1210px',width:'310px',height:'36px',backgroundColor:'#414046',color:'#f3c258',textAlign:'center',lineHeight:'36px'}}>1月31日体验服停机更新公告</div>
                    {/*轮播图右侧列表公告*/}
                    <List
                    itemLayout="horizontal"
                    split={false}
                    dataSource={listdata}
                    renderItem={item => (
                        <List.Item style={{margin:'5px 0 0 1220px',width:'270px',height:'20px'}} >
                            <List.Item.Meta  title={<a style={{color:'#b8b9c5'}} href="https://ant.design"><img src={GongGao} alt=""/>&nbsp;&nbsp;{item.title}</a>}/>
                        </List.Item>
                    )}
                    />
                    {/*四张图*/}
                    <Image style={{width: '290px',height:'134px',margin:'136px 0 0 358px'}}  src={Images5} preview={false}/>
                    <Image style={{width: '290px',height:'134px',marginLeft:'6px'}}  src={Images6} preview={false}/>
                    <Image style={{width: '290px',height:'134px',marginLeft:'6px'}}  src={Images7} preview={false}/>
                    <Image style={{width: '290px',height:'134px',marginLeft:'6px'}}  src={Images8} preview={false}/>
                </div>
                {/*视频或直播间*/}
                <iframe  style={{border:'0px'}} title={'bi'} width={1900} height={680} scrolling="no" frameBorder="no"  src={video}></iframe>
                <br/>
                {/*图标区域*/}
                <div className={MainContentCSS.ChartArea}>
                    <h2 className={MainContentCSS.TextTitle}>数据浏览</h2>
                    <h3 className={MainContentCSS.TextContent}>深海猎手的日常数据都会同步公布在官方网页供玩家查询观看</h3>
                    {/*图表切换标签*/}
                    <ChartAreaTabs/>
                    {/*图表*/}
                    <ChartArea/>
                </div>
            </div>
        );
    }
}

export default MainContent;
