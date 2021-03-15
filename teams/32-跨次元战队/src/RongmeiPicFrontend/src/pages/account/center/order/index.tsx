import React, {Component} from 'react';
import styles from './Order.less';
import {
  Card,
  message,
  Button,
  PageHeader,
  Tabs,
  Statistic,
  Descriptions,
  Row,
  AutoComplete,
  Input,
  Col,
  Modal
} from 'antd';
import {
  getUserBasisSecurity,
  getUserBase,
  getUserAccount, consumeDiscount,
} from '@/services/user';
import {randomWord} from '@/utils/utils';
import {createAccount, transfer} from "@/services/balance";
import {getTCC} from '@/services/tcc';
import {PhoneOutlined, SearchOutlined} from "@ant-design/icons";
import {getMineThings, getThing} from '@/services/auction';

const {TabPane} = Tabs;

class Order extends Component<any> {
  state = {
    nearAccountId: '',
    payNum: '',
    coins: 0,
    disableWithDrawCoins: 0,
    earnestCoins: 0,
    transferGas: 0,
    userId: 0,
    username: '',
    things: [],
    thingId: '',
    thingName: '',
    toUsername: '',
    thing: null,
    loading: false
  };

  async componentDidMount() {
    const tccRes = await getTCC("rongmei.pic.transfer_gas");
    if (tccRes.tccTuple.value) {
      this.setState({
        transferGas: parseInt(tccRes.tccTuple.value)
      })
    }
    const thingsRes = await getMineThings();
    this.setState({
      things: thingsRes.thingItems
    });
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

  async transfer() {
    Modal.confirm({
      title: '确认转移',
      content: '你确定要转移此藏品吗？',
      onOk: async () => {
        this.setState({
          loading: true
        })
        if ((this.state.coins + this.state.disableWithDrawCoins) < this.state.transferGas) {
          message.error("积分不够，请先充值")
          return
        }
        if (!this.state.thing || this.state.thingId.length === 0) {
          message.error("请先选择藏品")
          return
        }
        if (this.state.toUsername.length === 0) {
          message.error("请先输入目标用户名")
          return
        }
        const discountRes = await consumeDiscount(this.state.transferGas);
        if (discountRes.infoCode === 10000) {
          message.success("地址转移费扣除成功")
          const transferRes = await transfer(this.state.username, this.state.toUsername, this.state.thing.tokenId);
          if (transferRes.infoCode == 10000) {
            message.success("转移成功")
          } else {
            message.error("转移失败")
          }
        }
        this.setState({
          loading: false
        })
      },
      onCancel() {
      },
    });
  }

  render() {
    return (
      <div>
        <Card className={styles.card} hoverable>
          <PageHeader
            className="site-page-header-responsive"
            backIcon={false}
            title={<h1>传送门</h1>}
            footer={
              <Tabs defaultActiveKey="transfer">
                <TabPane tab="转移" key="transfer"/>
              </Tabs>
            }
          >
            <Row>
              <Statistic title="总余额" suffix="电子"
                         value={((this.state.coins + this.state.disableWithDrawCoins + this.state.earnestCoins) / 100).toLocaleString()}/>
              <Statistic
                title="可提现余额"
                suffix="电子"
                value={this.state.coins.toFixed(0)}
                style={{
                  margin: '0 32px',
                }}
              />
              <Statistic title="拍卖保证金" suffix="电子" value={(this.state.earnestCoins / 100).toLocaleString()}/>
              <Statistic style={{
                margin: '0 32px',
              }} title="转移费" suffix="电子" value={(this.state.transferGas / 100).toLocaleString()}/>
            </Row>
          </PageHeader>
          <div style={{margin: '20px', textAlign: 'center'}}>
            <div style={{marginTop: '40px'}}>
              <Row>
                <Col span={8}>
                  <span style={{fontSize: '16px', float: 'right'}}>转移藏品：</span>
                </Col>
                <Col span={16}>
                  <AutoComplete
                    dropdownClassName="certain-category-search-dropdown"
                    dropdownMatchSelectWidth={false}
                    dropdownStyle={{width: 300}}
                    style={{width: '80%', textAlign: 'left'}}
                    value={this.state.thingName}
                    dataSource={
                      this.state.things.map((thing) => (
                        <AutoComplete.Option value={thing.id + ""}>
                          {thing.name}
                        </AutoComplete.Option>
                      ))
                    }
                    onChange={(value) => this.setState({
                      thingId: value
                    }, async () => {
                      let res = await getThing(this.state.thingId)
                      this.setState({
                        thing: res,
                        thingName: res.name
                      })
                    })}
                    placeholder="搜索以选择合适的藏品"
                  >
                    <Input suffix={<SearchOutlined/>}/>
                  </AutoComplete>
                </Col>
              </Row>
            </div>
            <div style={{marginTop: '20px'}}>
              <Row>
                <Col span={8}>
                  <span style={{fontSize: '16px', float: 'right'}}>转移给：</span>
                </Col>
                <Col span={16}>
                  <Input
                    style={{width: '80%'}}
                    value={this.state.toUsername}
                    onChange={(e) => this.setState({
                      toUsername: e.target.value
                    })}
                    placeholder="输入完整的用户名（电话）"
                    suffix={<PhoneOutlined/>}
                  />
                </Col>
              </Row>
            </div>
            <div style={{marginTop: '40px', textAlign: 'center'}}>
              <Button type="primary" onClick={() => this.transfer()} loading={this.state.loading}>立即转移</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

export default Order;
