import React from 'react'
import {Button, Flex, InputItem, Toast, WingBlank, WhiteSpace} from 'antd-mobile'
import './style.css'
import {withRouter} from 'react-router-dom'
import 'animate.css'
import {api} from '../../services/api/ApiProvider'

@withRouter
class Login extends React.Component {
    accountService = api.accountService;

    state = {
        loading: false,
        value: '',
        hasError: true,
        code: ''

    }

    onErrorClick = () => {
        if (this.state.hasError) {
            Toast.info('电话号码格式不正确');
        }
    }
    onChange = (value) => {
        if (value.replace(/\s/g, '').length < 11) {
            this.setState({
                hasError: true,
            });
        } else {
            this.setState({
                hasError: false,
            });
        }
        this.setState({
            value,
        });
    }

    onChange2 = (value) => {
        if (value.length <= 6) {
            this.setState({
                code: value
            });
        }

    }

    componentDidMount() {
        const isLogin = localStorage.getItem('token') && localStorage.getItem('token').length > 0;
        if (isLogin) {
            this.props.history.push('/home')
        }
    }

    async getCaptcha() {
        try {
            const phone = this.state.value.replace(/\s+/g, '');
            await this.accountService.sendCaptcha({
                phone: phone
            })
            Toast.success('验证码发送成功', 1);
        } catch (e) {
            Toast.info('验证码发送失败，请重试', 1);
        }
    }

    async login() {
        console.log(123)
        try {
            const res = await this.accountService.login({
                phone: this.state.value.replace(/\s+/g, ''),
                captcha: this.state.code
            })
            localStorage.setItem('token', res.token);
            Toast.success('登录成功', 1);
            this.props.history.push('/home')
        } catch (e) {
            Toast.info('验证码错误，请重试', 1);
        }
    }

    render() {
        return (
            <div id='login-page' style={{}}>
                <div style={{backgroundColor: 'rgba(0,0,0,0.6)', height: '100VH',}}>
                    <Flex justify='center' style={{paddingTop: '30%'}}>
                        <h1 style={{color: 'white',}}>登录</h1>
                    </Flex>

                    {/* <div style={{ marginLeft: '30px', marginTop: '50px' }}>
          <h1>登录</h1>
          <p><span style={{ color: "#8D8C8F" }}>请阅读</span><a style={{ color: '#6387f6' }}
            href={"http://www.dimension.hub"}> 跨次元用户协议</a></p>
              </div> */}
                    <div>
                        <WingBlank size="lg" style={{marginTop: '30px', margin: '30px'}}>
                            <Flex justify='center'>
                                <Flex.Item style={{
                                    flex: 2,
                                    fontSize: 14,
                                    color: 'white',
                                    paddingRight: 20,
                                    fontWeight: 'bold'
                                }}>账号</Flex.Item>
                                <Flex.Item style={{flex: 8}}>
                                    <InputItem
                                        type="phone"
                                        placeholder="请输入手机号或邮箱"
                                        error={this.state.hasError}
                                        onErrorClick={this.onErrorClick}
                                        onChange={this.onChange}
                                        value={this.state.value}
                                        // ref={el => this.inputRef = el}
                                        // width={300}
                                    >
                                        {/* <div style={{ textAlign: 'center', width: '70%' }}>+86</div> */}
                                    </InputItem>
                                </Flex.Item>
                            </Flex>

                            {/* 上下留白 */}
                            <WhiteSpace size="xl"/>
                            <WhiteSpace size="md"/>

                            <Flex justify='center'>
                                <Flex.Item style={{
                                    flex: 2,
                                    fontSize: 14,
                                    color: 'white',
                                    paddingRight: 20,
                                    fontWeight: 'bold'
                                }}>验证码</Flex.Item>
                                <Flex.Item style={{flex: 5}}>
                                    <InputItem
                                        type="digit"
                                        // type='text'
                                        value={this.state.code}
                                        placeholder="验证码"
                                        maxLength={6}
                                        onChange={(value) => this.onChange2(value)}
                                    />
                                </Flex.Item>
                                <Flex.Item style={{alignSelf: 'center', flex: 3}}>
                                    <Button type="warning"
                                            style={{height: '35px', lineHeight: '35px', fontSize: '12px',}}
                                            disabled={this.state.hasError} onClick={() => {
                                        this.getCaptcha()
                                    }} focused>获取验证码</Button>
                                </Flex.Item>
                            </Flex>
                            {/* 留白 */}
                            <WhiteSpace size="xl"/>
                            <WhiteSpace size="xl"/>

                            <Flex justify='center'>
                                <div style={{alignSelf: 'center'}}>
                                    <Button type="warning" style={{
                                        width: '270px',
                                        height: 35,
                                        lineHeight: '35px',
                                        fontSize: 18,
                                        fontWeight: 500
                                    }}
                                            onClick={() => {
                                                this.login()
                                            }} focused>登录</Button>
                                </div>
                            </Flex>
                        </WingBlank>
                    </div>
                    <div style={{
                        width: '100%',
                        position: 'absolute',
                        textAlign: 'center',
                        bottom: '20px',
                        color: "#8D8C8F",
                        fontWeight: 600
                    }}>跨次元内容资产交易平台
                    </div>
                </div>
            </div>
        )
    }
}

export default Login
