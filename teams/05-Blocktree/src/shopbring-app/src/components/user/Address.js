// import Identicon from "@polkadot/react-identicon";
import React from "react";

import shortenAddress from "util/shortenAddress";
import "./Address.scss";

class Address extends React.Component {
  render() {
    const { address, extensionName } = this.props;
    return (
      <div className="address">
        {/* <Identicon
          className="image identicon"
          value={address}
          size={32}
          theme={"polkadot"}
        /> */}
        <div className="content">
          <div className={"header"}>
            <span className="identityName">
              {extensionName}
            </span>
          </div>
          <div className={"description"}>{shortenAddress(address)}</div>
        </div>
      </div>
    );
  }
}

export default Address;
