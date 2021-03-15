import React from "react";
import { Item } from "semantic-ui-react";

const propTypes = {
  id: PT.string,
  name: PT.string,
  marketPrice: PT.number,
  salePrice: PT.string,
  srcImg: PT.string,
  tags: PT.array,
  quantity: PT.number,
  shipping: PT.string
};

const OrderItem = (props) => {
  const { name, salePrice, srcImg, quantity, tags, shipping } = props;
  return (
    <Item>
      <Item.Image src={srcImg} />
      <Item.Content className="item-content">
        <Item.Header as="h3">{name}</Item.Header>
        <Item.Header as="h4">
          $<b>{salePrice}</b>
        </Item.Header>
        <Item.Meta>
          <span>
            Quantity: <b>{quantity}</b>
          </span>
          {tags &&
            tags.map((item) => (
              <span key={item[0]}>
                {item[0]}: <b>{item[1]}</b>
              </span>
            ))}
          <span>Total: ${quantity * salePrice}</span>
        </Item.Meta>
      </Item.Content>
    </Item>
  );
};

OrderItem.propTypes = propTypes;

export default OrderItem;
