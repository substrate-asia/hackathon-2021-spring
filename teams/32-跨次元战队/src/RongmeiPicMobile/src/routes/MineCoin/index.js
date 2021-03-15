import React from 'react'
import {Button, Checkbox, Flex, InputItem, List, Modal, Toast, WhiteSpace, WingBlank} from "antd-mobile";
import {api} from '../../services/api/ApiProvider'
import './style.css'
import Header from "../../components/Header";
import {randomWord} from "../../utils/utils";

class MineCoin extends React.Component {
    accountService = api.accountService;
    moneyService = api.moneyService;

    state = {
        nearAccountId: '',
        payNum: '',
        coins: 0,
        disableWithDrawCoins: 0,
        earnestCoins: 0,
        userId: 0,
        username: '',
        // 变换自定义充值金额页面的显示
        showCustom: false,
        // 充值金额
        rechargeAmount: 0,
        // 充值金额模态框的显示
        showRechargeModal: false,
        // 确认充值对话框的显示
        showConfirmModal: false,

        // 微信支付复选框
        Check: true,
        body: ''
    }

    async componentDidMount() {
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
                        coins: userAccountRes.largeCoins,
                        disableWithDrawCoins: userAccountRes.disableWithDrawCoins,
                        earnestCoins: userAccountRes.earnestCoins
                    });
                }
            } else {
                this.createNearAccount(username, "chongxin_rongmei_" + randomWord(false, 6))
            }
        }
    }

    async createNearAccount(username, accountId) {
        let res = await this.accountService.createAccount(username, accountId);
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

    inputfocus() {

        // 防止软键盘遮挡input框，如果遇到BUG请删除！！！
        var x = document.getElementById('input1')
        this.setState({rechargeAmount: 0})
        console.log(x)
        // 防止软键盘遮挡input框，如果遇到BUG请删除！！！
        x.scrollIntoView()
    }

    async getAlipayQrcode() {
        const btnNode = "<input type='submit' value='立即支付' class='rechargeBtn'/>";
        console.log(this.state.totalAmount);
        let res = await this.accountService.postAlipay(this.state.rechargeAmount, window.location.href)
        let formNodes = res.body.split('\n');
        const formDom = formNodes[0] + '\n' + formNodes[1] + '\n' + btnNode + '\n</form>';
        this.setState({
            body: formDom
        })
    }

    render() {
        return (
            <div className='page' style={{
                height: window.innerHeight - 50
            }}>
                {/* 页面头部 */}

                <Header title={'钱包'} theme={{bgColor: 'black', title: 'white', mode: 'dark'}}>
                </Header>

                {/* 上下留白 */}
                <WhiteSpace size='xl'/>
                <WhiteSpace size='xl'/>

                {/* 页面主体 */}
                <WingBlank size='lg'>
                    <div style={{background: '#000', height: '80px', paddingTop: '30px'}}>
                        <span style={{color: 'white', fontSize: '16px', float: 'left', paddingLeft: '10px'}}>总余额</span>
                        <span style={{
                            color: '#FE2341',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            float: 'right',
                            paddingRight: '10px'
                        }}>{((this.state.coins + this.state.disableWithDrawCoins + this.state.earnestCoins) / 100).toLocaleString()} 电子</span>
                    </div>
                    <WhiteSpace size='lg'/>
                    <div style={{background: '#000', height: '80px', paddingTop: '30px'}}>
                        <span style={{color: 'white', fontSize: '16px', float: 'left', paddingLeft: '10px'}}>可提余额</span>
                        <span style={{
                            color: '#FE2341',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            float: 'right',
                            paddingRight: '10px'
                        }}>{(this.state.coins / 100).toLocaleString()} 电子</span>
                    </div>
                    <WhiteSpace size='lg'/>
                    <div style={{background: '#000', height: '80px', paddingTop: '30px'}}>
                        <span
                            style={{color: 'white', fontSize: '16px', float: 'left', paddingLeft: '10px'}}>竞拍保证金</span>
                        <span style={{
                            color: '#FE2341',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            float: 'right',
                            paddingRight: '10px'
                        }}>{(this.state.earnestCoins / 100).toLocaleString()} 电子</span>
                    </div>
                    <WhiteSpace size='lg'/>
                    <div style={{background: '#000', height: '80px', paddingTop: '30px'}}>
                        <span style={{
                            color: 'white',
                            fontSize: '16px',
                            float: 'left',
                            paddingLeft: '10px'
                        }}>限制场景余额</span>
                        <span style={{
                            color: '#FE2341',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            float: 'right',
                            paddingRight: '10px'
                        }}>{(this.state.disableWithDrawCoins / 100).toLocaleString()} 电子</span>
                    </div>
                    <WhiteSpace size='lg'/>
                    <WhiteSpace size='lg'/>
                    <WhiteSpace size='lg'/>
                    <div style={{height: '80px', paddingTop: '30px', textAlign: 'center'}}>
                        <a style={{
                            color: 'white',
                            fontSize: '18px',
                            borderRadius: '5px',
                            border: 'solid 0.6px',
                            padding: '5px',
                            paddingLeft: '25px',
                            paddingRight: '25px',
                            marginRight: '35px'
                        }}
                           href="http://pay.dimension.pub/#/home/withdraw"
                        >提现</a>
                        <a style={{
                            color: 'white',
                            fontSize: '18px',
                            borderRadius: '5px',
                            border: 'solid 0.6px',
                            padding: '5px',
                            paddingLeft: '25px',
                            paddingRight: '25px',
                            marginLeft: '35px',
                        }}
                            // href="http://pay.dimension.pub/#/home/withdraw"
                           onClick={() => {
                               this.setState({showRechargeModal: true})
                           }}
                        >充值</a>
                    </div>
                </WingBlank>
                {/* <WhiteSpace size='lg' /> */}
                {/* 充值选择金额对话框 */}
                <Modal
                    visible={this.state.showRechargeModal}
                    onClose={() => this.setState({showRechargeModal: false})}
                    title='充值'
                    className='modal-1'
                    // bodyStyle={{width:'100%',height:200,position:'absolute',bottom:0}}
                    style={{width: '100%', height: 265, position: 'absolute', bottom: 0,}}
                >
                    <WingBlank size='lg'>
                        <div>
                            <Flex justify='start'>
                                <div
                                    style={{fontSize: 12}}>当前余额：{((this.state.coins + this.state.disableWithDrawCoins + this.state.earnestCoins) / 100).toLocaleString()} 电子
                                </div>
                            </Flex>
                        </div>
                        <WhiteSpace size='lg'/>

                        <div>
                            <Flex justify='between' align='center' wrap='wrap'>
                                {/* 这里后续有条件可以使用react的classnames库简化代码！！！ */}
                                <div className='coinsItem' onClick={() => {
                                    this.setState({rechargeAmount: 1})
                                }}>1电子
                                    <div className='childText'>
                                        1元
                                    </div>
                                </div>
                                <div className='coinsItem' onClick={() => {
                                    this.setState({rechargeAmount: 9.9})
                                }}>10电子
                                    <div className='childText'>
                                        9.9元
                                    </div>
                                </div>
                                <div className='coinsItem' onClick={() => {
                                    this.setState({rechargeAmount: 49})
                                }}>50电子
                                    <div className='childText'>
                                        49元
                                    </div>
                                </div>
                                <div className='coinsItem' onClick={() => {
                                    this.setState({rechargeAmount: 100})
                                }}>100电子
                                    <div className='childText'>
                                        98元
                                    </div>
                                </div>
                                <div className='coinsItem' onClick={() => {
                                    this.setState({rechargeAmount: 490})
                                }}>500电子
                                    <div className='childText'>
                                        490元
                                    </div>
                                </div>
                                {
                                    this.state.showCustom === false ?
                                        <div className='coinsItem' onClick={(e) => {
                                            this.setState({showCustom: true})
                                        }}>
                                            自定义
                                            <div className='childText'>
                                                输入金额
                                            </div>
                                        </div>
                                        :
                                        <div className='coinsItem' onBlur={() => {
                                            this.setState({showCustom: false})
                                        }} onClick={(e) => {
                                            this.setState({showCustom: true})
                                        }}>
                                            {/* InputItem 必须用 List 组件包裹才能正常使用！！！ */}
                                            <List>
                                                <InputItem
                                                    id='input1'
                                                    type='number'
                                                    autoFocus='autofocus'
                                                    maxLength={10}
                                                    autoAdjustHeight={true}
                                                    defaultValue={0}
                                                    value={this.state.rechargeAmount}
                                                    onFocus={() => this.inputfocus()}

                                                    onChange={(value) => {
                                                        this.setState({rechargeAmount: parseInt(value) || 0}, () => {
                                                            console.log(this.state.rechargeAmount)
                                                        })
                                                    }}
                                                />
                                            </List>

                                            <div className='childText'
                                                 style={{marginTop: '3px', textOverflow: 'ellipsis'}}>
                                                {this.state.rechargeAmount}元
                                            </div>
                                        </div>
                                }

                            </Flex>
                        </div>

                        {/* 立即充值按钮 */}
                        <div>
                            <Button className='rechargeBtn' onClick={() => {
                                this.setState({showConfirmModal: true})
                            }}>立即充值</Button>
                        </div>
                        <WhiteSpace size='sm'/>
                        <Flex justify='center'>
                            <div style={{fontSize: 12}}>充值即代表阅读并同意</div>
                            <div style={{fontSize: 12, color: '#DFDD40'}} onClick={() => {
                                console.log("页面跳转到用户充值协议")
                            }}>《用户充值协议》
                            </div>
                        </Flex>
                        <WhiteSpace size='sm'/>
                    </WingBlank>

                </Modal>
                {/* 充值选择金额对话框结束 */}

                {/* 充值支付页面 */}
                <Modal
                    visible={this.state.showConfirmModal}
                    // title='充值'
                    style={{width: '100%', height: 265, position: 'absolute', bottom: 0,}}
                    maskClosable={false}
                    closable
                    onClose={() => {
                        this.setState({showConfirmModal: false})
                    }}
                >
                    <WingBlank size='lg'>
                        <WhiteSpace size='lg'/>
                        <WhiteSpace size='md'/>
                        <div>
                            <Flex justify='center'>
                                <div style={{fontSize: 25, fontWeight: 600,}}>{'¥' + this.state.rechargeAmount}</div>
                            </Flex>
                            <Flex justify='center'>
                                {/* 这里后续需要根据平台充值优惠政策修改 */}
                                <div style={{fontSize: 13, fontWeight: 600,}}>{this.state.rechargeAmount + '电子'}</div>
                            </Flex>
                        </div>
                        <WhiteSpace size='lg'/>

                        <div style={{borderTop: '2px solid #333333'}}>
                            <WhiteSpace size='sm'/>
                            {/*<Flex justify='center' onClick={() => {*/}
                            {/*    this.setState({Check: true})*/}
                            {/*}}>*/}
                            {/*    <div style={{height: 50, width: '100%'}}>*/}
                            {/*        <Flex justify='around'>*/}
                            {/*            <Flex justify='start'*/}
                            {/*                  style={{width: '40%', color: 'white', fontSize: 15, fontWeight: 600}}>*/}
                            {/*                <div className='wechatIcon'/>*/}
                            {/*                <div style={{height: 50, lineHeight: '50px', paddingLeft: 20}}>微信支付</div>*/}
                            {/*            </Flex>*/}
                            {/*            <Flex justify='end'*/}
                            {/*                  style={{width: '40%', color: 'white', fontSize: 15, fontWeight: 600,}}>*/}
                            {/*                <Checkbox checked={this.state.Check} onChange={(e) => {*/}
                            {/*                    this.setState({Check: true})*/}
                            {/*                }}/>*/}
                            {/*            </Flex>*/}
                            {/*        </Flex>*/}
                            {/*    </div>*/}
                            {/*</Flex>*/}
                            <Flex justify='center' onClick={() => {
                                this.setState({Check: false})
                                this.getAlipayQrcode();
                            }}>
                                <div style={{height: 50, width: '100%'}}>
                                    <Flex justify='around'>
                                        <Flex justify='start'
                                              style={{width: '40%', color: 'white', fontSize: 15, fontWeight: 600}}>
                                            <div className='alipayIcon'/>
                                            <div style={{height: 50, lineHeight: '50px', paddingLeft: 20}}>支付宝支付</div>
                                        </Flex>
                                        <Flex justify='end'
                                              style={{width: '40%', color: 'white', fontSize: 15, fontWeight: 600,}}>
                                            <Checkbox checked={!(this.state.Check)} onChange={(e) => {
                                                this.setState({Check: false})
                                            }}/>
                                        </Flex>
                                    </Flex>
                                </div>
                            </Flex>
                        </div>
                        <WhiteSpace size='sm'/>
                        {/* 这里的支付方式可以通过this.state.Check来获得，true时为微信支付，false时为支付宝支付，如后续增加 */}
                        <div dangerouslySetInnerHTML={{__html: this.state.body}}/>
                    </WingBlank>

                </Modal>
                {/* 充值支付页面结束 */}

            </div>
        )
    }
}

export default MineCoin
