import React, {Component} from 'react';

import {Col, Row, Image, List, Button, Modal, Avatar, message} from 'antd';
import {ConnectProps} from "@@/plugin-dva/connect";
import {connect, Link} from "umi";
import {ConnectState} from "@/models/connect";
import {getCommodities, getCommodity, getCommodityAuthor} from "@/services/commodity";
import {updateOrder, isOrderExist} from "@/services/order";
import {consumeCoins, getMineUserInfo, getUserBase, transferCoins} from "@/services/user";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartTwoTone,
  ShareAltOutlined, WarningOutlined
} from "@ant-design/icons/lib";
import comStyles from "./commodity.less";
import {getTCC} from "@/services/tcc";
import {getLike, postLike} from "@/services/relation";
import {addDislike, addShare, getDislike, getShare} from "@/services/metrics";

const {confirm} = Modal;

function formatDate(time) {
  console.log(time);
  let date = new Date(time);
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = date.getDate() + ' ';
  let h = date.getHours() + ':';
  let m = date.getMinutes() + ':';
  let s = date.getSeconds();
  return Y + M + D + h + m + s;
}

interface CommodityProps extends Partial<ConnectProps> {
  loading: boolean;
  location: any;
}

class Commodity extends Component<CommodityProps> {
  state = {
    commodity: {},
    isBuyModalVisible: false,
    usernameList: [],
    currUser: '',
    nickname: '',
    avatarUrl: '',

    isLike: false,
    likeNum: 0,
    shareNum: 0,
    dislikeNum: 0
  }

  async componentDidMount(): void {
    const commodityId = this.props.location.pathname.split('/').pop();
    let res = await getCommodity(commodityId);
    res.fileType = res.coverUrl.split('.').slice(-1)
    this.setState({
      commodity: res
    })
    this.getRecommendCommodities();
    const commodityAuthorRes = await getCommodityAuthor(commodityId);
    if (commodityAuthorRes.usernameList) {
      this.setState({
        usernameList: commodityAuthorRes.usernameList
      })
    }
    const userBaseRes = await getUserBase();
    if (userBaseRes.phone) {
      this.setState({
        currUser: userBaseRes.phone
      })
    }
    const userInfoRes = await getMineUserInfo();
    if (userInfoRes.username) {
      this.setState({
        nickname: userInfoRes.nickname,
        avatarUrl: userInfoRes.avatarUrl
      })
    }
  }

  getRecommendCommodities = async () => {
    const res = await getCommodities({
      tags: [],
      key: '',
      orderKey: 'all',
      offset: 0,
      limit: 10
    })
    this.setState({
      commodities: res.commodities
    })
  }

  purchase = async () => {
    const res = await isOrderExist(this.state.commodity.id);
    let that = this;
    if (!res.orderItem && this.state.commodity.author && this.state.currUser !== this.state.commodity.author) {
      confirm({
        title: '确定要购买吗？',
        icon: <ExclamationCircleOutlined/>,
        content: '下单后将自动扣除积分',
        async onOk() {
          await updateOrder({
            id: 0,
            largePrice: that.state.commodity.largePrice,
            avatarUrl: that.state.commodity.coverUrl,
            userGroupTitle: that.state.commodity.title,
            pageUrl: '',
            status: "已完成",
            totalNum: 1,
            completeNum: 1,
            orderType: 'pic',
            relationId: that.state.commodity.id
          })
          const tccRes = await getTCC("dimension.sale.divide");
          let saleDivideList = eval(tccRes.tccTuple.value)
          if (!saleDivideList || saleDivideList.length < 2) {
            saleDivideList = [0.4, 0.3];
          }
          const divide = that.state.commodity.isExclusive ? saleDivideList[1] : saleDivideList[0];
          let author = that.state.commodity.author ? that.state.commodity.author : that.state.usernameList[0];
          let coinsToUser = Math.ceil(that.state.commodity.largePrice * (1 - divide));
          let coinsToSystem = that.state.commodity.largePrice - coinsToUser;
          await transferCoins(coinsToUser, author);
          await consumeCoins(coinsToSystem)
          that.download(that.state.commodity.contentUrl);
        },
      });
    } else {
      this.download(that.state.commodity.contentUrl);
    }
  }

  download = (url) => {
    window.open(url);
  }

  postLike = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await postLike(commodityId, 0);
    if (res.infoCode === 10000) {
      await this.updateLike();
      message.success("状态变更成功")
    }
  }

  updateLike = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await getLike(commodityId, 0);
    this.setState({
      isLike: res.isLike,
      likeNum: res.likeNum
    })
  }

  postShare = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await addShare(commodityId, "");
    if (res.infoCode === 10000) {
      await this.updateShare();
      message.success("分享成功")
    }
  }

  updateShare = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await getShare(commodityId);
    this.setState({
      shareNum: res.count
    })
  }

  postDislike = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await addDislike(commodityId, "");
    if (res.infoCode === 10000) {
      await this.updateDislike();
      message.success("举报成功")
    }
  }

  updateDislike = async () => {
    const commodityId = this.props.location.pathname.split('/').pop();
    const res = await getDislike(commodityId);
    this.setState({
      dislikeNum: res.count
    })
  }

  render() {
    return (
      <div className={comStyles.container}>
        <div style={{display: 'flex', justifyContent: 'space-between', margin: "0 auto"}}>
          <div>
            <div className={comStyles.leftSiderContainer}>
              <div className={comStyles.title}>
                <span className={comStyles.titleText}>{this.state.commodity.title}</span>
              </div>
              <div className={comStyles.info}>
                <div className={comStyles.infoItem}>素材分类：{this.state.commodity.tags}</div>
                {/* <div className={comStyles.infoItem}>素材格式：{this.state.commodity.fileType}</div> */}
                {/* <div className={comStyles.infoItem}>素材大小：{"1325"}kb</div> */}
                {/* <div className={comStyles.infoItem}>创作时间：{formatDate(this.state.commodity.createTime)}</div> */}
                <div
                  className={comStyles.price}>价格：<span>{(this.state.commodity.largePrice / 100).toLocaleString()}电子</span>
                </div>
              </div>
              <div className={comStyles.btns}>
                <Button className={comStyles.btn} onClick={() => {
                  this.purchase()
                }}>下载</Button>
                {/* <Button className={comStyles.btn}>标价购买</Button> */}
              </div>
            </div>
          </div>
          <div>
            <div className={comStyles.mediaContainer}>
              <Image src={this.state.commodity.coverUrl}/>
            </div>
          </div>
          <div>
            <div className={comStyles.rightSiderContainer}>
              <div className={comStyles.users}>
                <div className={comStyles.userItem}>
                  <Avatar size={40} src={this.state.avatarUrl}/>
                  <div className={comStyles.userText}>
                    <span>@{this.state.nickname}</span>
                    <span style={{color: "#656565", fontSize: "10px"}}>{"发布者"}</span>
                  </div>
                </div>
              </div>
              <div className={comStyles.infos}>
                <div className={comStyles.infoItem}>
                  {
                    this.state.isLike ?
                      <HeartTwoTone twoToneColor={"red"} onClick={() => this.postLike()} className={comStyles.icon}/> :
                      <HeartOutlined onClick={() => this.postLike()} className={comStyles.icon}/>
                  }
                  <div className={comStyles.infoText}>
                    <span style={{fontWeight: 600}}>{this.state.likeNum}</span>
                    <span style={{color: "#656565"}}>{"喜欢"}</span>
                  </div>
                </div>
                <div className={comStyles.infoItem}>
                  <ShareAltOutlined className={comStyles.icon} onClick={() => this.postShare()}/>
                  <div className={comStyles.infoText}>
                    <span style={{fontWeight: 600}}>{this.state.shareNum}</span>
                    <span style={{color: "#656565"}}>{"分享"}</span>
                  </div>
                </div>
                <div className={comStyles.infoItem}>
                  <WarningOutlined className={comStyles.icon} onClick={() => this.postDislike()}/>
                  <div className={comStyles.infoText}>
                    <span style={{fontWeight: 600}}>{this.state.dislikeNum}</span>
                    <span style={{color: "#656565"}}>{"举报"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className={comStyles.historyContainer}>
          <div className={comStyles.historyTitle}>
            <span>{"历史记录"}</span>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={this.state.historyList}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  style={{ paddingBottom: 24, borderBottom: "1px solid #cfcfcf", maxWidth: 420 }}
                  title={<span>
                    <Link to="">@{item.bidderName}</Link>
                    出价：¥{item.bid}
                  </span>
                  }
                  description={
                    <span>
                      {getDateDiff(item.createTime)}&nbsp;&nbsp;&nbsp;&nbsp;
                      <Link to="">{"查看详情"}</Link>
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </div> */}

        <div className={comStyles.moreArtwork}>
          <h2>相似推荐</h2>
          <div>
            <List
              grid={{gutter: 16, column: 5}}
              dataSource={this.state.commodities}
              renderItem={item => (
                <List.Item>
                  <Link to={`/commodity/${item.id}`}>
                    <div className={comStyles.moreArtCover}>
                      <img alt="" className={comStyles.moreArtImg} src={item.coverUrl}/>
                      <span className={comStyles.moreArtText}>{item.title}</span>
                    </div>
                  </Link>
                </List.Item>
              )}
            />
          </div>
          <div>
            <Link className={comStyles.moreArtNav} to="">查看@{"艺术家"}的更多作品</Link>
          </div>
        </div>

        {/* <Row>
          <Col span={18}>
            <Card style={{marginRight: '10px', height: '100%'}}>
              <img style={{width: '100%'}} src={this.state.thing.url}/>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{marginLeft: '10px', height: '100%', position: 'relative'}}>
              <div style={{marginBottom: '10px'}}>
                <Descriptions title={this.state.thing.name} column={1}>
                  <Descriptions.Item label="作者"><Avatar size="small"
                                                        style={{margin: '5px', marginTop: '-5px', marginBottom: 0}}
                                                        src={this.state.author.avatarUrl}
                                                        alt="avatar"/>{this.state.author.nickname}</Descriptions.Item>
                  <Descriptions.Item label="拥有者"><Avatar size="small"
                                                         style={{margin: '5px', marginTop: '-5px', marginBottom: 0}}
                                                         src={this.state.owner.avatarUrl}
                                                         alt="avatar"/>{this.state.owner.nickname}</Descriptions.Item>
                  <Descriptions.Item label="简介">{this.state.thing.description}</Descriptions.Item>
                </Descriptions>
                <Row>
                  <Col span={8}>
                    <span
                      style={{
                        color: '#999',
                        fontSize: '14px',
                        marginRight: '20px',
                      }}>起拍价</span>
                  </Col>
                  <Col span={16}>
                    <span style={{color: '#999', fontSize: '14px'}}>￥ {this.state.startPrice}</span>
                  </Col>
                </Row>
              </div>
              <div style={{marginBottom: '10px'}}>
                <Row>
                  <Col span={8}>
                  <span
                    style={{
                      color: '#999',
                      fontSize: '14px',
                      marginRight: '20px'
                    }}>最小加价幅度</span>
                  </Col>
                  <Col span={16}>
                    <span style={{color: '#999', fontSize: '14px'}}>￥ {this.state.intervalPrice}</span>
                  </Col>
                </Row>
              </div>
              <div style={{marginBottom: '10px'}}>
                <Row>
                  <Col span={8}>
                  <span
                    style={{
                      color: '#999',
                      fontSize: '14px',
                      marginRight: '20px'
                    }}>拍卖开始时间</span>
                  </Col>
                  <Col span={16}>
                    <span style={{color: '#999', fontSize: '14px'}}>{formatDate(this.state.startTime)}</span>
                  </Col>
                </Row>
              </div>
              <div style={{marginBottom: '10px'}}>
                <Row>
                  <Col span={8}>
                  <span
                    style={{
                      color: '#999',
                      fontSize: '14px',
                      marginRight: '20px'
                    }}>拍卖结束时间</span>
                  </Col>
                  <Col span={16}>
                    <span style={{color: '#999', fontSize: '14px'}}>{formatDate(this.state.endTime)}</span>
                  </Col>
                </Row>
              </div>
              <div style={{marginBottom: '10px'}}>
                <Row>
                  <Col span={8}>
                  <span
                    style={{
                      color: '#999',
                      fontSize: '14px',
                      marginRight: '20px'
                    }}>上次出价</span>
                  </Col>
                  <Col span={8}>
                    <span style={{color: '#999', fontSize: '14px'}}>￥ {this.state.minePrice}</span>
                  </Col>
                </Row>
              </div>
              <div style={{position: 'absolute', bottom: 0, width: '88%'}}>
                <div style={{marginBottom: '10px'}}>
                  <Row>
                    <Col span={8}>
                  <span
                    style={{
                      color: '#666',
                      fontSize: '26px'
                    }}>当前价</span>
                    </Col>
                    <Col span={16}>
                      <span style={{color: '#f96600', fontSize: '26px'}}>￥ {this.state.currPrice}</span>
                    </Col>
                  </Row>
                </div>
                <Button style={{width: '100%', marginBottom: '20px'}} size="large" type="primary" onClick={() => {
                  this.setState({
                    isBidModalVisible: true
                  })
                }}>竞价</Button>
              </div>
            </Card>
          </Col>
        </Row> */}
        {/*<div>*/}
        {/*  <h1 style={{fontSize: '22px', marginTop: '20px'}}>相似推荐</h1>*/}
        {/*  <div>*/}
        {/*    <List<CommodityItem>*/}
        {/*      rowKey="id"*/}
        {/*      grid={{gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1}}*/}
        {/*      dataSource={this.state.commodities}*/}
        {/*      renderItem={(item) => (*/}
        {/*        <List.Item key={item.id} style={{textAlign: 'center'}}>*/}
        {/*          <Link*/}
        {/*            to={`/commodity/${item.id}`}>*/}
        {/*            <Card className={styles.card} hoverable*/}
        {/*                  cover={<img alt={item.title} src={item.coverUrl}/>}>*/}
        {/*              <Card.Meta title={<a>{item.title}</a>}/>*/}
        {/*            </Card>*/}
        {/*          </Link>*/}
        {/*        </List.Item>*/}
        {/*      )}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>



      // <div>
      //   <Row>
      //     <Col span={6}>
      //       <div className={comStyles.siderContainer}>
      //         <div className={comStyles.title}>
      //           <span className={comStyles.titleText}>{this.state.commodity.title}</span>
      //         </div>
      //         <div className={comStyles.info}>
      //           <div className={comStyles.infoItem}>素材分类：{this.state.commodity.tags}</div>
      //           <div className={comStyles.infoItem}>素材格式：{"jpeg"}</div>
      //           <div className={comStyles.infoItem}>素材大小：{"xxx "}kb</div>
      //           <div className={comStyles.infoItem}>创作时间：{"2020-09-01"}</div>
      //         </div>
      //         <div className={comStyles.price}>价格：<span>￥{"233.33"}</span></div>
      //         <div className={comStyles.btns}>
      //           <Button className={comStyles.btn}>单品购买</Button>
      //           <Button className={comStyles.btn}>会员下载</Button>
      //         </div>
      //       </div>
      //     </Col>
      //     <Col span={12}>
      //       <Card style={{ height: '100%' }} bordered={false}>
      //         {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      //         <video style={{ width: '100%' }} src={this.state.commodity.contentUrl} controls="controls" />
      //         <div style={{ marginTop: '10px' }}>{this.state.commodity.description}</div>
      //       </Card>
      //     </Col>
      //     <Col span={6}>
      //       <Card style={{ height: '100%' }} bordered={false}>
      //         <div style={{ marginBottom: '10px' }}>
      //           <span
      //             style={{
      //               color: '#999',
      //               fontSize: '14px',
      //               marginRight: '20px'
      //             }}>价&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;格</span>
      //           <span style={{color: '#f96600', fontSize: '26px'}}>{this.state.commodity.largePrice * 1.0 / 100}</span>
      //           <span style={{color: '#f96600', fontSize: '14px'}}>/元</span>
      //         </div>
      //         <div style={{marginBottom: '10px'}}>
      //           <span
      //             style={{
      //               color: '#999',
      //               fontSize: '14px',
      //               marginRight: '20px'
      //             }}>当前价</span>
      //           <span style={{color: '#f96600', fontSize: '26px'}}>{this.state.commodity.largePrice * 1.0 / 100}</span>
      //           <span style={{color: '#f96600', fontSize: '14px'}}>/元</span>
      //         </div>
      //         <Button style={{width: '100%', marginBottom: '20px'}} size="large" type="primary" onClick={() => {
      //           this.purchase()
      //         }}>立即下载</Button>
      //         <div dangerouslySetInnerHTML={{__html: this.state.commodity.signingInfo}}/>
      //       </Card>
      //     </Col>
      //   </Row>
      //   <div>
      //     <h1 style={{fontSize: '22px', marginTop: '20px'}}>相似推荐</h1>
      //     <div>
      //       <List<CommodityItem>
      //         rowKey="id"
      //         grid={{gutter: 24, xxl: 4, xl: 4, lg: 3, md: 3, sm: 2, xs: 1}}
      //         dataSource={this.state.commodities}
      //         renderItem={(item) => (
      //           <List.Item key={item.id} style={{textAlign: 'center'}}>
      //             <Link
      //               to={`/commodity/${item.id}`}>
      //               <Card className={styles.card} hoverable
      //                     cover={
      //                       <div className={styles.cardCover}>
      //                         <img
      //                           style={{
      //                             borderRadius: "10px 10px 0 0",
      //                             height: " 360px",
      //                           }}
      //                           alt={item.title}
      //                           src={item.coverUrl === "http://39.102.36.169:6789/static/2020_09_06_13_11_37_0880_CG艺术家_20200906093556_20200906093632289.xlsx" ? Loading : item.coverUrl}/>
      //                       </div>
      //                     }>
      //                 <Card.Meta
      //                   title={<div className={styles.info}>
      //                     <span>{item.title}</span>
      //                     <span style={{float: "right", color: "#fe2431"}}>{"2901 ETH"}</span>
      //                     <div style={{marginTop: "10px", alignItems: "center"}}>
      //                       <Avatar src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png"/>
      //                       <Link
      //                         style={{marginLeft: "10px", color: "#000"}}
      //                         to="">
      //                         <span>@</span>
      //                         <span>用户名1</span>
      //                         <span style={{
      //                           float: "right",
      //                           color: "#fe2431",
      //                           fontSize: "10px",
      //                           lineHeight: "32px"
      //                         }}>{"1小时前"}</span>
      //                       </Link>
      //                     </div>
      //                   </div>

      //                   }/>
      //               </Card>
      //             </Link>
      //           </List.Item>
      //         )}
      //       />
      //     </div>
      //   </div>
      // </div>

    );
  }
}

export default connect(
  ({loading}: ConnectState) =>
    ({
      loading: loading.effects["resource/searchScripts"]
    }),
)
(Commodity);
