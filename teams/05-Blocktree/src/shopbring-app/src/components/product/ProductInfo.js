import React from "react";
import { Grid } from "semantic-ui-react";
import ProductImages from "./ProductImages";
import ProductHeader from "./ProductHeader";
import ProductTag from "./ProductTag";
import ProductDetail from "./ProductDetail";
import request from "util/request";

class ProductInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: "",
      dataProInfo: {
        title: "Loading",
        category: "",
        type: "",
        name: "Loading",
        price: "Loading",
        detail: { color: ["red", "blue"], size: ["", "", "", "", ""], des: "" },
        pic: require("../../assets/img/logo.png"),
        shipping: "",
      },
      canAddToCart: true,
    };
    this.handleSelectTag = this.handleSelectTag.bind(this);
    this.handleAddOnceToCart = this.handleAddOnceToCart.bind(this);
  }

  handleSelectTag(pid, value) {
    const {
      selected,
      dataProInfo: { aSkupid },
    } = this.state;

    let id = selected;
    if (!id) {
      aSkupid.forEach((item) => {
        id += `${item.pid}:${item.pid};`;
      });
      id = id.slice(0, id.length - 1);
    }
    id = id.replace(new RegExp(`${pid}:\\d+`), `${pid}:${value}`);

    this.setState({
      selected: id,
    });
  }

  componentDidMount() {
    const { location } = this.props;
    if (!location || !location.search) {
      window.location.pathname = "/";
    }
    const params = new URLSearchParams(location.search.substring(1));
    const url = params.get("url");

    request("product/scratch", {
      url: decodeURIComponent(url),
    })
      .then((res) => {
        this.setState({
          dataProInfo: res,
        });
      })
      .catch((err) => console.log(err));
  }

  handleAddOnceToCart() {
    this.setState({ canAddToCart: false });
  }

  render() {
    const { handleSelectTag, handleAddOnceToCart } = this;

    const { dataProInfo, canAddToCart, selected } = this.state;

    const selectedTag = (pid) => {
      const { selected, dataProInfo } = this.state;
      const tag = selected.match(new RegExp(`${pid}:(\\d+)`));
      return [
        dataProInfo.aSkutransd[pid],
        tag && tag.length > 1 && tag[1] !== pid
          ? dataProInfo.aSkutransd[tag[1]]
          : "",
      ];
    };

    let hasSelected = false;
    let salePrice = "";
    if (!!selected) {
      salePrice = dataProInfo.sSkusetinfo[`${selected}locprice`];
      hasSelected = !!salePrice;
      if (!salePrice) salePrice = Object.values(dataProInfo.sSkusetinfo)[0];
    } else {
      salePrice =
        dataProInfo && dataProInfo.sSkusetinfo
          ? Object.values(dataProInfo.sSkusetinfo)[0]
          : "0.00";
    }

    const proInfo = {
      id: selected,
      name: dataProInfo.title,
      salePrice: salePrice,
      srcImg: dataProInfo.pic,
      quantity: 1, // TODO
      tags:
        dataProInfo && dataProInfo.aSkupid
          ? dataProInfo.aSkupid.map(({ pid }) => {
              return selectedTag(pid);
            })
          : [],
      shipping: dataProInfo.shipping,
      merchant: dataProInfo.nick,
      url: dataProInfo.url,
    };

    return (
      <Grid.Row>
        <Grid.Column width={6}>
          <ProductImages img={dataProInfo.pic} />
        </Grid.Column>
        <Grid.Column id="product-info" width={6} textAlign="left">
          <ProductHeader
            name={dataProInfo.title}
            price={{
              marketPrice: dataProInfo.price,
              salePrice,
            }}
          />
          {dataProInfo.aSkupid &&
            dataProInfo.aSkupid.length > 0 &&
            dataProInfo.aSkupid.map(({ pid }) => (
              <ProductTag
                key={pid}
                title={dataProInfo.aSkutransd[pid]}
                data={dataProInfo.aShowsku[pid].map((item) => {
                  return {
                    id: item,
                    name: dataProInfo.aSkutransd[item],
                    img: dataProInfo.aPropimgs[`${pid}:${item}`],
                  };
                })}
                selected={selectedTag(pid)[1]}
                handleSelect={(item) => handleSelectTag(pid, item)}
              />
            ))}
          <ProductDetail
            dataDes={dataProInfo.desc}
            canAddToCart={canAddToCart}
            hasSelected={hasSelected}
            handleAddToCart={this.props.handleAddToCart}
            handleAddOnceToCart={handleAddOnceToCart}
            proInfo={proInfo}
          />
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default ProductInfo;
