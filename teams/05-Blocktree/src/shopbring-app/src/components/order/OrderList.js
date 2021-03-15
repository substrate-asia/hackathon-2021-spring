import React, { Component } from "react";
import {
  Grid,
  Button,
  Tab,
  Card,
  Icon,
  Select,
  Dropdown,
  Input,
  Feed,
  Popup,
} from "semantic-ui-react";
import ShowcaseHeader from "../header/ShowcaseHeader.js";
import moment from "moment";
import getEncodedAddress from "util/getEncodedAddress";
import "assets/style/product.scss";
import request from "util/request";
import {
  web3Enable,
  web3FromAddress,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { PolkadotContext } from "util/polkadotContext";
import Storage from "util/storage";

const USER_INFO = "user_info";

class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delegated: [],
      commissioned: [],
      isReadMore: false,
      isExtensionNotFound: false,
      errMsg: "",
      loading: "",
      success: "",
      isAccountLoading: false,
      isAccountsNotFound: false,
      currentAddress: "",
    };
    this.handleReadMoreProduct = this.handleReadMoreProduct.bind(this);
    this.storage = new Storage(window.sessionStorage);
  }

  componentDidMount() {
    request(
      "order/list",
      {
        order_type: 1,
      },
      true
    )
      .then((delegated) => {
        this.setState({ delegated });
      })
      .catch((err) => console.log(err));
    request(
      "order/list",
      {
        order_type: 2,
      },
      true
    )
      .then((commissioned) => {
        this.setState({ commissioned });
      })
      .catch((err) => console.log(err));

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

    web3Accounts().then((accounts) => {
      if (accounts.length === 0) {
        this.setState({ isAccountLoading: false, isAccountsNotFound: true });
        return;
      } else {
        this.setState({ isAccountsNotFound: false });
      }
      accounts.forEach((account) => {
        account.address = getEncodedAddress(account.address) || account.address;
      });
      const userInfo = this.storage.Get(USER_INFO);
      if (userInfo && userInfo.address) {
        this.setState({ currentAddress: userInfo.address });
      } else if (accounts.length > 0) {
        this.setState({ currentAddress: accounts[0].address });
      }
      this.setState({ isAccountLoading: false });
    });
  }

  handleReadMoreProduct() {
    this.setState({
      isReadMore: true,
    });
  }

  handleComplete(ext_order_hash) {
    const { currentAddress } = this.state;

    this.setState({
      loading: ext_order_hash,
      errMsg: "Please sign to complete.",
    });

    web3FromAddress(currentAddress)
      .then((injected) => {
        const signRaw = injected && injected.signer && injected.signer.signRaw;
        if (!signRaw) {
          return console.error("Signer not available");
        }
        this.context.api.tx.commissionedShopping
          .confirmCommodityReceived(ext_order_hash)
          .signAndSend(
            currentAddress,
            { signer: injected.signer },
            ({ status }) => {
              if (status.isInBlock) {
                this.setState({
                  errMsg: `Completed at block hash #${status.asInBlock.toString()}`,
                });
              } else {
                if (status.isBroadcast) {
                  this.setState({
                    errMsg: `Broadcasting the application #${ext_order_hash}`,
                  });
                } else {
                  this.setState({
                    errMsg: `Current status: ${status.type}`,
                  });
                  if (status.isFinalized) {
                    this.setState({
                      loading: "",
                      errMsg: "success",
                      success: ext_order_hash,
                    });
                  }
                }
              }
            }
          )
          .catch((err) => {
            this.setState({
              errMsg: err,
              loading: "",
            });
            console.error("ERROR:", err);
          });
      })
      .catch((err) => {
        this.setState({
          errMsg: err,
          loading: "",
        });
      });
  }

  handleShipOut(ext_order_hash, order_id) {
    const { currentAddress } = this.state;

    this.setState({
      loading: ext_order_hash,
      errMsg: "Please sign to ship out.",
    });

    web3FromAddress(currentAddress)
      .then((injected) => {
        const signRaw = injected && injected.signer && injected.signer.signRaw;
        if (!signRaw) {
          return console.error("Signer not available");
        }

        request(
          "order/shipping",
          { order_type: 1, order_id, shipping_num: "88888888" },
          true
        ).then((shipping) => {
          this.context.api.tx.commissionedShopping
            .doCommodityShipping(ext_order_hash, shipping.shipping_hash)
            .signAndSend(
              currentAddress,
              { signer: injected.signer },
              ({ status }) => {
                if (status.isInBlock) {
                  this.setState({
                    errMsg: `Completed at block hash #${status.asInBlock.toString()}`,
                  });
                } else {
                  if (status.isBroadcast) {
                    this.setState({
                      errMsg: `Broadcasting the application #${ext_order_hash}`,
                    });
                  } else {
                    this.setState({
                      errMsg: `Current status: ${status.type}`,
                    });
                    if (status.isFinalized) {
                      this.setState({
                        loading: "",
                        errMsg: "success",
                        success: ext_order_hash,
                      });
                    }
                  }
                }
              }
            )
            .catch((err) => {
              this.setState({
                errMsg: err,
                loading: "",
              });
              console.error("ERROR:", err);
            });
        });
      })
      .catch((err) => {
        this.setState({
          errMsg: err,
          loading: "",
        });
      });
  }

  render() {
    const {
      isReadMore,
      delegated,
      commissioned,
      isExtensionNotFound,
      isAccountLoading,
      loading,
      errMsg,
      success,
    } = this.state;

    let delegatedOrderCard = delegated.map((item) => {
      const order_loading_state = this.state.loading[item.ext_order_hash];
      return (
        <Card textAlign="left" fluid key={item.ext_order_hash}>
          <Card.Content>
            <Card.Header>#{item.ext_order_hash}</Card.Header>
            <Card.Meta>{moment().format("LLL")}</Card.Meta>
            <Card.Description>
              <Feed>
                <Feed.Event>
                  <Feed.Label
                    className="order-label"
                    image={item.commodities[0].img}
                  />
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User>
                        <a
                          href={decodeURIComponent(item.commodities[0].url)}
                          target="blank"
                        >
                          {item.commodities[0].name}
                        </a>
                      </Feed.User>{" "}
                      {item.merchant}
                      <Feed.Date>{moment().format("LLL")}</Feed.Date>
                      <p>{item.note}</p>
                      <p>Tips: {(parseFloat(item.tip) / 100000000).toFixed(2)}</p>
                      <p>
                        Total Payment:{" "}
                        {(parseFloat(item.payment_amount) / 100000000).toFixed(2)}
                      </p>
                    </Feed.Summary>
                    <Feed.Meta>
                      <Feed.Like>{item.onchain_status}</Feed.Like>
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              </Feed>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Popup
              trigger={
                <Button
                  positive
                  content="COMPLETE"
                  onClick={() => {
                    this.handleComplete(item.ext_order_hash);
                  }}
                  disabled={
                    isExtensionNotFound ||
                    isAccountLoading ||
                    loading === item.ext_order_hash ||
                    success === item.ext_order_hash
                  }
                  loading={loading === item.ext_order_hash}
                />
              }
              content={
                loading === item.ext_order_hash && errMsg ? errMsg : null
              }
              on="click"
              inverted
            />
          </Card.Content>
        </Card>
      );
    });

    let commissionedOrderCard = commissioned.map((item) => {
      return (
        <Card fluid key={item.ext_order_hash}>
          <Card.Content>
            <Card.Header>#{item.ext_order_hash}</Card.Header>
            <Card.Meta>{moment().format("LLL")}</Card.Meta>
            <Card.Description>
              <Feed>
                <Feed.Event>
                  <Feed.Label
                    className="order-label"
                    image={item.commodities[0].img}
                  />
                  <Feed.Content>
                    <Feed.Summary>
                      <Feed.User>
                        <a
                          href={decodeURIComponent(item.commodities[0].url)}
                          target="blank"
                        >
                          {item.commodities[0].name}
                        </a>
                      </Feed.User>{" "}
                      {item.merchant}
                      <Feed.Date>{moment().format("LLL")}</Feed.Date>
                      <p>{item.note}</p>
                      <p>
                        Order Total:{" "}
                        {(parseFloat(item.payment_amount) / 100000000).toFixed(2)}
                      </p>
                      <p>Reward: {(parseFloat(item.tip) / 100000000).toFixed(2)}</p>
                    </Feed.Summary>
                    <Feed.Meta>
                      <Feed.Like>{item.onchain_status}</Feed.Like>
                    </Feed.Meta>
                  </Feed.Content>
                </Feed.Event>
              </Feed>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            {item.shipping_num}
            {!item.shipping_num && (
              <div>
                <Input
                  action={
                    <Dropdown
                      button
                      positive
                      floating
                      options={[{ key: "sf", value: "sf", text: "顺丰速递" }]}
                      defaultValue="sf"
                    />
                  }
                  actionPosition="left"
                  placeholder="Shipment NO."
                  label={
                    <Popup
                      trigger={
                        <Button
                          positive
                          content="SHIP OUT"
                          onClick={() => {
                            this.handleShipOut(
                              item.ext_order_hash,
                              item.order_id
                            );
                          }}
                          disabled={
                            isExtensionNotFound ||
                            isAccountLoading ||
                            loading === item.ext_order_hash ||
                            success === item.ext_order_hash
                          }
                          loading={loading === item.ext_order_hash}
                        />
                      }
                      content={
                        loading === item.ext_order_hash && errMsg
                          ? errMsg
                          : null
                      }
                      on="click"
                      inverted
                    />
                  }
                  labelPosition="right"
                />
              </div>
            )}
          </Card.Content>
        </Card>
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

    const panes = [
      {
        menuItem: "Delegated Orders",
        render: () => (
          <Tab.Pane attached={false}>
            <Card.Group>{delegatedOrderCard}</Card.Group>
          </Tab.Pane>
        ),
      },
      {
        menuItem: "Commissioned Orders",
        render: () => (
          <Tab.Pane attached={false}>
            <Card.Group>{commissionedOrderCard}</Card.Group>
          </Tab.Pane>
        ),
      },
    ];

    return (
      <div id="orders-wrap">
        <Grid textAlign="center">
          <Grid.Column width={13}>
            <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

OrderList.contextType = PolkadotContext;
export default OrderList;
