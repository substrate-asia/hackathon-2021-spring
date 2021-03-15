import React, {Component} from "react";
import {Button, message, Modal} from "antd";
import Codebox from '@axetroy/react-codebox';
import {TextField} from "@material-ui/core";
import {getUserBase, sendCaptcha, updateUserSecurity} from "@/services/user";

export interface ForgetPayModalProps {
  onOk: () => void;
  onCancel?: () => void;
  isForgetPayNumModalVisible: boolean;
}

class ForgetPayModal extends Component<ForgetPayModalProps, any> {
  state = {
    userId: 0,
    username: '',

    payNum: '',
    captcha: '',
    count: 0,
    timing: false,
    isCaptchaModalVisible: true,
    isPayNumModalVisible: false,
    isPayNumConfirmModalVisible: false,
  }

  async componentDidMount() {
    let res = await getUserBase();
    if (res.phone) {
      this.setState({
        username: res.phone,
        userId: res.id,
      });
    }
  }

  closePayNumModal() {
    this.setState({
      isPayNumModalVisible: false,
    });
  }

  openPayNumModal() {
    this.setState({
      isPayNumModalVisible: true
    });
  }

  openPayNumConfirmModal() {
    this.setState({
      isPayNumConfirmModalVisible: true,
      isPayNumModalVisible: false,
    });
  }

  closePayNumConfirmModal() {
    this.setState({
      isPayNumConfirmModalVisible: false,
    });
  }

  openCaptchaModal() {
    this.setState({
      isCaptchaModalVisible: true
    })
  }

  closeCaptchaModal() {
    this.setState({
      isCaptchaModalVisible: false
    })
  }

  async sendCaptcha() {
    let res = await sendCaptcha(this.state.username);
    if (res) {
      this.setState({
        timing: true,
        count: 30,
      });
      let interval = window.setInterval(() => {
        this.setState((preState: any) => {
          if (preState.count <= 1) {
            clearInterval(interval);
            return {
              count: 0,
              timing: false,
            };
          }
          return {
            count: preState.count - 1,
          };
        });
      }, 1000);
    }
  }

  async submitBind() {
    const res = await updateUserSecurity({
      id: 0,
      userId: this.state.userId,
      nearAccountId: '',
      nearPublicKey: '',
      nearPrivateKey: '',
      payNum: this.state.payNum,
      captcha: this.state.captcha,
    });
    if (res.infoCode) {
      this.closeCaptchaModal();
      this.closePayNumConfirmModal();
      this.closePayNumModal();
    } else {
      message.error('验证码错误，请重试');
    }
  }

  render() {
    return this.props.isForgetPayNumModalVisible ? (<div>
      <Modal
        visible={this.state.isCaptchaModalVisible}
        onCancel={() => this.closeCaptchaModal()}
        footer={null}
      >
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p style={{fontSize: '30px'}}>身份验证</p>
          <br/>
          <div style={{width: '90%', marginTop: '10px'}}>
            <TextField
              style={{marginLeft: '12%', width: '50%', float: 'left'}}
              onChange={(e) => {
                this.setState({
                  captcha: e.target.value,
                });
              }}
              id="standard-basic"
              label="验证码"
              color="secondary"
            />
            <Button
              disabled={this.state.timing}
              style={{marginLeft: '20px', marginTop: '15px', float: 'right'}}
              onClick={() => this.sendCaptcha()}
              danger
            >
              {this.state.timing ? `${this.state.count} 秒` : '获取验证码'}
            </Button>
          </div>
          <br/>
          <br/>
          <br/>
          <Button
            onClick={() => this.openPayNumModal()}
            style={{marginTop: '30px', marginBottom: '20px', fontSize: '16px'}}
            type="primary"
            size="large"
            danger
          >
            验证
          </Button>
        </div>
      </Modal>
      <Modal
        visible={this.state.isPayNumModalVisible}
        onCancel={() => this.closePayNumModal()}
        footer={null}
      >
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p style={{fontSize: '30px'}}>请注册支付密码</p>
          <Codebox
            type="password"
            length={6}
            validator={(input: string, index: number) => {
              return /\d/.test(input);
            }}
            onChange={(codeArray: any) => {
              let payNum: string = codeArray.join('');
              this.setState({
                payNum: payNum,
              });
              if (payNum.length >= 6) {
                this.openPayNumConfirmModal();
              }
            }}
          />
          <p style={{marginTop: '20px'}}>请保管好您的支付密码以在每次交易时输入</p>
        </div>
      </Modal>
      <Modal
        visible={this.state.isPayNumConfirmModalVisible}
        onCancel={() => this.closePayNumConfirmModal()}
        footer={null}
      >
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p style={{fontSize: '30px'}}>请再次输入支付密码</p>
          <Codebox
            type="password"
            length={6}
            validator={(input: string, index: number) => {
              return /\d/.test(input) && this.state.payNum.substr(index, 1) === input;
            }}
            onChange={(codeArray: any) => {
              let payNum: string = codeArray.join('');
              if (payNum.length >= 6) {
                this.openCaptchaModal();
              }
            }}
          />
          <Button
            onClick={() => this.submitBind()}
            style={{marginTop: '30px', marginBottom: '20px', fontSize: '16px'}}
            type="primary"
            size="large"
            danger
          >
            确认修改
          </Button>
          <p style={{marginTop: '20px'}}>请保管好您的支付密码以在每次交易时输入</p>
        </div>
      </Modal>
    </div>) : null;
  }
}

export default ForgetPayModal;

