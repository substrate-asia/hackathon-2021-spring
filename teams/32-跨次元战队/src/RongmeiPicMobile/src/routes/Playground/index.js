import React from "react";
import {api} from "../../services/api/ApiProvider";
import "./playground.css";
import like from "../../assets/like.png";
import likeRed from "../../assets/like-red.png";
import share from "../../assets/share.png";
import logo from "../../assets/logo.png";
import link from "../../assets/link.png";
import warn from "../../assets/warn.png";
import {withRouter} from "react-router-dom";
import {ActionSheet, List, Modal, Toast} from "antd-mobile";
import {copyToClip} from "../../utils/utils";

@withRouter
class Playground extends React.Component {
  auctionService = api.auctionService;
  relationService = api.relationService;
  metricsService = api.metricsService;

  state = {
    page: 1,
    limit: 10,
    offset: 0,
    data: [],
    index: 0,
    sale: [],

    isLike: false,
    likeNum: 0,
    shareNum: 0,

    y: 0,

    isShareModalVisible: false
  };

  async componentDidMount() {
    await this.getSales();
    this.updateLike();
    this.updateShare();
  }

  async getCommodities() {
    let commodities = this.state.commodities;
    let params = {
      tags: [],
      key: '',
      orderKey: 'all',
      offset: this.state.offset,
      limit: this.state.limit,
    };
    let res = await api.commodityService.getCommodities(params);
    if (res && res.commodities.length > 0) {
      commodities = commodities.concat(res.commodities);
    }
    this.setState({
      data: commodities
    })
  }

  async getSales() {
    let res = await this.auctionService.getSales({
      key: '',
      limit: this.state.limit,
      offset: (this.state.page - 1) * this.state.limit,
      outdated: false,
      ownedByAuthor: false,
      rankType: 0,
      tags: []
    })
    let saleItems = res.saleItems;
    let userNicknameMap = new Map();
    for (let i = 0; i < saleItems.length; i++) {
      let item = saleItems[i];
      saleItems[i].coverUrl = item.thing.url
      saleItems[i].title = item.thing.name
      let owner = item.thing.owner;
      if (userNicknameMap.has(owner)) {
        saleItems[i].ownerAvatarUrl = userNicknameMap.get(owner);
      } else {
        const res = await api.userService.getUserInfoEntity(owner);
        if (res.avatarUrl) {
          saleItems[i].ownerAvatarUrl = res.avatarUrl;
          userNicknameMap.set(owner, res.avatarUrl);
        }
      }
    }
    if (saleItems.length > 0) {
      let newIndex = this.state.index + 1;
      let sale = saleItems.length > 0 ? saleItems[0] : this.state.sale;
      let newData = this.state.data.concat(saleItems);
      await this.setState({
        index: newIndex,
        sale,
        data: newData
      })
    }
  }

  postLike = async () => {
    const thingId = this.state.sale.thing ? this.state.sale.thing.id : 0;
    await this.relationService.postLike(thingId, 0);
    await this.updateLike();
  }

  updateLike = async () => {
    const thingId = this.state.sale.thing ? this.state.sale.thing.id : 0;
    const res = await this.relationService.getLike(thingId, 0);
    this.setState({
      isLike: res.isLike,
      likeNum: res.likeNum
    })
  }

  postShare = async () => {
    this.openShareModalVisible();
  }

  updateShare = async () => {
    const thingId = this.state.sale.thing ? this.state.sale.thing.id : 0;
    const res = await this.metricsService.getShare(thingId);
    this.setState({
      shareNum: res.count
    })
  }

  async nextItem() {
    if (this.state.index < this.state.data.length - 1) {
      let newIndex = this.state.index + 1;
      let sale = this.state.data[newIndex];
      await this.setState({
        index: newIndex,
        sale,
      })
    } else {
      await this.setState({
        page: this.state.page + 1
      })
      await this.getSales();
    }
    this.updateLike();
    this.updateShare();
  }

  async lastItem() {
    if (this.state.index > 0) {
      let newIndex = this.state.index - 1;
      let sale = this.state.data[newIndex];
      await this.setState({
        index: newIndex,
        sale,
      })
    }
    this.updateLike();
    this.updateShare();
  }

  toSale(id) {
    this.props.history.push(`sale/${id}`);
  }

  actionList = [
    {
      icon: <img src={link} alt={"复制链接"} style={{width: 36}}/>,
      title: "复制链接",
      action: async () => {
        copyToClip("https://m.dimension.pub/#/picmobile/sale/" + this.state.sale.id);
        Toast.success("链接已复制");
        const thingId = this.state.sale.thing ? this.state.sale.thing.id : 0;
        await this.metricsService.addShare(thingId, "");
        await this.updateShare();
      }
    },
    {
      icon: <img src={warn} alt={"举报"} style={{width: 36}}/>,
      title: "举报",
      action: () => {
        if (this.state.sale) {
          this.props.history.push(`report/${this.state.sale.id}`);
        } else {
          Toast.info("开发中，尽情期待")
        }
      }
    }
  ]

  openShareModalVisible = () => {
    ActionSheet.showShareActionSheetWithOptions({
        options: this.actionList,
        title: '分享',
      },
      (buttonIndex) => {
        if (this.actionList[buttonIndex]) {
          this.actionList[buttonIndex].action();
        }
      });
  }

  render() {
    return (
      <div style={{background: '#000'}}>
        <div style={{
          width: '100%',
          top: '0px',
          position: 'absolute',
          zIndex: 999,
          background: '#000',
        }}>
          <div style={{
            textAlign: 'center',
            color: '#fff',
            paddingTop: '20px',
            paddingBottom: '20px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: '#000',
          }}>推荐
          </div>
        </div>
        首页
      </div>
    )
  }
}

export default Playground;
