import React from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import emitter from "util/events";

const propTypes = {
  dataDes: PT.string,
  proInfo: PT.object,
};

const CommissionDetail = (props) => {
  let { proInfo, handleAcceptOrder, disabled, message, loading } = props;

  const btnAcceptOrder = (
    <Button
      as="button"
      className="add-to-cart"
      icon
      onClick={() => {
        handleAcceptOrder(proInfo);
      }}
      disabled={disabled || loading || !!message}
      loading={loading}
    >
      <Icon name="shopping bag" />
      ACCEPT COMMISSION
    </Button>
  );

  return (
    <div className="product-detail">
      <Popup
        trigger={btnAcceptOrder}
        content={message}
        on="click"
        inverted
      />
    </div>
  );
};

CommissionDetail.propTypes = propTypes;

export default CommissionDetail;
