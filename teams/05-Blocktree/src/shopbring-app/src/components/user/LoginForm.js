import React, { PureComponent } from "react";
import { Form, Header, Button, Popup } from "semantic-ui-react";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { stringToHex } from "@polkadot/util";
import getEncodedAddress from "util/getEncodedAddress";
import AccountSelectionForm from "./AccountSelectionForm";
import ExtensionNotDetected from "./ExtensionNotDetected";
import Loader from "components/ui/Loader.js";
import request from "util/request";
import emitter from "util/events";

import "assets/style/user.scss";

class LoginForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nonce: null,
      isAccountLoading: false,
      isExtensionNotFound: true,
      isAccountsNotFound: true,
      accounts: [],
      currentAddress: "",
      errMsg: "",
    };
    this.onAccountChange.bind(this);
  }

  componentDidMount() {
    request("user/nonce")
      .then((resp) => {
        this.setState({ nonce: resp });
      })
      .catch((err) => {
        console.error(err);
      });

    this.getAccounts();
  }

  getAccounts() {
    this.setState({ isAccountLoading: true });

    web3Enable("SHOPBRING").then((extensions) => {
      if (extensions.length === 0) {
        this.setState({ isAccountLoading: false, isExtensionNotFound: true });
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

      this.setState({ accounts });
      if (accounts.length > 0) {
        this.setState({ currentAddress: accounts[0].address });
      }

      this.setState({ isAccountLoading: false });
    });
  }

  onAccountChange(event, data) {
    this.setState({ currentAddress: data.value });
  }

  handleLogin() {
    const { handleLogin } = this.props;
    const { accounts } = this.state;
    if (!accounts.length) {
      return getAccounts();
    }
    this.setState({ errMsg: "" });

    try {
      const { nonce, currentAddress } = this.state;
      if (!nonce) {
        throw new Error("Nonce message not found");
      }
      if (!currentAddress) {
        throw new Error("Account not found");
      }

      web3FromAddress(currentAddress).then((injected) => {
        const signRaw = injected && injected.signer && injected.signer.signRaw;
        if (!signRaw) {
          return console.error("Signer not available");
        }

        signRaw({
          address: currentAddress,
          data: stringToHex(nonce.message),
          type: "bytes",
        })
          .then((signature) => {
            request("user/login", {
              address: currentAddress,
              message: nonce.message,
              nonce: nonce.nonce,
              time: nonce.time,
              signature: signature.signature,
            })
              .then((resp) => {
                if (resp && resp.token) {
                  handleLogin();
                  // window.location.href = "/";
                  emitter.emit("logged", true);
                  // window.history.back();
                } else {
                  throw new Error("Web3 Login failed");
                }
              })
              .catch((error) => {
                this.setState({ errMsg: error });
              });
          })
          .catch((error) => this.setState({ errMsg: error }));
      });
    } catch (error) {
      this.setState({ errMsg: error });
    }
  }

  render() {
    let { errMsg, accounts, currentAddress } = this.state;

    let {
      isExtensionNotFound,
      isAccountsNotFound,
      isAccountLoading,
    } = this.state;

    return (
      <div className="login-form">
        <Header as="h4">
          LOGIN
          {/* <Header.Subheader>
            Login to be continue.
          </Header.Subheader> */}
        </Header>
        <Form>
          {isExtensionNotFound ? (
            <div className="card">
              <ExtensionNotDetected />
            </div>
          ) : null}
          {isAccountsNotFound ? (
            <div className="card">
              <div className="text-muted">
                You need at least one account in Polkadot-js extenstion to
                login.
              </div>
              <div className="text-muted">
                Please reload this page after adding accounts.
              </div>
            </div>
          ) : null}
          {isAccountLoading ? (
            <Loader text={"Requesting Web3 accounts"} />
          ) : (
            accounts.length > 0 && (
              <div>
                <Form.Group>
                  <AccountSelectionForm
                    title="Choose linked account"
                    accounts={accounts}
                    address={currentAddress}
                    onAccountChange={(e, data) => {
                      this.onAccountChange(e, data);
                    }}
                  />
                </Form.Group>
                <Form.Field></Form.Field>
                <Popup
                  trigger={
                    <Button
                      type="submit"
                      color="black"
                      onClick={() => {
                        this.handleLogin();
                      }}
                    >
                      Web3 Login
                    </Button>
                  }
                  content={!errMsg ? "Please sign to login" : `${errMsg}`}
                  on="click"
                  hideOnScroll
                  inverted
                />
              </div>
            )
          )}
        </Form>
      </div>
    );
  }
}

export default LoginForm;
