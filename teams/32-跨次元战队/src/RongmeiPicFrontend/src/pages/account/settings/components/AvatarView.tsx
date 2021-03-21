import React, {Component} from "react";
import {Button, message, Upload} from "antd";
import styles from "@/pages/account/settings/components/BaseView.less";
import {connect, FormattedMessage} from "umi";
import {UploadOutlined} from "@ant-design/icons";
import {ConnectProps} from "@@/plugin-dva/connect";
import {ConnectState} from "@/models/connect";
import {UploadChangeParam} from "antd/lib/upload";
import {UserInfo} from "@/models/userInfo";
import {getServiceBaseUrl} from "@/services/DNS";
import {COMMON_SERVICE} from "@/services/config";

interface AvatarViewProps extends Partial<ConnectProps> {
  userInfo?: UserInfo;
}

class AvatarView extends Component<AvatarViewProps> {
  state = {
    uploadUrl: ''
  }

  async componentDidMount() {
    let baseUrl = await getServiceBaseUrl(COMMON_SERVICE);
    this.setState({
      uploadUrl: baseUrl + "/upload"
    })
  }

  onChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const {dispatch} = this.props;
      if (dispatch) {
        dispatch({
          type: 'userInfo/uploadAvatar',
          payload: info.file
        });
      }
      message.success(`${info.file.name} 文件上传成功`);

    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  }

  render(): React.ReactElement<any, string | React.JSXElementConstructor<any>> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const {userInfo} = this.props
    return (
      <>
        <div className={styles.avatar_title}>
          <FormattedMessage id="accountandsettings.basic.avatar" defaultMessage="Avatar"/>
        </div>
        <div className={styles.avatar}>
          <img
            src={userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"}
            alt="avatar"/>
        </div>
        <Upload showUploadList={false} onChange={this.onChange} action={this.state.uploadUrl}>
          <div className={styles.button_view}>
            <Button>
              <UploadOutlined/>
              <FormattedMessage id="accountandsettings.basic.change-avatar" defaultMessage="Change Avatar"/>
            </Button>
          </div>
        </Upload>
      </>
    )
  }
}

export default connect(({userInfo}: ConnectState) => ({
    userInfo: userInfo.userInfo,
  }),
)(AvatarView);
