import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import Address from "./Address";

import "./AddressDropdown.scss";

class AddressDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAddress: "",
    };
    this.onAccountChange.bind(this);
  }

  onAccountChange(event, data) {
    const { onAccountChange } = this.props;
    this.setState({ selectedAddress: data.value ? data.value.toString() : "" });
    onAccountChange(event, data);
  }

  render() {
    const { accounts, defaultAddress } = this.props;

    const { selectedAddress } = this.state;
    const dropdownList = {};
    const addressOptions = [];

    accounts.forEach((account) => {
      addressOptions.push({
        children: (
          <Address
            extensionName={account.meta.name}
            address={account.address}
          />
        ),
        value: account.address,
      });

      if (account.address && account.meta.name) {
        dropdownList[account.address] = account.meta.name;
      }
    });

    const extensionName = dropdownList[selectedAddress || defaultAddress];

    return (
      <Dropdown
        className="address-dropdown"
        pointing="top"
        onChange={(e, data) => {
          this.onAccountChange(e, data);
        }}
        options={addressOptions}
        trigger={
          <div className="address-wrapper">
            <Address extensionName={extensionName} address={defaultAddress} />
          </div>
        }
        value={selectedAddress}
      />
    );
  }
}

export default AddressDropdown;
