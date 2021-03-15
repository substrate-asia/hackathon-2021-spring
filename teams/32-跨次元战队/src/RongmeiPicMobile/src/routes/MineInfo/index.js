import React from 'react'
import { ImagePicker, Toast } from "antd-mobile";
import FormHeader from "../../components/FormHeader";
import TitleLabel from "../../components/TitleLabel";
import { api } from '../../services/api/ApiProvider'
import './style.css'

class MineInfo extends React.Component {
  uploadService = api.uploadService;
  accountService = api.accountService;

  state = {
    files: [{
      url: "https://www.diyimei.net/upload/2018/1523807721171765.jpg",
      id: '1'
    }],
    nickname: "浮&生",
    gender:"",
    isChange: false
  }

  onChange = (files, type, index) => {
    this.setState({
      files: files,
      isChange: true
    });
  }

  changeFromEvt = (key, evt) => {
    this.setState({
      [key]: evt.target.value
    })
  }

  async componentDidMount() {
    let res = await this.accountService.getUserInfo();
    let files = [{
      url: res.avatarUrl,
      id: '1'
    }]
    this.setState({
      files: files,
      nickname: res.nickname,
      gender: res.gender

    })
  }

  save = async () => {
    try {
      let avatarUrl = this.state.avatarUrl;
      if (this.state.isChange && this.state.files.length > 0) {
        let res = await this.uploadService.upload(this.state.files[0].file);
        avatarUrl = res.url;
      }
      await this.accountService.saveUserInfo({
        avatarUrl: avatarUrl,
        nickname: this.state.nickname,
        gender:this.state.gender
      });
      Toast.success("保存成功");
      this.props.history.goBack();
    } catch (e) {
      Toast.info("保存失败，请重试");
    }
  };

  render() {
    return (
      <div style={{ height: '100%', backgroundColor: 'white' }}>
        <FormHeader title={"个人信息"}
          back={() => {
            this.props.history.goBack();
          }}
          save={() => {
            this.save()
          }} />
        <div style={{ padding: '20px' }}>
          <TitleLabel>头像</TitleLabel>
          <ImagePicker
            files={this.state.files}
            onChange={this.onChange}
            selectable={this.state.files.length < 1}
            multiple={false}
            onAddImageClick={this.onAddImageClick}
          />
          <div style={{ paddingTop: '20px' }}>
            <TitleLabel>昵称</TitleLabel>
            <input placeholder="如：浮&生" onChange={this.changeFromEvt.bind(this, 'nickname')}
              value={this.state.nickname} />
          </div>
          <div style={{ paddingTop: '20px' }}>
            <TitleLabel>性别</TitleLabel>
            <input placeholder="如：浮&生" onChange={this.changeFromEvt.bind(this, 'gender')}
              value={this.state.gender} />
          </div>
        </div>
      </div>
    )
  }
}

export default MineInfo
