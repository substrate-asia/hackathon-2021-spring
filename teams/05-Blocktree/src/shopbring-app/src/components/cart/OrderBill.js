import React from "react";
import { List, Divider } from "semantic-ui-react";

const propTypes = {
  orderValue: PT.number,
  delivery: PT.number,
  reward: PT.number,
};

const OrderBill = (props) => (
  <List className="order-bill">
    <List.Item as="li">
      <span>ORDER VALUE</span>
      <span>${props.orderValue.toFixed(2)}</span>
    </List.Item>
    <List.Item as="li">
      <span>DELIVERY</span>
      <span>${props.delivery.toFixed(2)}</span>
    </List.Item>
    {props.reward > 0 && (
      <List.Item as="li">
        <span>REWARD</span>
        <span>${props.reward.toFixed(2)}</span>
      </List.Item>
    )}
    <List.Item as="li">
      <Divider />
    </List.Item>
    <List.Item as="li">
      <span>TOTAL</span>
      <span>
        ${(props.orderValue + props.delivery + (props.reward || 0)).toFixed(2)}
      </span>
    </List.Item>
    <List.Item as="li">30 days withdrawal. </List.Item>
  </List>
);

OrderBill.propTypes = propTypes;

export default OrderBill;
