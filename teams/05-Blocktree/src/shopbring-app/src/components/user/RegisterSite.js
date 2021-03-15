import React, { Component } from "react";
import { Grid, Header, Form, Button, Checkbox, Popup } from "semantic-ui-react";
import { stringToHex } from "@polkadot/util";
import Scroll from "../scroll/Scroll";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import getEncodedAddress from "util/getEncodedAddress";
import AccountSelectionForm from "./AccountSelectionForm";
import request from "util/request";

import "assets/style/user.scss";

class RegisterSite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nonce: null,
      isAccountLoading: false,
      isExtensionNotFound: true,
      isAccountsNotFound: true,
      accounts: [],
      currentAddress: "",
      email: "",
      nickname: "",
      errMsg: "",
      isCheck: false
    };
    this.onAccountChange.bind(this);
    this.handleRegister.bind(this);
  }

  componentDidMount() {
    Scroll(230, 300);
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

  handleRegister() {
    this.setState({ errMsg: "" });
    const { accounts, isCheck, nickname, email } = this.state;
    if (!accounts.length) {
      return getAccounts();
    }
    const { nonce, currentAddress } = this.state;

    try {
      if (!isCheck) {
        throw new Error("Please read the privacy policy.");
      }
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
            request("user/register", {
              address: currentAddress,
              message: nonce.message,
              nonce: nonce.nonce,
              time: nonce.time,
              email,
              nickname,
              signature: signature.signature,
            })
              .then((resp) => {
                window.history.back();
              })
              .catch((error) => {
                this.setState({ errMsg: error });
              });
          })
          .catch((error) => this.setState({ errMsg: error }));
      });

      // 	if (loginResult?.addressLogin?.token) {
      // 		handleTokenChange(loginResult.addressLogin.token, currentUser);
      // 		history.goBack();
      // 	} else {
      // 		throw new Error('Web3 Login failed');
      // 	}
    } catch (error) {
      this.setState({ errMsg: error });
    }
  }

  handleInput(name, value) {
    this.setState({ [name]: value });
  }

  render() {
    const { accounts, currentAddress, errMsg, isCheck } = this.state;
    return (
      <Grid id="join-container" textAlign="center">
        <Grid.Column width={4} textAlign="left">
          <Header as="h3">
            JOIN US
            <Header.Subheader>Enter following details here.</Header.Subheader>
          </Header>
          <Form>
            <AccountSelectionForm
              title="Choose linked account"
              accounts={accounts}
              address={currentAddress}
              onAccountChange={(e, data) => this.onAccountChange(e, data)}
            />
            <Form.Field
              required
              label="Email"
              type="email"
              control="input"
              placeholder="Email"
              onChange={(event) =>
                this.handleInput("email", event.target.value)
              }
            />
            <Form.Field
              required
              label="Nickname"
              control="input"
              placeholder="Nickname"
              onChange={(event) =>
                this.handleInput("nickname", event.target.value)
              }
            />
            <Form.Checkbox
              required
              inline
              label={{ children: "Yes,I consent to the Privacy policy." }}
              onClick={() => this.handleInput("isCheck", !this.state.isCheck)}
            />
            <Popup
              trigger={
                <Button type="submit" color="black"
                disabled={!isCheck}
                onClick={() => {
                  this.handleRegister();
                }}>
                  JOIN US
                </Button>
              }
              content={!errMsg ? "Please sign to register" : `${errMsg}`}
              on="click"
              hideOnScroll
              inverted
            />
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default RegisterSite;
