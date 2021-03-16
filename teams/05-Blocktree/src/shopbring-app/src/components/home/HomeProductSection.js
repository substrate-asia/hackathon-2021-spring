import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";
import ShowcaseHeader from "../header/ShowcaseHeader.js";
import ProductItem from "../main/ProductItem.js";
import "assets/style/product.scss";
import request from "util/request";

class HomeProductSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      isReadMore: false,
    };
    this.handleReadMoreProduct = this.handleReadMoreProduct.bind(this);
  }

  componentDidMount() {
    request("order/index", {})
      .then((orders) => {
        this.setState({ orders });
      })
      .catch((err) => console.log(err));
  }

  handleReadMoreProduct() {
    this.setState({
      isReadMore: true,
    });
  }

  render() {
    const { isReadMore, orders } = this.state;

    let itemOrderCard = orders.map(function (item) {
      return (
        <ProductItem
          {...item}
          key={item.order_id}
          img={
            item.commodities
              ? item.commodities[0].img
              : require("../../assets/img/logo.png")
          }
        />
      );
    });

    const btnReadMore = (
      <Button
        className="load-more-btn"
        fluid
        onClick={this.handleReadMoreProduct}
      >
        READ MORE
      </Button>
    );

    let controllerReadMore = null,
      itemsReadMoreProduct = null;

    return (
      <Grid id="hot-products" textAlign="center">
        <Grid.Column width={13}>
          <ShowcaseHeader
            headerMain="WAITING FOR ORDER"
            headerSub="Get commission reward."
            iconHeader="gift"
          />
          <div id="product-list">
            {itemOrderCard}
            {isReadMore ? itemOrderCard : ""}
          </div>
          {!isReadMore ? btnReadMore : ""}
        </Grid.Column>
      </Grid>
    );
  }
}

export default HomeProductSection;
