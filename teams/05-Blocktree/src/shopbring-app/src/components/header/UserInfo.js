import React, { PureComponent } from "react";
import { Button, Icon, Popup, Link } from "semantic-ui-react";
import request from "util/request";
import emitter from "util/events";
import PopupLogin from "../popup/PopupLogin";
import { PolkadotContext } from "util/polkadotContext";
import Storage from "util/storage";

const USER_INFO = "user_info";

const Logout = ({ className, onClick }) => (
  <span className={className}>
    <Button className="basic circular mini" size="mini" onClick={onClick}>
      logout
    </Button>
  </span>
);

class UserInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      balance: 0,
    };
    this.storage = new Storage(window.sessionStorage);
  }

  componentDidMount() {
    if (window.location.pathname !== "/login") this.getUserInfo();
    const self = this;
    this.eventEmitter = emitter.addListener("logged", (logged) => {
      if (logged) self.getUserInfo();
    });

    // const { userInfo } = this.state;
    // this.eventEmitter = emitter.addListener("connected", (api) => {
    //   console.log("ws connected");
    //   if (!userInfo) return;
    //   console.log("subscribe balance:", userInfo.address);
    //   api.query.genericAsset.freeBalance(1, userInfo.address, (balance) => {
    //     console.log(`The lastest balance is ${balance}`);
    //     this.setState({ balance });
    //   });
    // });
  }

  componentWillUnmount() {
    emitter.removeListener(this.eventEmitter);
  }

  getUserInfo() {
    request("user/info", null, true)
      .then((resp) => {
        this.setState({ userInfo: resp });
        this.storage.Set(USER_INFO, resp);
        this.eventEmitter = emitter.addListener("connected", (api) => {
          console.log("ws connected");
          console.log("subscribe balance:", resp.address);
          api.query.genericAsset.freeBalance(1, resp.address, (balance) => {
            console.log(`The lastest balance is ${balance}`);
            this.setState({ balance });
          });
        });
      })
      .catch((err) => {
        this.setState({ userInfo: null });
        console.error(err);
      });
  }

  signout() {
    request("user/signout").then(() => {
      emitter.emit("logged");
      this.setState({ userInfo: null });
      this.storage.Set(USER_INFO, {});
      window.location.href = "/";
    });
  }

  render() {
    const { userInfo, balance } = this.state;

    const btn = userInfo && (
      <Button.Content as="span" visible>
        <Icon name="user" /> {userInfo.nickname} <Icon name="money" />
        {(balance / 100000000).toFixed(2)}
        {" SBG"}
      </Button.Content>
    );

    return userInfo ? (
      <Popup
        trigger={btn}
        position="bottom center"
        hoverable
        hideOnScroll
        onClose={() => {
          console.lg;
        }}
      >
        <Button.Group vertical labeled icon>
          <Button
            icon="unordered list"
            content="View Orders"
            onClick={() => (window.location.href = "/orders")}
          />
          <Button
            icon="log out"
            content="Logout"
            onClick={() => this.signout()}
          />
        </Button.Group>
      </Popup>
    ) : (
      <PopupLogin
        btnTool={
          <Button.Content as="span" visible>
            <Icon name="user" /> LOGIN
          </Button.Content>
        }
      />
    );
  }
}

UserInfo.contextType = PolkadotContext;
export default UserInfo;
