import React, {Component} from 'react';
import styles from './wallet.less';
import {Card, Modal, message, Button} from 'antd';
import {
  getUserBasisSecurity,
  sendCaptcha,
  getUserBase,
  updateUserSecurity,
  getUserAccount,
} from '@/services/user';
import Codebox from '@axetroy/react-codebox';
import {createAccount} from "@/services/balance";
import {randomWord} from '@/utils/utils';
import {TextField} from '@material-ui/core';

class Wallet extends Component<any> {
  state = {
    nearAccountId: '',
    payNum: '',
    coins: 0,
    disableWithDrawCoins: 0,
    earnestCoins: 0,
    userId: 0,
    username: '',

    captcha: '',
    count: 0,
    timing: false,
    isPayNumModalVisible: false,
    isPayNumConfirmModalVisible: false,
    isCaptchaModalVisible: false
  };

  async componentDidMount() {
    let res = await getUserBase();
    if (res.phone) {
      this.setState({
        username: res.phone,
        userId: res.id,
      });
      let username = res.phone;
      res = await getUserBasisSecurity();
      if (res.nearAccountId) {
        this.setState({
          nearAccountId: res.nearAccountId,
        });
        const userAccountRes = await getUserAccount();
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

  async createNearAccount(username: string, accountId: string) {
    let res = await createAccount(username, accountId);
    console.log(res)
    res = await getUserBasisSecurity();
    if (res.nearAccountId) {
      this.setState({
        nearAccountId: res.nearAccountId,
      });
      const userAccountRes = await getUserAccount();
      if (userAccountRes.largeCoins) {
        this.setState({
          coins: userAccountRes.largeCoins,
        });
      }
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
      message.error('设置失败，请重试');
    }
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

  render() {
    return (
      <div>
        <Card className={styles.card} hoverable>
          <div style={{textAlign: 'center'}}>
            <p style={{color: '#333333', marginTop: '90px'}}>你的钱包</p>
            {this.state.nearAccountId.length === 0 ? (
              <div style={{textAlign: 'center', marginBottom: '80px'}}>
                <Button
                  style={{
                    paddingBottom: '20px',
                    paddingLeft: '50px',
                    paddingRight: '50px',
                    marginRight: '20px',
                  }}
                  danger
                >
                  正在生成钱包……
                </Button>
              </div>
            ) : (
              <div style={{textAlign: 'center', marginBottom: '80px'}}>
                <Button
                  style={{
                    paddingBottom: '20px',
                    paddingLeft: '50px',
                    paddingRight: '50px',
                    marginRight: '20px',
                    marginBottom: '10px'
                  }}
                  danger
                  onClick={() => this.openPayNumModal()}
                >
                  修改支付密码
                </Button>
                <br/>
                <Button
                  type="link"
                  style={{
                    paddingBottom: '20px',
                    paddingLeft: '50px',
                    paddingRight: '50px',
                    marginRight: '20px',
                  }}
                  danger
                >
                  DIMENSION AccountId: {this.state.nearAccountId}
                </Button>
              </div>
            )}
            <div style={{textAlign: 'center', marginBottom: '110px'}}>
              <div className={styles.amountContent}>
                <div className={styles.totalAmount}>
                  <div>总余额：</div>
                  <div
                    className={styles.immAmount}>{((this.state.coins + this.state.disableWithDrawCoins + this.state.earnestCoins) / 100).toLocaleString()} 电子
                  </div>
                </div>
                <div className={styles.withdrawAmount}>
                  <div>可提现余额：</div>
                  <div className={styles.immAmount}>{(this.state.coins / 100).toLocaleString()} 电子</div>
                </div>
                <div className={styles.withdrawAmount}>
                  <div>竞拍保证金：</div>
                  <div className={styles.immAmount}>{(this.state.earnestCoins / 100).toLocaleString()} 电子</div>
                </div>
                <div className={styles.limitAmount}>
                  <div>限制场景余额：</div>
                  <div className={styles.immAmount}>{(this.state.disableWithDrawCoins / 100).toLocaleString()} 电子</div>
                </div>
              </div>
              <Button
                style={{
                  paddingBottom: '20px',
                  paddingLeft: '50px',
                  paddingRight: '50px',
                  marginRight: '20px',
                  marginBottom: '10px'
                }}
                danger
                href={'http://pay.dimension.pub/#/home/charge'}
                target='_blank'
              >
                充值
              </Button>
              {/* <Button
                style={{
                  paddingBottom: '20px',
                  paddingLeft: '50px',
                  paddingRight: '50px',
                  marginRight: '20px',
                  marginBottom: '10px'
                }}
                danger
                href={'http://pay.dimension.pub/#/home/withdraw'}
                target='_blank'
              >
                提现
              </Button> */}
              <br/>
            </div>
          </div>
        </Card>
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
              validator={(input, index) => {
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
              validator={(input, index) => {
                console.log();
                return /\d/.test(input) && this.state.payNum.substr(index, 1) === input;
              }}
              onChange={(codeArray: any) => {
                let payNum: string = codeArray.join('');
                if (payNum.length >= 6) {
                  this.openCaptchaModal();
                }
              }}
            />
            <p style={{marginTop: '20px'}}>请保管好您的支付密码以在每次交易时输入</p>
          </div>
        </Modal>
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
              onClick={() => this.submitBind()}
              style={{marginTop: '30px', marginBottom: '20px', fontSize: '16px'}}
              type="primary"
              size="large"
              danger
            >
              确认修改
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default Wallet;
