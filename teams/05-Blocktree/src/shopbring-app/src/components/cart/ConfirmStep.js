import React, { Component } from "react";
import { Grid, Header, Button, Popup } from "semantic-ui-react";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { PolkadotContext } from "util/polkadotContext";
import ConfirmOrder from "./ConfirmOrder";
import OrderBar from "./OrderBar";
import request from "util/request";

const propTypes = {
  handleBillDone: PT.func,
};

class ConfirmStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reward: "",
      receiver: "",
      mobile: "",
      address: "",
      errMsg: "",
      loading: false,
      isExtensionNotFound: false,
    };
  }

  componentDidMount() {
    web3Enable("SHOPBRING").then((extensions) => {
      if (extensions.length === 0) {
        this.setState({
          isExtensionNotFound: true,
          errMsg: "Extension Not Found",
        });
        return;
      } else {
        this.setState({ isExtensionNotFound: false });
      }
    });
  }

  handleInput(name, value) {
    this.setState({ [name]: value });
  }

  handleApply() {
    const { cart, handleBillDone } = this.props;
    const { receiver, mobile, address, reward } = this.state;
    this.setState({ loading: true });

    let valueTotal = 0;
    let delivery = 0;
    let note = "";
    let commodities = [];
    let merchant = "";
    cart.forEach((item) => {
      const total = parseFloat(item.quantity) * item.salePrice;
      const shipping = parseFloat(item.shipping);
      valueTotal += total;
      delivery += shipping;
      merchant = item.merchant;
      item.tags.forEach((tag) => {
        note += " " + tag[0] + ":" + tag[1];
      });
      commodities.push({
        skuid: item.id,
        name: item.name,
        url: item.url,
        options: item.tags,
        amount: item.quantity,
        price: item.salePrice,
        total: total + shipping,
        note: "运费：" + item.shipping, // TODO
        img: item.srcImg,
      });
    });
    let tip = parseFloat(reward);
    let total = valueTotal + delivery + tip;

    request("place/upset", { name: receiver, mobile, address }, true)
      .then((resp) => {
        const place_id = resp.id;
        const data = {
          platform_id: "1367439605804171265", // TODO
          place_id,
          payment_amount: total * 100000000, // TODO decimal
          tip: tip * 100000000, //TODO decimal
          currency: "1",
          required_deposit: "0",
          required_credit: "0",
          note,
          merchant: "[Taobao]" + merchant, // TODO
          total: total * 100000000, // TODO
          commodities,
        };
        request("order/applyOrder", data, true)
          .then((order) => {
            console.log(order);
            web3FromAddress(order.consumer)
              .then((injected) => {
                const signRaw =
                  injected && injected.signer && injected.signer.signRaw;
                if (!signRaw) {
                  return console.error("Signer not available");
                }
                this.context.api.tx.commissionedShopping
                  .applyShoppingOrder(
                    data.payment_amount,
                    data.tip,
                    data.currency,
                    data.required_deposit,
                    data.required_credit,
                    this.context.runtimeVersion.specVersion,
                    order.ext_order_hash
                  )
                  .signAndSend(
                    order.consumer,
                    { signer: injected.signer },
                    ({ status }) => {
                      if (status.isInBlock) {
                        this.setState({
                          errMsg: `Completed at block hash #${status.asInBlock.toString()}`,
                        });
                      } else {
                        if (status.isBroadcast) {
                          this.setState({
                            errMsg: `Broadcasting the application #${order.ext_order_hash}`,
                          });
                        } else {
                          this.setState({
                            errMsg: `Current status: ${status.type}`,
                          });
                          if (status.isFinalized) {
                            handleBillDone();
                          }
                        }
                      }
                    }
                  )
                  .catch((err) => {
                    this.setState({ errMsg: err, loading: false });
                    console.error("ERROR:", err);
                  });
              })
              .catch((err) => {
                this.setState({ errMsg: err, loading: false });
              });
          })
          .catch((err) => {
            this.setState({ errMsg: err, loading: false });
          });
      })
      .catch((err) => {
        this.setState({ errMsg: err, loading: false });
      });
  }

  render() {
    const props = this.props;
    const {
      receiver,
      mobile,
      address,
      reward,
      errMsg,
      loading,
      isExtensionNotFound,
    } = this.state;

    return (
      <Grid.Row id="checkout">
        <Grid.Column id="checkout-controller" width="8" textAlign="left">
          <Header
            as="h2"
            className="controller-header"
            content="CONFIRM ORDER"
            dividing
          />
          <ConfirmOrder
            loading={loading}
            handleInput={(name, value) => this.handleInput(name, value)}
          />
          <Popup
            trigger={
              <Button
                className="confrim-btn"
                color="black"
                content="COMPLETE PURCHASE"
                onClick={() => this.handleApply()}
                loading={loading}
                disabled={
                  !receiver ||
                  !mobile ||
                  !address ||
                  isExtensionNotFound ||
                  loading
                }
              />
            }
            content={!errMsg ? "Please sign to confirm" : `${errMsg}`}
            on="click"
            hideOnScroll
            inverted
          />
        </Grid.Column>
        <OrderBar cart={props.cart} reward={reward} />
      </Grid.Row>
    );
  }
}

ConfirmStep.propTypes = propTypes;
ConfirmStep.contextType = PolkadotContext;
export default ConfirmStep;
