import {Button, Form, Input} from 'antd';
import {connect, formatMessage, FormattedMessage} from 'umi';
import React, {Component} from 'react';
import {UserInfo} from "@/models/userInfo";
import {ConnectState} from "@/models/connect";
import {ConnectProps} from "@@/plugin-dva/connect";
import {UserInfoParams} from '@/services/user';
import styles from './BaseView.less';
import AvatarView from './AvatarView';
import {history} from "@@/core/history";

interface BaseViewProps extends Partial<ConnectProps> {
  userInfo?: UserInfo;
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  handleFinish = async (values: { [key: string]: any }) => {
    const {dispatch, userInfo} = this.props;
    const params: UserInfoParams = {
      avatarUrl: userInfo ? userInfo.avatarUrl : "",
      nickname: values.nickname,
      email: values.email,
      address: values.address,
      description: values.description,
      personWebsite: values.personWebsite
    };
    if (dispatch) {
      await dispatch({
        type: 'userInfo/saveUserInfo',
        payload: params
      });
      history.push(`/account/center`);
    }
  };

  render() {
    const {userInfo} = this.props;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form
            layout="vertical"
            onFinish={this.handleFinish}
            initialValues={userInfo}
            hideRequiredMark
          >
            <Form.Item
              name="nickname"
              label={formatMessage({id: 'accountandsettings.basic.nickname'})}
              rules={[
                {
                  required: true,
                  message: formatMessage({id: 'accountandsettings.basic.nickname-message'}, {}),
                },
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item

              name="username"
              label={formatMessage({id: 'accountandsettings.basic.username'})}
              rules={[
                {
                  required: false,
                  message: formatMessage({id: 'accountandsettings.basic.username-message'}, {}),
                },
              ]}
            >
              <Input disabled/>
            </Form.Item>
            <Form.Item
              name="email"
              label={formatMessage({id: 'accountandsettings.basic.email'})}
              rules={[
                {
                  required: false,
                  message: formatMessage({id: 'accountandsettings.basic.email-message'}, {}),
                },
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              name="address"
              label={formatMessage({id: 'accountandsettings.basic.address'})}
              rules={[
                {
                  required: false,
                  message: formatMessage({id: 'accountandsettings.basic.address-message'}, {}),
                },
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              name="description"
              label={formatMessage({id: 'accountandsettings.basic.profile'})}
              rules={[
                {
                  required: false,
                  message: formatMessage({id: 'accountandsettings.basic.profile-message'}, {}),
                },
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item
              name="personWebsite"
              label={formatMessage({id: 'accountandsettings.basic.website'})}
              rules={[
                {
                  required: false,
                  message: formatMessage({id: 'accountandsettings.basic.website-message'}, {}),
                },
              ]}
            >
              <Input/>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                <FormattedMessage
                  id="accountandsettings.basic.update"
                  defaultMessage="Update Information"
                />
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView/>
        </div>
      </div>
    );
  }
}

export default connect(({userInfo}: ConnectState) => ({
    userInfo: userInfo.userInfo,
  }),
)(BaseView);


