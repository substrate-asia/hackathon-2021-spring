import React from "react";
import { Form } from "semantic-ui-react";

import AddressDropdown from "./AddressDropdown";
import HelperTooltip from "components/popup/HelperTooltip";

import "./AccountSelectionForm.scss";

class AccountSelectionForm extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { accounts, address, className, onAccountChange, title } = this.props;
    return (
      <Form className="account-selection-form">
        <div className={className} width={16}>
          <label>
            {title}
            <HelperTooltip content="You can choose an account from the polkadot-js extension." />
          </label>
          <AddressDropdown
            accounts={accounts}
            defaultAddress={address}
            onAccountChange={onAccountChange}
          />
        </div>
      </Form>
    );
  }
}

export default AccountSelectionForm;
