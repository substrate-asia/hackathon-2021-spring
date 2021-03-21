import React from 'react';
import {Redirect, connect, ConnectProps} from 'umi';
import {stringify} from 'querystring';
import {ConnectState} from '@/models/connect';
import PageLoading from '@/components/PageLoading';

interface SecurityLayoutProps extends ConnectProps {
  loading?: boolean;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
    const {dispatch} = this.props;
    if (dispatch) {
      dispatch({
        type: 'userInfo/getUserInfo'
      });
    }
  }

  render() {
    const {isReady} = this.state;
    const {children, loading} = this.props;
    // You can replace it to your authentication rule (such as check token exists)
    // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在
    const isLogin = localStorage.getItem("token");

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading/>;
    }
    return children;
  }
}

export default connect(({loading}: ConnectState) => ({
  loading: loading.effects['userInfo/getUserInfo'],
}))(SecurityLayout);
