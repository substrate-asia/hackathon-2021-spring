import React,{Component} from 'react';
import {  message, Space } from 'antd';
import ProForm,{ ModalForm, ProFormText} from '@ant-design/pro-form';
import { UnlockOutlined,MobileTwoTone} from '@ant-design/icons';
import {Link, RouteComponentProps} from "react-router-dom";
import axios from "axios";
import  logo from '../../images/logo.svg'


interface IProps {}

type HomeProps = IProps & RouteComponentProps;

interface IState {}


const waitTime = (values:any,time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            //看看手机号咋样
            if (values.loginValues.length === 11){
            let data = {
                "phone_number":values.loginValues,
                "password":values.password,
            }
            axios({
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                url: '/login2',
                data: JSON.stringify(data)
            })
            .then(function (response) {
                message.success('登陆成功').then(r => console.log(response));
            })
            .catch(function (error) {
            message.error('登陆失败').then(r => console.log(error));
            });
            resolve(true);
            }
            //看看UUID行不行
            else if (values.loginValues.length === 12){
                let data = {
                    "uuid":values.loginValues,
                    "password":values.password,
                }
                axios({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'post',
                    url: '/login1',
                    data: JSON.stringify(data)
                })
                    .then(function (response) {
                        message.success('登陆成功').then(r => console.log(response));
                    })
                    .catch(function (error) {
                        message.error('登陆失败').then(r => console.log(error));
                    });
                resolve(true);
            }
            //匹配都不好使就拜拜了您讷
            else{
                message.error('登陆失败').then(r => console.log('有问题'));
                resolve(true);
            }
        }, time);

    });
};

class Register extends Component<HomeProps,IState> {

    private jump = () => {
        this.props.history.push('/');
    }
    render(){
        return (
        <Space>
            <ModalForm
                // width={800}
                title="用户登录"
                visible={true}
                modalProps={{
                    onCancel:this.jump
                }}
                submitter={{
                    resetButtonProps: {
                        style: {
                            display: 'none',
                        },
                    },
                    submitButtonProps: {
                        style: {
                            display: 'none',
                        },
                    },
                }}
            >
                <div>
                    <ProForm
                        // onValuesChange={(changeValues) => console.log(changeValues)}
                        onFinish={async (values: any) => {
                            await waitTime(values,5000)
                                .then(this.jump)
                            return true
                        }}
                        submitter={{
                            searchConfig: {
                                submitText: '登录',
                            },
                            render: (_, dom) => dom.pop(),
                            submitButtonProps: {
                                size: 'large',
                                style: {
                                    width: '100%',
                                },
                            },
                        }}
                    >
                        <h1
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            <img
                                style={{
                                    height: '44px',
                                    marginRight: 16,
                                }}
                                alt="logo"
                                src={logo}
                            />
                            Deep Sea Hunter
                        </h1>
                        <div
                            style={{
                                marginTop: 12,
                                textAlign: 'center',
                                marginBottom: 40,
                            }}
                        >
                            欢迎来到深海猎手官方游戏网站
                        </div>
                        <Link to='/test'>注册新用户</Link>
                        <ProFormText
                            fieldProps={{
                                size: 'large',
                                prefix: <MobileTwoTone />,
                            }}
                            name="loginValues"
                            placeholder="请输入手机号或者UUID"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入手机号或者UUID!',
                                },
                                // {
                                //     pattern: /^1\d{10}$/,
                                //     message: '不合法的手机号格式!',
                                // },
                            ]}
                        />
                        <ProFormText
                            fieldProps={{
                                size: 'large',
                                prefix: <UnlockOutlined />,
                            }}
                            name="password"
                            placeholder="请输入登陆密码"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入登陆密码!',
                                },
                                // {
                                //     pattern: /^1\d{10}$/,
                                //     message: '不合法的密码格式!',
                                // },
                            ]}
                        />
                    </ProForm>
                </div>
           </ModalForm>
        </Space>
    );
  }
}


export default Register




