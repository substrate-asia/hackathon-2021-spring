import React from 'react'
import {List, Grid, Tabs, Card, Modal, Flex, TabBar, WingBlank, Button, WhiteSpace, Toast} from "antd-mobile";
import {api} from "../../services/api/ApiProvider";
import {withRouter} from 'react-router-dom';
import Background from './default.png';
import CustomIcon from './set.svg'
import manIcon from './man.svg'
import womenIcon from './women.svg'
import './me.css'
import 'animate.css'

const Item = List.Item;
const Brief = Item.Brief;
const alert = Modal.alert;


@withRouter
class Me extends React.Component {
    accountService = api.accountService;
    auctionService = api.auctionService;
    commodityService = api.commodityService;
    examService = api.examService;

    state = {
        data: [],
        avatarUrl: "",
        nickname: "",
        largeCoins: 0,
        follows: 0,
        intro: "",
        gender: "man",
        username: "",
        isPassExam: false,

        selectItem: 0,
        selectedTab: "0",
        showAnswerModal: false
    }

    async componentDidMount() {
        let res = await this.accountService.getUserInfo();
        await this.setState({
            avatarUrl: res.avatarUrl,
            nickname: res.nickname,
            gender: res.gender,
            intro: res.intro,
            username: res.username
        })
        res = await this.accountService.getUserAccount();
        await this.setState({
            largeCoins: res.largeCoins,
            follows: 10
        })
        const userExamRes = await this.examService.getUserExam();
        this.setState({
            isPassExam: userExamRes.isPass
        })
        this.getData();
    }

    showLogout = () => {
        alert('退出登录', '你确定要退出登录吗?', [
            {text: '取消', onPress: () => console.log('cancel'), style: 'default'},
            {
                text: '确定', onPress: () => {
                    localStorage.clear();
                    this.props.history.push('/login')
                }
            },
        ]);
    };

    topSectionStyle = {
        width: "100%",
        height: "219pt",
        backgroundImage: `url(${Background})`
    };

    meCardStyle = {
        borderWidth: 0, // Remove Border
        shadowColor: 'rgba(0,0,0, 0.0)', // Remove Shadow IOS
        background: 'rgba(0,0,0,0)',
        margin: '-10px 0px 0px 0',
        border: '0px solid #e8e8e8',
    }

    tabs = [
        // {title: '作品'},
        {title: '拍品'},
        // {title: '素材'},
    ];

    async getData() {
        if (this.state.selectItem === 0) {
            const thingRes = await this.auctionService.getOwnerArtworks(this.state.username);
            if (thingRes.thingItems) {
                let newItems = [];
                for (let i = 0; i < thingRes.thingItems.length; i++) {
                    newItems = newItems.concat({
                        id: thingRes.thingItems[i].id,
                        title: thingRes.thingItems[i].name,
                        imageUrl: thingRes.thingItems[i].url
                    })
                }
                await this.setState({
                    data: newItems
                })
            }
        } else if (this.state.selectItem === 1) {
            const thingRes = await this.auctionService.getFavoritesThings(0, parseInt(this.state.selectedTab));
            if (thingRes.thingItems) {
                let newItems = [];
                for (let i = 0; i < thingRes.thingItems.length; i++) {
                    newItems = newItems.concat({
                        title: thingRes.thingItems[i].name,
                        imageUrl: thingRes.thingItems[i].url
                    })
                }
                await this.setState({
                    data: newItems
                })
            }
        } else {
            const commodityRes = await this.commodityService.getFavoritesCommodities(0, parseInt(this.state.selectedTab));
            if (commodityRes.commodities) {
                let newItems = [];
                for (let i = 0; i < commodityRes.commodities.length; i++) {
                    newItems = newItems.concat({
                        title: commodityRes.commodities[i].title,
                        imageUrl: commodityRes.commodities[i].coverUrl
                    })
                }
                this.setState({
                    data: newItems
                })
            }
        }
    }

    render() {
        return (
            <div style={{height: '100%'}}>
                <Flex style={{height: '219pt'}}>
                    <Flex.Item align="center" style={this.topSectionStyle}>
                        <Flex>
                            <Flex.Item align="end">
                                <img style={{width: '20pt', height: '20pt', margin: '19px 17px 9px 0'}}
                                     src={CustomIcon} onClick={() => {
                                    this.showLogout();
                                }}/>
                            </Flex.Item>
                        </Flex>
                        <Flex margin='1px 10px 9px 0px'>
                            <Flex.Item align="start">
                                <Card style={this.meCardStyle}>
                                    <Card.Header
                                        title={<div className="cardTitle">
                                            <Flex>
                                                {this.state.nickname ? this.state.nickname : "暂未填写"}
                                                <Brief><img
                                                    style={{width: '12.5pt', height: '15pt', margin: '7px 0px 0px 7px'}}
                                                    src={this.state.gender === '女' || this.state.gender === '' ? womenIcon : manIcon}/></Brief>
                                            </Flex>
                                            <Flex>
                                                <div>
                                                    <span className="cardDirLeft">{this.state.follows}</span> <span
                                                    className="cardDirRight">关注</span>
                                                </div>
                                            </Flex>
                                        </div>
                                        }
                                        thumbStyle={{width: '100px', height: '100px', borderRadius: '50%'}}
                                        extra={
                                            this.state.isPassExam ?
                                                <div style={{
                                                    background: '#00CC00',
                                                    borderRadius: '20px',
                                                    marginRight: '-35px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    paddingTop: '10px',
                                                    paddingBottom: '10px',
                                                    textAlign: 'center',
                                                    marginLeft: '40px',
                                                    width: '150px',
                                                    float: 'right'
                                                }}
                                                     onClick={() => {
                                                         this.props.history.push("/answer")
                                                     }}
                                                >
                                                    会员答题已完成
                                                </div> :
                                                <div style={{
                                                    background: '#FFA200',
                                                    borderRadius: '20px',
                                                    marginRight: '-35px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    paddingTop: '10px',
                                                    paddingBottom: '10px',
                                                    textAlign: 'center',
                                                    marginLeft: '40px',
                                                    width: '150px',
                                                    float: 'right'
                                                }}
                                                     onClick={() => {
                                                         this.props.history.push("/answer")
                                                     }}
                                                >
                                                    参与会员答题
                                                </div>
                                        }
                                        thumb={this.state.avatarUrl && this.state.avatarUrl.length > 0 ?
                                            <img src={this.state.avatarUrl} style={{
                                                width: '45pt',
                                                height: '45pt',
                                                borderRadius: '50%'
                                            }}/> : <img
                                                src={"https://rongmei-common.oss-cn-beijing.aliyuncs.com/defaultUser.jpg"}
                                                style={{
                                                    width: '45pt',
                                                    height: '45pt',
                                                    borderRadius: '50%'
                                                }}/>
                                        }
                                        multipleLine
                                        // onClick={() => {
                                        //     this.props.history.push("/me/info")
                                        // }}
                                    />
                                    <Card.Body>
                                        <div
                                            className="cardIntro"> 个人介绍：{this.state.intro && this.state.intro.length > 0 ? this.state.intro : "这里可以是个人介绍也可以是个性签名"} </div>
                                        <div className="cardCoin">
                                            <span className="cardcoinz" style={{color: 'white'}}>积分余额:</span>
                                            <span
                                                className="cardCoins">{(this.state.largeCoins / 100).toLocaleString()}</span>
                                            <span className="IMM" style={{color: 'white'}}>电子</span>
                                        </div>
                                    </Card.Body>
                                    <Card.Footer
                                        content={<button className="button-tras"
                                                         onClick={() => {
                                                             this.props.history.push("/me/portal")
                                                         }}>交易凭证</button>}
                                        extra={<button className="button-rech"
                                                       onClick={() => {
                                                           this.props.history.push("/me/coin")
                                                       }}> 钱包</button>}/>
                                </Card>
                            </Flex.Item>
                        </Flex>
                    </Flex.Item>
                </Flex>
                <Flex className="footSection">
                    <Tabs tabs={this.tabs}
                          page={this.state.selectItem}
                          tabBarBackgroundColor='#000'
                          tabBarInactiveTextColor='#AAAAAA'
                          tabBarActiveTextColor='#FFFFFF'
                          tabBarTextStyle={{fontSize: '14px'}}
                          tabBarUnderlineStyle={{
                              borderColor: '#FFFFFF',
                              borderWidth: '0.1px',
                              borderRadius: '1pt',
                              marginBottom: '5px'
                          }}
                          animated={true}
                          useOnPan={false}
                          onChange={async (data, index) => {
                              await this.setState({
                                  selectItem: index
                              })
                              await this.getData();
                          }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            backgroundColor: '#000'
                        }}>

                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            backgroundColor: '#000'
                        }}>
                            <TabBar
                                style={{width: '100%'}}
                                unselectedTintColor="#949494"
                                tintColor="#33A3F4"
                                barTintColor="#000"
                                hidden={false}
                                tabBarPosition="top"
                            >
                                <TabBar.Item
                                    title={null}
                                    key="2"
                                    icon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '14px',
                                        color: '#AAAAAA'
                                    }}
                                    >在拍</div>
                                    }
                                    selectedIcon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#FFFFFF',
                                        borderRadius: '5px',
                                        paddingTop: '5px',
                                        paddingBottom: '5px',
                                        backgroundColor: '#FE0341',
                                    }}
                                    >在拍</div>}
                                    selected={this.state.selectedTab === '2'}
                                    onPress={async () => {
                                        await this.setState({
                                            selectedTab: '2',
                                        });
                                        await this.getData();
                                    }}
                                >
                                </TabBar.Item>
                                <TabBar.Item
                                    title={null}
                                    key="0"
                                    icon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#AAAAAA'
                                    }}
                                    >藏品</div>
                                    }
                                    selectedIcon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#FFFFFF',
                                        borderRadius: '5px',
                                        paddingTop: '5px',
                                        paddingBottom: '5px',
                                        backgroundColor: '#FE0341',
                                    }}
                                    >藏品</div>}
                                    selected={this.state.selectedTab === '0'}
                                    onPress={async () => {
                                        await this.setState({
                                            selectedTab: '0',
                                        });
                                        await this.getData();
                                    }}
                                >
                                </TabBar.Item>
                                <TabBar.Item
                                    title={null}
                                    key="1"
                                    icon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#AAAAAA'
                                    }}
                                    >喜欢</div>
                                    }
                                    selectedIcon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#FFFFFF',
                                        borderRadius: '5px',
                                        paddingTop: '5px',
                                        paddingBottom: '5px',
                                        backgroundColor: '#FE0341',
                                    }}
                                    >喜欢</div>}
                                    selected={this.state.selectedTab === '1'}
                                    onPress={async () => {
                                        await this.setState({
                                            selectedTab: '1',
                                        });
                                        await this.getData();
                                    }}
                                >
                                </TabBar.Item>
                            </TabBar>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            backgroundColor: '#000'
                        }}>
                            <TabBar
                                style={{width: '100%'}}
                                unselectedTintColor="#949494"
                                tintColor="#33A3F4"
                                barTintColor="#000"
                                hidden={false}
                                tabBarPosition="top"
                            >
                                <TabBar.Item
                                    title={null}
                                    key="0"
                                    icon={<div style={{
                                        width: '60px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '14px',
                                        color: '#AAAAAA'
                                    }}
                                    >已下载</div>
                                    }
                                    selectedIcon={<div style={{
                                        width: '60px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#FFFFFF',
                                        borderRadius: '5px',
                                        paddingTop: '5px',
                                        paddingBottom: '5px',
                                        backgroundColor: '#FE0341',
                                    }}
                                    >已下载</div>}
                                    selected={this.state.selectedTab === '0'}
                                    onPress={async () => {
                                        await this.setState({
                                            selectedTab: '0',
                                        });
                                        await this.getData();
                                    }}
                                >
                                </TabBar.Item>
                                <TabBar.Item
                                    title={null}
                                    key="1"
                                    icon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#AAAAAA'
                                    }}
                                    >喜欢</div>
                                    }
                                    selectedIcon={<div style={{
                                        width: '40px',
                                        marginLeft: '10px',
                                        marginRight: '10px',
                                        fontSize: '12px',
                                        color: '#FFFFFF',
                                        borderRadius: '5px',
                                        paddingTop: '5px',
                                        paddingBottom: '5px',
                                        backgroundColor: '#FE0341',
                                    }}
                                    >喜欢</div>}
                                    selected={this.state.selectedTab === '1'}
                                    onPress={async () => {
                                        await this.setState({
                                            selectedTab: '1',
                                        });
                                        await this.getData();
                                    }}
                                >
                                </TabBar.Item>
                            </TabBar>
                        </div>
                    </Tabs>
                </Flex>
                <Grid data={this.state.data}
                      columnNum={2}
                      renderItem={dataItem => (
                          <div style={{padding: '12.5px'}}
                               onClick={() => this.props.history.push(`detail/${dataItem.id}`)}>
                              <img src={dataItem.imageUrl} style={{width: '75px', height: '75px'}}
                                   alt=""/>
                              <div style={{color: '#888', fontSize: '14px', marginTop: '12px'}}>
                                  <span>{dataItem.title}</span>
                              </div>
                          </div>
                      )}
                />
                <Modal
                    // 强制答题对话框
                    visible={this.state.showAnswerModal}
                    style={{height: 150, width: 230,}}
                >
                    <div style={{fontSize: 15, padding: '10px 0', fontWeight: 600}}>请参与会员答题</div>
                    <WingBlank size='md'>
                        <div style={{fontSize: 12}}>该账号尚未完成会员答题，为了拥有更好的社区体验，请前往完成会员答题。</div>
                    </WingBlank>
                    <WhiteSpace size='xl'/>
                    <Flex justify='center'>
                        <Button className='answerBtn' onClick={() => {
                            this.props.history.push("/answer")
                        }}>前往答题</Button>
                    </Flex>
                </Modal>
            </div>
        )
    }
}

export default Me
