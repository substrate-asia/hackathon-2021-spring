import React from 'react'
import './style.css'
import Header from '../../components/Header/index'
import {
    Flex,
    WhiteSpace,
    WingBlank,
    Picker,
    List,
    Icon,
    Button,
    InputItem,
    TextareaItem,
    Modal,
    Toast,
    Checkbox,
    DatePicker
} from 'antd-mobile';
import {api} from "../../services/api/ApiProvider";
import {randomWord} from "../../utils/utils";

const {alert} = Modal;

class Portal extends React.Component {
    tccService = api.tccService;
    accountService = api.accountService;
    auctionService = api.auctionService;
    balanceService = api.balanceService;

    state = {
        currentIndex: '1',
        price: 0,
        // 藏品选择器中的内容
        // 数组中包裹键值对，如果需要选择两列数据，则格式为：[[{}],[{}]]
        collectionData: [],

        receiveData: [
            {
                seller: 'seller1',
                address: 'seller1Adderss1'
            },
            {
                seller: 'seller2',
                address: 'seller1Adderss2'
            },
            {
                seller: 'seller3',
                address: 'seller1Adderss3'
            },
            {
                seller: 'seller4',
                address: 'seller1Adderss4'
            },
            {
                seller: 'seller5',
                address: 'seller1Adderss5'
            },

        ],
        // 用户需要选择的列数
        cols: 1,
        // 用户最终选择的value
        thingName: '',
        thing: {},
        // 转移藏品花费的金额
        cost: 0,
        // 转移对象的手机号码
        // 生产环境下初始化为''
        // 在render中或生命周期函数中将中间四位替换为'*'
        phoneNumber: ''
    }

    async componentDidMount() {
        const tccRes = await this.tccService.getTCC("rongmei.pic.transfer_gas");
        if (tccRes.tccTuple.value) {
            this.setState({
                cost: parseInt(tccRes.tccTuple.value)
            })
        }
        const thingsRes = await this.auctionService.getMineThings();
        let collectionData = [];
        for (let i = 0; i < thingsRes.thingItems.length; i++) {
            collectionData = collectionData.concat({
                label: thingsRes.thingItems[i].name,
                value: thingsRes.thingItems[i].id
            })
        }
        this.setState({
            collectionData
        });
        let res = await this.accountService.getUserBase();
        if (res.phone) {
            this.setState({
                username: res.phone,
                userId: res.id,
            });
            let username = res.phone;
            res = await this.accountService.getUserBasisSecurity();
            if (res.nearAccountId) {
                this.setState({
                    nearAccountId: res.nearAccountId,
                });
                const userAccountRes = await this.accountService.getUserAccount();
                if (userAccountRes.largeCoins) {
                    this.setState({
                        price: userAccountRes.largeCoins + userAccountRes.disableWithDrawCoins
                    });
                }
            } else {
                this.createNearAccount(username, "chongxin_rongmei_" + randomWord(false, 6))
            }
        }
    }

    async createNearAccount(username, accountId) {
        let res = await this.balanceService.createAccount(username, accountId);
        console.log(res)
        res = await this.accountService.getUserBasisSecurity();
        if (res.nearAccountId) {
            this.setState({
                nearAccountId: res.nearAccountId,
            });
            const userAccountRes = await this.accountService.getUserAccount();
            if (userAccountRes.largeCoins) {
                this.setState({
                    coins: userAccountRes.largeCoins,
                });
            }
        }
    }

    clickTabBtn(e) {
        console.log(e.currentTarget.getAttribute('data-index'))
        this.setState({
            currentIndex: e.currentTarget.getAttribute('data-index')
        })
    }

    async transfer() {
        alert('确认转移', `你确定要转移此藏品吗`, [
            {
                text: '取消', onPress: async () => {
                    Toast.fail("转移失败");
                }, style: 'default'
            },
            {
                text: '确定', onPress: async () => {
                    this.setState({
                        loading: true
                    })
                    if (this.state.price < this.state.cost) {
                        Toast.fail("积分不够，请先充值")
                        return
                    }
                    if (!this.state.thing || this.state.thingId.length === 0) {
                        Toast.fail("请先选择藏品")
                        return
                    }
                    if (this.state.phoneNumber.length === 0) {
                        Toast.fail("请先输入目标用户名")
                        return
                    }
                    const discountRes = await this.accountService.consumeDiscount(this.state.cost);
                    console.log(discountRes.infoCode)
                    if (discountRes.infoCode === 10000) {
                        Toast.success("地址转移费扣除成功")
                        Toast.info("藏品转移中...")
                        try {
                            const transferRes = await this.balanceService.transfer(this.state.username, this.state.phoneNumber, this.state.thing.tokenId);
                            if (transferRes.infoCode === 10000) {
                                Toast.success("转移成功")
                            } else {
                                Toast.fail("转移失败")
                            }
                        } catch (e) {
                            Toast.fail("转移失败")
                        }
                    }
                    this.setState({
                        loading: false
                    })
                }
            },
        ])
    }

    render() {
        // const phoneNumber = this.state.phoneNumber.substr(0, 3) + '****' + this.state.phoneNumber.substr(7);
        return (
            <div className='page'>
                <Header title='传送门' theme={{mode: 'dark'}}/>
                <WhiteSpace size='lg'/>
                {/* 导航按钮 */}
                <WingBlank size='lg'>
                    <Flex justify='around' className='tabHeader'>
                        {/* eslint-disable-next-line eqeqeq */}
                        <Button className={['tabBtn', this.state.currentIndex === '1' ? 'tabBtn-click' : ''].join(' ')}
                                activeClassName='tabBtn-click' data-index='1'
                                onClick={(e) => this.clickTabBtn(e)}>购买地址交易积分</Button>
                        {/*<Button className={['tabBtn', this.state.currentIndex === '2' ? 'tabBtn-click' : ''].join(' ')}*/}
                        {/*        activeClassName='tabBtn-click' data-index='2'*/}
                        {/*        onClick={(e) => this.clickTabBtn(e)}>转移</Button>*/}
                        {/*<Button className={['tabBtn', this.state.currentIndex === '3' ? 'tabBtn-click' : ''].join(' ')}*/}
                        {/*        activeClassName='tabBtn-click' data-index='3'*/}
                        {/*        onClick={(e) => this.clickTabBtn(e)}>接收</Button>*/}
                    </Flex>
                </WingBlank>
                {/* 导航按钮结束 */}

                <WhiteSpace size='lg'/>

                {/* 购买地址交易积分内容显示 */}
                {this.state.currentIndex === '1' &&
                <div>
                    <WingBlank size='lg'>
                        <Flex justify='center' direction='column'>
                            <WhiteSpace size='xl'/>
                            <div className='icon'/>
                            <WhiteSpace size='xl'/>
                            <div style={{fontSize: 13}}>您的地址交易积分余额：{(this.state.price / 100).toLocaleString()}电子</div>
                        </Flex>
                        <WhiteSpace size='xl'/>
                        <WhiteSpace size='xl'/>
                        <Flex justify='around'>
                            <Flex justify='around'>
                                <div style={{fontSize: 12, width: 120}}>选择你要转移的藏品：</div>
                                <Picker
                                    data={this.state.collectionData}
                                    extra={'请选择藏品'}
                                    cols={this.state.cols}
                                    value={this.state.thingId}
                                    onChange={(value) => {
                                        this.setState({
                                            thingId: value
                                        }, async () => {
                                            let res = await this.auctionService.getThing(this.state.thingId)
                                            this.setState({
                                                thing: res,
                                                thingName: res.name
                                            })
                                        })
                                    }}
                                    title='选择藏品'
                                >
                                    <List.Item arrow='down'/>
                                </Picker>
                            </Flex>
                        </Flex>
                        <WhiteSpace size='lg'/>
                        <Flex justify='around'>
                            <Flex justify='around'>
                                <div style={{fontSize: 12, width: 120, textAlign: 'center'}}>藏品转移至：</div>
                                {/* 这里的phoneNumber已经在render中处理过 */}
                                <InputItem value={this.state.phoneNumber} placeholder={"请填写完整的用户名（手机号）"}
                                           onChange={(value => this.setState({
                                               phoneNumber: value
                                           }))}/>
                            </Flex>
                        </Flex>
                        <WhiteSpace size='lg'/>
                        <WhiteSpace size='lg'/>

                        <Flex justify='center' align='end'>
                            <div style={{display: 'flex', flexDirection: 'row',}}>
                                <div style={{fontSize: 15, fontWeight: 600, height: 25, lineHeight: '25px'}}>需花费：</div>
                                <div style={{
                                    fontSize: 25,
                                    fontWeight: 600,
                                }}>{(this.state.cost / 100).toLocaleString()}</div>
                                <div style={{fontSize: 15, fontWeight: 600, height: 25, lineHeight: '25px'}}>电子</div>
                            </div>
                        </Flex>
                        <WhiteSpace size='lg'/>

                        {
                            this.state.price < this.state.cost ? (
                                <Flex justify='center' align='center' direction='column'>
                                    <div style={{fontSize: 12, fontWeight: 600, color: '#FE2341'}}>
                                        您的积分余额不足，请及时购买
                                    </div>
                                    <WhiteSpace size='lg'/>
                                    <WhiteSpace size='lg'/>

                                    <Button className='rechargeBtn' style={{width: 150,}} onClick={() => {
                                        this.props.history.push(`/me/coin`);
                                    }}>立即购买</Button>
                                </Flex>) : <Flex justify='center'>
                                <Button className='rechargeBtn' style={{width: 150,}} onClick={() => {
                                    this.transfer();
                                }}>立即转移</Button>
                            </Flex>
                        }

                    </WingBlank>
                </div>
                }
                {/* 购买地址交易积分内容显示结束 */}


                {/* 转移 内容显示 */}
                {this.state.currentIndex === '2' &&
                <div style={{paddingTop: '30%'}}>
                    <WingBlank size='lg'>
                        <Flex direction='column' justify='center'>
                            <div>
                                <Flex justify='around'>
                                    <Flex justify='around'>
                                        <div style={{fontSize: 12, width: 120, textAlign: 'center'}}>转移藏品：</div>
                                        <Picker
                                            data={this.state.collectionData}
                                            extra={'请选择藏品'}
                                            value={this.state.thingName}
                                            onChange={(value) =>
                                                this.setState({
                                                    thingId: value
                                                }, async () => {
                                                    let res = await this.auctionService.getThing(this.state.thingId)
                                                    this.setState({
                                                        thing: res,
                                                        thingName: res.name
                                                    })
                                                })
                                            }
                                            title='选择藏品'
                                        >
                                            <List.Item arrow='down'/>
                                        </Picker>
                                    </Flex>
                                </Flex>

                                <WhiteSpace size='lg'/>
                                <WhiteSpace size='lg'/>

                                <Flex justify='around'>
                                    <Flex justify='around'>
                                        <div style={{fontSize: 12, width: 120, textAlign: 'center'}}>转移至：</div>
                                        <Picker
                                            data={this.state.addressData}
                                            extra={'请选择地址'}
                                            cols={this.state.cols}
                                            value={this.state.addressValue}
                                            // onPickerChange={(e) => { this.setState({ pickValue: e }) }}
                                            // 在onOK后显示手机号码
                                            onOk={(e) => {
                                                this.setState({addressValue: e})
                                            }}
                                            onDismiss={(e) => {
                                                this.setState({addressValue: ''})
                                            }}
                                            title='选择地址'
                                        >
                                            <List.Item arrow='down'/>
                                        </Picker>
                                    </Flex>
                                </Flex>

                                <WhiteSpace size='lg'/>
                                <WhiteSpace size='lg'/>

                                <Flex justify='around'>
                                    <Flex justify='around'>
                                        <div style={{fontSize: 12, width: 120, textAlign: 'center'}}>手机号：</div>
                                        {/* 这里的phoneNumber已经在render中处理过 */}
                                        <InputItem disabled value={this.state.phoneNumber}/>
                                    </Flex>
                                </Flex>

                                <WhiteSpace size='lg'/>
                                <WhiteSpace size='lg'/>

                                <Flex justify='center'>
                                    <Button className='rechargeBtn' style={{width: 150,}} onClick={() => {
                                        this.transfer();
                                    }}>立即转移</Button>
                                </Flex>
                            </div>

                        </Flex>
                    </WingBlank>
                </div>
                }
                {/* 转移 内容显示结束 */}


                {/* 接收 内容显示 */}
                {this.state.currentIndex === '3' &&
                <div>
                    <WingBlank size='lg'>
                        <Flex direction='column' justify='center'>
                            <div style={{width: '100%'}}>
                                <List>
                                    {
                                        this.state.receiveData.map((item, index) =>
                                            <List.Item
                                                multipleLine={true}
                                                wrap={true}
                                                style={{width: '100%', borderRadius: 0, fontSize: '12px',}} key={index}
                                            >
                                                <div>
                                                    <div style={{
                                                        width: '100%',
                                                        borderRadius: 0,
                                                        fontSize: '12px',
                                                        textOverflow: 'ellipsis',
                                                        border: 'none'
                                                    }}>
                                                        {/* 这里根据需要可以进行藏品详情与转移方信息 的 页面跳转 */}
                                                        您接收到来自{<span className='receiveSpan' onClick={() => {
                                                        console.log(item.seller)
                                                    }}>{item.seller}</span>}的藏品：{<span className='receiveSpan'
                                                                                       onClick={() => {
                                                                                           console.log(item.address)
                                                                                       }}>{item.address}</span>}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    width: '100%',
                                                    borderRadius: 0,
                                                    fontSize: '12px',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    已为您自动存入拍品存证
                                                </div>
                                            </List.Item>
                                        )
                                    }
                                </List>

                            </div>
                        </Flex>
                    </WingBlank>
                </div>
                }
                {/* 接收 内容显示结束 */}


            </div>
        )
    }

}

export default Portal
