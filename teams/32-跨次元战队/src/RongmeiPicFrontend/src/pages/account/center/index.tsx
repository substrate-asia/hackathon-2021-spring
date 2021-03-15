import { Menu, Card, Col, Divider, Input, Row, Button } from 'antd';
import React, { Component } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { ClickParam } from 'antd/es/menu';
import { history, connect, Dispatch, Link } from 'umi';
import { RouteChildrenProps } from 'react-router';
import { UserInfo, UserInfoModelState } from "@/models/userInfo";
import styles from './Center.less';
import { FundProjectionScreenOutlined, LogoutOutlined } from '@ant-design/icons';
import { EnvironmentOutlined } from '@ant-design/icons';
import { BgColorsOutlined, SettingOutlined, SnippetsOutlined, WalletOutlined } from "@ant-design/icons/lib";
import { getMineUserRelation } from '@/services/user';

interface CenterProps extends RouteChildrenProps {
  dispatch: Dispatch;
  userInfo: UserInfo;
}

interface CenterState {
  tabKey?: 'articles' | 'applications' | 'projects';
  userRelation: {
    fans: [],
    follows: []
  };
}

class Center extends Component<CenterProps,
  CenterState> {
  public input: Input | null | undefined = undefined;
  state = {
    userRelation: {
      fans: [],
      follows: []
    }
  }

  onMenuClick = (event: ClickParam) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;

      if (dispatch) {
        dispatch({
          type: 'user/logout',
        });
        dispatch({
          type: 'userInfo/clear',
        });
        history.push(`/`);
        location.reload();
      }

      return;
    }

    // history.push(`/account/${key}`);
  };

  async componentDidMount(): void {
    let userRelationRes = await getMineUserRelation();
    if (userRelationRes.id) {
      this.setState({
        userRelation: userRelationRes
      })
    }
  }

  render() {
    const { userInfo, children } = this.props;
    const dataLoading = !userInfo;
    return (
      <GridContent>
        <Row gutter={24}>
          <Col lg={8} md={24}>
            <Card bordered={false} style={{ marginBottom: 24 }} loading={dataLoading}>
              {!dataLoading && (
                <div>
                  <div className={styles.avatarHolder}>
                    {/* <img alt="" src={userInfo.avatarUrl}/> */}
                    <div className={styles.avatarBlock}>
                      <img className={styles.avatarImg} alt=""
                        src={userInfo.avatarUrl && userInfo.avatarUrl.length > 0 ? userInfo.avatarUrl : "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"} />
                      <div className={styles.followNum}>粉丝：{this.state.userRelation.fans.length}</div>
                      <div className={styles.followNum}>关注：{this.state.userRelation.follows.length}</div>
                      <Link to="/account/settings">
                        <Button block type="primary">编辑个人资料</Button>
                      </Link>
                    </div>
                    <div className={styles.infoBlock}>
                      <div className={styles.name}>{userInfo.nickname ? userInfo.nickname : "暂无昵称"}</div>
                      <div className={styles.nickname}>@{userInfo.username && userInfo.username.length > 0 ? userInfo.username : '用户名'}</div>
                      <div className={styles.address}>
                        <EnvironmentOutlined />
                        <span>{userInfo.address && userInfo.address.length > 0 ? userInfo.address : '布宜诺斯艾利斯'}</span>
                      </div>
                      <div className={styles.bio}>
                        {userInfo.description && userInfo.description.length > 0 ? userInfo.description : '你还没有个人简介'}
                      </div>
                    </div>
                  </div>
                  <Divider dashed />
                  <Menu
                    defaultSelectedKeys={[window.location.pathname]}
                    mode="inline"
                    onClick={this.onMenuClick}
                  >
                    {/* <Menu.Item key="/account/center/point">
                      <Link to="/account/center/point">
                        <BgColorsOutlined/>
                        积分
                      </Link>
                    </Menu.Item> */}
                    <Menu.Item key="/account/center/artworkList">
                      <Link to="/account/center/artworkList">
                        <BgColorsOutlined />
                        我的收藏
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="/account/center/order">
                      <Link to="/account/center/order">
                        <SnippetsOutlined />
                        交易凭证
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="/account/center/wallet">
                      <Link to="/account/center/wallet">
                        <WalletOutlined />
                        积分钱包
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="/account/center/update">
                      <Link to="/account/center/update">
                        <SettingOutlined />
                       推送设置
                     </Link>
                    </Menu.Item>
                    {/* <Menu.Item key="/">
                      <Link to="/">
                        <SettingOutlined />
                       存证与维权
                     </Link>
                    </Menu.Item> */}
                    <Menu.Item key="/account/center/creator">
                      <a href="https://admin.dimension.pub/#/picadmin/account/center/home" target='_blank' className={styles.platformLink}>
                      <FundProjectionScreenOutlined />
                        创作者平台
                        </a>
                    </Menu.Item>
                    <Menu.Item key="logout">
                      <LogoutOutlined />
                      退出登录
                    </Menu.Item>
                  </Menu>
                </div>
              )}
            </Card>
          </Col>
          <Col lg={16} md={24}>
            {children}
          </Col>
        </Row>
      </GridContent>
    );
  }
}

export default connect(
  ({
    userInfo
  }: {
    userInfo: UserInfoModelState;
  }) => ({
    userInfo: userInfo.userInfo
  }),
)(Center);
