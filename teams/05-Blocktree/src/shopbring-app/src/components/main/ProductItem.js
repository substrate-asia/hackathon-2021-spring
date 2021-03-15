import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Image } from 'semantic-ui-react';

let propTypes = {
  ext_order_hash: PT.string,
  category: PT.string,
  type: PT.string,
  name: PT.string,
  price: PT.string,
}

const ProductItem = (props) => {

  let {
    ext_order_hash,
    category,
    type,
    name,
    price,
    tip,
    img,
    note,
    total,
    order_id,
  } = props;

  return(
    <Card className='product-info'>
      <Link to={`/commissions?hash=${ext_order_hash}&order_id=${order_id}`}>
        <Image className='pro-images' src={img || require("../../assets/img/logo.png")} />
      </Link>
      <Card.Content className='pro-info'>
        <Card.Header as='h4'>
          <Link to={`/commissions?hash=${ext_order_hash}&order_id=${order_id}`}>
            {note}
          </Link>
        </Card.Header>
        <Card.Meta>
          <span className='market-price'>
            ${parseFloat(total/100000000).toFixed(2)}
          </span>
          <span className='sale-price'>
            Reward $<b>{parseFloat(tip/100000000).toFixed(2)}</b>
          </span>
        </Card.Meta>
      </Card.Content>
      <Card.Content extra className='pro-tool'>
        <Link to={`/commissions?hash=${ext_order_hash}&order_id=${order_id}`} className='add-wishlist'>
          <Icon name='american sign language interpreting' />
          Accept Order
        </Link>
      </Card.Content>
    </Card>
  )
}

ProductItem.propTypes = propTypes;

export default ProductItem;