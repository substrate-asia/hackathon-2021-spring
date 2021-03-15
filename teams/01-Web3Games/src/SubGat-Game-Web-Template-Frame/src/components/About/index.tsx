import React from 'react';
import {
    Input,
    message,
} from 'antd';
import  {ModalForm,ProFormCaptcha,ProFormText} from "@ant-design/pro-form";
import {MailTwoTone, MobileTwoTone} from '@ant-design/icons';
import Pocket from "../Pocket";
import { useHistory } from "react-router-dom";
import axios from "axios";




const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};


const waitTime2 = (values:any) => {
    return new Promise((resolve) => {
        let data = {
            "uuid":randomString(12),
            "phone_number":values.phone,
            "password":values.password,
            "web3_address":'5Dtp6pqcX71gRny3GwUhXKzKYEydbdJt9745qqsDBRh8ToBu'
        }
        setTimeout(() => {
            axios({
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'post',
                url: '/register',
                data: JSON.stringify(data)
            })
                .then(function (response) {
                    message.success(`注册成功你当前UUID为${data.uuid}`).then(r => console.log(response));
                })
                .catch(function (error) {
                    message.error('注册失败').then(r => console.log(error));
                });
            resolve(true);
        })
    })
}

function randomString(length:number) {
    let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i)
        result += str[Math.floor(Math.random() * str.length)];
    return result;
}

function RegistrationForm (){


    async function onFinish(values: any){
        console.log(values)
        await waitTime2(values)
            .then(jump)
        return true
    }



    let history = useHistory()

    function jump() {
        return function () {
            history.push("/");
        };
    }

    return (
        <ModalForm
            // width={800}
            title="新用户注册"
            visible={true}
            modalProps={{
                onCancel:jump()
            }}
            submitter={{
                searchConfig: {
                    submitText: '注册',
                },
                resetButtonProps: {
                    style: {
                        display: 'none',
                    },
                },
                submitButtonProps: {
                    // style: {
                    //     display: 'none',
                    // }
                },
            }}
            onFinish={onFinish}
        >
            <ProFormText
                fieldProps={{
                    size: 'large',
                    prefix: <MobileTwoTone />,
                }}
                name="phone"
                placeholder="请输入手机号"
                rules={[
                    {
                        required: true,
                        message: '请输入手机号!',
                    },
                    {
                        pattern: /^1\d{10}$/,
                        message: '不合法的手机号格式!',
                    },
                ]}
            />
            <ProFormCaptcha
                fieldProps={{
                    size: 'large',
                    prefix: <MailTwoTone />,
                }}
                captchaProps={{
                    size: 'large',
                }}
                phoneName="phone"
                name="captcha"
                rules={[
                    {
                        required: true,
                        message: '请输入验证码',
                    },
                ]}
                placeholder="请输入验证码"
                onGetCaptcha={async (phone) => {
                    await waitTime(1000);
                    message.success(`手机号 ${phone} 验证码发送成功!`);
                }}
            />
            <ProFormText
                name="password"
                label="登陆密码"
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                ]}
                hasFeedback
            >
                <Input.Password />
            </ProFormText>

            <ProFormText
                name="confirm"
                label="确认密码"
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject('The two passwords that you entered do not match!');
                        },
                    }),
                ]}
            ><Input.Password />
            </ProFormText>
            <Pocket/>
    </ModalForm>
    );
}


export default RegistrationForm
