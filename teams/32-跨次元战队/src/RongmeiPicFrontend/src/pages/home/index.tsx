import React, {Component} from 'react';

import {Carousel, Col, Row, Button} from 'antd';
import {MenuDataItem} from '@ant-design/pro-layout';
import {ConnectProps} from "@@/plugin-dva/connect";
import {connect, Link} from "umi";
import {ConnectState} from "@/models/connect";
import {getTCC} from "@/services/tcc";
import {
  getAuctionTransactionHistories,
  getThingByTokenId,
  getTopArtist,
  getStatistics, getTopTags
} from "@/services/auction";
import {getCommodities} from "@/services/commodity";
import homeStyles from "./home.less";

interface HomeProps extends Partial<ConnectProps> {
  loading: boolean;
  menuData: MenuDataItem[];
  key: string;
}

class Home extends Component<HomeProps> {
  state = {
    keywords: [],
    events: [],
    commodities: [],
    key: '',
    currentTrans: [],
    topTags: [],
    topArtists: [],
    thingNum: 999,
    saleNum: 999,
    ethNum: 999,
    money: 999,
  }

  async componentDidMount(): void {
    const {dispatch} = this.props;
    let res = await getTCC('rongmei.pic.searchkeywords')
    let eventRes = await getTCC('rongmei.pic.event')
    this.setState({
      keywords: eval(res.tccTuple.value),
      events: eval(eventRes.tccTuple.value)
    })
    this.getRecommendCommodities();
    this.getRecentTrans();
    this.getTopUsers();
    this.getWholeStatistics();
    let token = localStorage.getItem('token');
    if (!token || token.length === 0) {
      if (dispatch) {
        dispatch({
          type: 'user/changeLoginShow',
          payload: {
            isShowLogin: true
          }
        });
      }
    }
  }

  async getWholeStatistics() {
    const res = await getStatistics();
    this.setState({
      thingNum: res.thingNum,
      saleNum: res.saleNum,
      ethNum: res.ethNum,
    })
    this.setState({
      money: res.ethNum
    });
  }

  async getRecentTrans() {
    const res = await getAuctionTransactionHistories({
      limit: 3,
      offset: 0,
    });
    let transHistory = res.auctionTransactionHistories;
    transHistory.forEach(async (value, key) => {
      let thingRes = await getThingByTokenId(value.tokenId);
      transHistory[key].thing = thingRes;
    });
    this.setState({
      currentTrans: transHistory,
    })
  }

  async getTopUsers(): void {
    const topArtistRes = await getTopArtist({
      limit: 3,
      offset: 0
    })
    const endTime = new Date().getTime();
    const startTime = endTime - 7 * 24 * 60 * 60 * 1000
    const nftTypeRes = await getTCC('dimension.nft.type');
    const typeTcc = eval(nftTypeRes.tccTuple.value);
    let tccMap = {};
    for (let i = 0; i < typeTcc.length; i++) {
      tccMap[typeTcc[i].tag] = typeTcc[i].name;
    }
    const topTagsRes = await getTopTags(startTime, endTime);
    let topTagNames: string[] = [];
    for (let i = 0; i < topTagsRes.tagHotItems.length; i++) {
      topTagNames = topTagNames.concat(tccMap[topTagsRes.tagHotItems[i].tag]);
    }
    topArtistRes.auctionArtistItems.forEach((item, index) => {
      if (item.id === 0)
        topArtistRes.auctionArtistItems.pop(index);
    })
    this.setState({
      topTags: topTagNames,
      topArtists: topArtistRes.auctionArtistItems
    })
  }

  handleFormSubmit = (value: string) => {
    const {dispatch} = this.props;
    if (dispatch) {
      dispatch({
        type: 'commodity/searchCommodities',
        payload: {
          tags: [],
          key: value,
          orderKey: 'all',
          offset: 0,
          limit: 20
        }
      });
    }
    this.props.history.push(`/search/${value}`)
  };

  getRecommendCommodities = async () => {
    const response = await getTCC("rongmei.orient.secondtype");
    const allType = eval(response.tccTuple.value.replace(/\s*/g, ""));
    const res = await getCommodities({
      tags: [allType[0][0].typeList[0]],
      key: '',
      orderKey: 'all',
      offset: 0,
      limit: 10
    })
    this.setState({
      commodities: res.commodities
    })
  }

  render() {
    return (
      <div className={homeStyles.auctionContainer}>
        <div className={homeStyles.auctionHero}>
          <div className={homeStyles.heroTextContainer}>
            <div className={`${homeStyles.heroText} left`}>
              收集
            </div>
            <div className={`${homeStyles.heroText} right`}>
              <span className={homeStyles.heroHighlightText}>
                跨次元
              </span>
              <span className={homeStyles.heroTextSecondLine}>
                内容数字资产
              </span>
            </div>
          </div>
          <div className={homeStyles.heroLinks}>
            <Link to="/auction">
              <Button className={homeStyles.homeHeroCtaBtn}>
                开始收集
              </Button>
            </Link>
            <Link className={homeStyles.heroSecondaryLink} to="/auction">
              了解更多
            </Link>
          </div>
        </div>
        <Carousel
          className={homeStyles.banner}
          autoplay
          dotPosition="bottom">
          {this.state.events.map((val, index) => (
            <div className={homeStyles.bannerItem}>
              <img className={homeStyles.bannerImg} alt="" src={val.coverUrl}/>
            </div>
          ))}
        </Carousel>
        <div className={homeStyles.auctionState}>
          <div className={homeStyles.auctionStateItem}>
            <div>
              <span className={homeStyles.auctionStateItemNumber}>{this.state.thingNum}</span>
              <span className={homeStyles.auctionStateItemText}>内容数字资产收藏</span>
            </div>
          </div>
          <div className={homeStyles.auctionStateItem}>
            <div>
              {/* to-do 艺术家收益 */}
              <span className={homeStyles.auctionStateItemNumber}>¥{this.state.money}</span>
              <span className={homeStyles.auctionStateItemText}>创作者收益</span>
            </div>
          </div>
          <div className={homeStyles.auctionStateItem}>
            <div>
              {/* to-do 收藏家收益 */}
              <span className={homeStyles.auctionStateItemNumber}>{this.state.saleNum}</span>
              <span className={homeStyles.auctionStateItemText}>竞价件数</span>
            </div>
          </div>
          {/* to-do 国别待定 */}
          {/* <div className={homeStyles.auctionStateItem}>
            <div>
              <span className={homeStyles.auctionStateItemNumber}>{46}</span>
              <span className={homeStyles.auctionStateItemText}>国别</span>
            </div>
          </div> */}
        </div>
        <div className={homeStyles.auctionInfoContainer}>
          <div className={homeStyles.auctionInfo}>
            <div className={homeStyles.infoTitlecontainer}>
              <h2 className={homeStyles.infoTitle}>如何收集</h2>
              <h2 className={homeStyles.infoTitle}>内容数字资产</h2>
            </div>
            <div className={`${homeStyles.infoSection} first`}>
              <h6 className={homeStyles.infoSectionTitle}>探索内容数字资产作品收藏</h6>
              <p>内容数字资产创作者在平台中发布经过身份验证的内容数字资产作品。这些作品均在以太坊区块链中经过验证，可以防止伪造并提供相关信息。</p>
            </div>
            <div className={`${homeStyles.infoSection} second`}>
              <h6 className={homeStyles.infoSectionTitle}>交易</h6>
              <p>以要价购买或通过出价购买。一旦拥有了一件作品，就可以在二级市场上将其转售给其他收藏者。</p>
            </div>
            <div className={`${homeStyles.infoSection} third`}>
              <h3 className={homeStyles.infoSectionTitle}>展示您的收藏</h3>
              <p>自定义您的个人资料，向全世界各地的用户展示您的内容数字资产收藏。您可以在VR画廊或者各类数码显示其中展示您的内容数字资产作品。</p>
            </div>
          </div>
          <Link to="/auction" className={homeStyles.auctionInfoLink}
                style={{margin: "5em auto 0px", display: "block", textAlign: "center"}}>
            <Button className={homeStyles.homeHeroCtaBtn}>开始收集</Button>
          </Link>
        </div>
        <div className={homeStyles.auctionFeatureSection}>
          {/* <div>
            <h2 className={homeStyles.recentActivityTitle}>最新动态</h2>
            <Row className={homeStyles.auctionActivityGrid}>
              {
                this.state.currentTrans.map((item) => (
                  <Col xs={24} sm={8} md={8} className={homeStyles.auctionActivityGridItem}>
                    <div>
                      <div className={homeStyles.recentAuctionItem}>
                        <div className={homeStyles.squareBox} style={{marginBottom: "2em"}}>
                          <div className={homeStyles.squareContent}>
                            <Link to="/activity">
                              <div className={homeStyles.artworkThumbnailContainer}>
                                <div>
                                  <div>
                                    <div className={homeStyles.recentActivityItemImg}>
                                      <img src={item.thing == null ? '' : item.thing.url}
                                           className={homeStyles.recentActivityItemImg} alt=""/>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>
                        <div className={homeStyles.artworkThumbnailIcon}>
                          <img src="https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png" alt="avatar"
                               className={homeStyles.activityAvatar}/>
                        </div>
                        <span className={homeStyles.recentActivityAction}>
                          <a className={homeStyles.recentActivityItemUserLink}>@{item.nickname}xxx</a>
                          <span>在</span>
                          <a className={homeStyles.recentActivityItemArtLink}>{item.name}</a>
                          <span>{"中出价约"}</span>
                          <span>{`${item.eth}IMM(¥${(item.eth / 100).toFixed(2)})`}</span>
                          <br/>
                          <span>2分钟前</span>
                        </span>
                      </div>
                    </div>
                  </Col>
                ))
              }
            </Row>
            <div style={{textAlign: 'center', marginBottom: "5em"}}>
              <Link to="/record"
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      display: 'block',
                    }}
              >
                <Button className={homeStyles.homeHeroCtaBtn}>查看实时动态</Button>
              </Link>
            </div>
          </div> */}
          <div className={homeStyles.auctionInfoContainer}
               style={{paddingTop: 100, borderTop: "1 solid rgb(0, 0, 0)",}}>
            <div className={homeStyles.auctionInfo}>
              <div className={homeStyles.infoTitleContainer}>
                <h2 className={homeStyles.infoTitle}>如何成为</h2>
                <h2 className={homeStyles.infoTitle}>内容数字资产</h2>
                <h2 className={homeStyles.infoTitle}>创作者</h2>
              </div>
              <div className={`${homeStyles.infoSection} first`}>
                <h6 className={homeStyles.infoSectionTitle}>申请加入</h6>
                <p>首先申请加入我们的全球内容数字资产创作者社区————跨次元。</p>
              </div>
              <div className={`${homeStyles.infoSection} second`}>
                <h6 className={homeStyles.infoSectionTitle}>验证作品</h6>
                <p>通过创建密码令牌对您的工作进行第一无二的标记。</p>
              </div>
              <div className={`${homeStyles.infoSection} third`}>
                <h6 className={homeStyles.infoSectionTitle}>设定与接受价格</h6>
                <p>设置价格直接出售或在内容数字资产竞价市场中让收藏家们购买您的内容数字资产作品。</p>
              </div>
            </div>
            <a
              // target="_blank"
              href="https://www.wenjuan.in/s/UZBZJvAGBC/"
              target="_blank"
              style={{
                marginTop: '5em',
                marginBottom: 0,
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block',
                textAlign: 'center',
              }}
            >
              <Button className={homeStyles.homeHeroCtaBtn}>申请加入</Button>
            </a>
          </div>
          {/* to-do 顶级用户群 */}
          <div className={homeStyles.auctionChartsSection}>
            <h2>市场走势</h2>
            <div className={homeStyles.auctionChartsCard}>
              <span className={homeStyles.titleSection}>
                {/* <a className={homeStyles.title} href=""> */}
                顶级创作者
                {/* </a> */}
                <span className={homeStyles.subtitle}>最近收集</span>
              </span>
              <hr className={homeStyles.titleDivider}/>
              {
                this.state.topArtists.map((item) => (
                  <div className={homeStyles.entry}>
                    <Link to={{
                      pathname: `/person/${item.code}`,
                    }}>
                      <span className={homeStyles.user}>
                        <div className={homeStyles.userAvatar}>
                          <img alt="" src={item.avatarUrl} className={homeStyles.avatarImg}/>
                        </div>
                        <p>
                          {`@${item.nickname}`}
                        </p>
                      </span>
                    </Link>
                    <span className={homeStyles.quantity}>123</span>
                  </div>
                ))
              }
              {/* <a className={homeStyles.linkSeeAll} href="/top-artists">查看全部</a> */}
            </div>
            <div className={homeStyles.auctionChartsCard}>
              <span className={homeStyles.titleSection}>
                {/* <a className={homeStyles.title} href=""> */}
                最近热门
                {/* </a> */}
                <span className={homeStyles.subtitle}>最近收集</span>
              </span>
              <hr className={homeStyles.titleDivider}/>
              {
                this.state.topTags.length > 0 ? this.state.topTags.map((item) => (
                  <div className={homeStyles.entry}>
                    <Link to={`/auction`}>
                      <span className={homeStyles.user}>
                        <div className={homeStyles.userAvatar}>
                        </div>
                        <p>
                          {item.tag}
                        </p>
                      </span>
                    </Link>
                    <span className={homeStyles.quantity}>{item.count}</span>
                  </div>
                )) : ""
              }
              {/* <a className={homeStyles.linkSeeAll} href="/top-artists">查看全部</a> */}
            </div>
            <div className={homeStyles.cta}>
              <Link to="/auction">
                <Button className={homeStyles.homeHeroCtaBtn}>
                  开始收集
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>

      // <PageHeaderWrapper
      //   title={false}
      //   content={mainSearch}
      // >
      //   <div style={{textAlign: 'center'}}>
      //     <h1 style={{fontSize: '26px'}}>区块链，活动咨询</h1>
      //     <h5>说明文案说明文案说明文案说明文案说明文案说明文案说明文案</h5>
      //     <Row gutter={16} style={{marginTop: '20px'}}>
      //       {
      //         this.state.events.map((event) => (
      //           <Col span={8}>
      //             <Card
      //               hoverable
      //               cover={<img src={event.coverUrl}/>}
      //             >
      //               <Card.Meta title={event.title} description={event.description}/>
      //             </Card>
      //           </Col>
      //         ))
      //       }
      //     </Row>
      //   </div>
      //   <div style={{textAlign: 'center', marginTop: '30px', width: '100%'}}>
      //     <Tabs defaultActiveKey={menuData && menuData.length > 0 ? menuData[0] : ''} onChange={async () => {
      //       this.getRecommendCommodities()
      //     }}>
      //       {
      //         menuData.map((item) => (
      //           <Tabs.TabPane tab={item.name} key={item.name}>
      //             <List<CommodityItem>
      //               rowKey="id"
      //               grid={{gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1}}
      //               dataSource={this.state.commodities}
      //               renderItem={(item) => (
      //                 <List.Item key={item.id}>
      //                   <Link
      //                     to={`/commodity/${item.id}`}>
      //                     <Card className={styles.card} hoverable
      //                           cover={<img alt={item.title} src={item.coverUrl}/>}>
      //                       <Card.Meta title={<a>{item.title}</a>}/>
      //                     </Card>
      //                   </Link>
      //                 </List.Item>
      //               )}
      //             />
      //           </Tabs.TabPane>
      //         ))
      //       }
      //     </Tabs>
      //   </div>
      // </PageHeaderWrapper>
    );
  }
}

export default connect(
  ({loading, menuData, commodity}: ConnectState) =>
    ({
      loading: loading.effects["resource/searchScripts"],
      menuData: menuData.menuData,
      key: commodity.key
    }),
)
(Home);
