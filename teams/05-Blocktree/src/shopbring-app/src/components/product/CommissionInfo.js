import React from "react";
import { Grid, Button, Icon } from "semantic-ui-react";
import ProductImages from "./ProductImages";
import CommissionHeader from "./CommissionHeader";
import ProductTag from "./ProductTag";
import CommissionDetail from "./CommissionDetail";
import request from "util/request";
import getEncodedAddress from "util/getEncodedAddress";
import {
  web3Enable,
  web3FromAddress,
  web3Accounts,
} from "@polkadot/extension-dapp";
import { PolkadotContext } from "util/polkadotContext";
import Storage from "util/storage";

const USER_INFO = "user_info";

class CommissionInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
      isExtensionNotFound: false,
      errMsg: "",
      loading: false,
      isAccountLoading: false,
      isAccountsNotFound: false,
      currentAddress: "",
      success: false,
    };
    this.storage = new Storage(window.sessionStorage);
  }

  componentDidMount() {
    const { location } = this.props;
    if (!location || !location.search) {
      window.location.pathname = "/";
    }
    const params = new URLSearchParams(location.search.substring(1));
    const order_id = params.get("order_id");

    request("order/index", {
      order_id,
    })
      .then((res) => {
        this.setState({
          dataProInfo: res[0],
        });
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
      if(userInfo && userInfo.address) {
        this.setState({ currentAddress: userInfo.address });
      } else if (accounts.length > 0) {
        this.setState({ currentAddress: accounts[0].address }); //TODO
      }
      this.setState({ isAccountLoading: false });
    });
  }

  handleAcceptOrder() {
    const {
      dataProInfo: { ext_order_hash, commodities },
      currentAddress,
    } = this.state;

    this.setState({ errMsg: "Please sign to accept order.", loading: true });

    web3FromAddress(currentAddress)
      .then((injected) => {
        const signRaw = injected && injected.signer && injected.signer.signRaw;
        if (!signRaw) {
          return console.error("Signer not available");
        }
        this.context.api.tx.commissionedShopping
          .acceptShoppingOrder(ext_order_hash)
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
                    this.setState({ loading: false, success: true });
                    window.open(decodeURIComponent(commodities[0].url));
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
  }

  render() {
    const {
      dataProInfo,
      loading,
      isExtensionNotFound,
      isAccountLoading,
      isAccountsNotFound,
      errMsg,
      success,
    } = this.state;

    const proInfo = {
      name: dataProInfo.title,
      srcImg: dataProInfo.pic,
      quantity: 1, // TODO
      tags:
        dataProInfo && dataProInfo.aSkupid
          ? dataProInfo.aSkupid.map(({ pid }) => {})
          : [],
      shipping: dataProInfo.shipping,
      merchant: dataProInfo.nick,
      url: dataProInfo.url,
    };

    let commodity = {};
    if (dataProInfo && dataProInfo.commodities)
      commodity = dataProInfo.commodities[0];

    return (
      <Grid.Row>
        <Grid.Column width={6}>
          <ProductImages
            img={commodity.img || require("../../assets/img/logo.png")}
          />
        </Grid.Column>
        <Grid.Column id="product-info" width={6} textAlign="left">
          <CommissionHeader
            name={commodity.name}
            total={dataProInfo.total}
            reward={dataProInfo.tip}
            hash={dataProInfo.ext_order_hash}
            url={commodity.url}
          />
          {commodity.options &&
            commodity.options.length > 0 &&
            commodity.options.map(([key, value]) => (
              <ProductTag
                key={key}
                title={key}
                data={[{ id: value, name: value }]}
              />
            ))}
          {!success && (
            <CommissionDetail
              dataDes={dataProInfo.desc}
              handleAcceptOrder={() => this.handleAcceptOrder()}
              proInfo={proInfo}
              disabled={
                isExtensionNotFound || isAccountLoading || isAccountsNotFound
              }
              loading={loading || isAccountLoading}
              message={errMsg}
            />
          )}
          {success && (
            <div className="product-detail">
              <Button
                as="button"
                className="add-to-cart"
                icon
                onClick={() => {
                  window.open(decodeURIComponent(commodity.url));
                }}
              >
                <Icon name="shopping bag" />
                PLACE ORDER NOW
              </Button>
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    );
  }
}

CommissionInfo.contextType = PolkadotContext;
export default CommissionInfo;
