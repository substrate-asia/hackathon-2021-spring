import React from 'react';
import { Grid, Header, Item } from 'semantic-ui-react';

import OrderItem from './OrderItem';
import OrderBill from './OrderBill';

const OrderBar = (props) => {
  const {
    cart,
    reward,
  } = props;

  let valueTotal = 0;
  let delivery = 0;

  const itemsOrder = cart.map(function(item,index){
    valueTotal += parseFloat(item.quantity) * item.salePrice;
    delivery += parseFloat(item.shipping);
    return (
      <OrderItem key={item.id} {...item} />
    )
  });

  return(
    <Grid.Column id='order-bar' as='aside' width='4' textAlign='left'>
      <Header as='h2' className='order-header' content='YOUR ORDER' dividing/>
      <Item.Group divided>
        {itemsOrder}
      </Item.Group>
      <OrderBill orderValue={valueTotal} delivery={delivery} reward={parseFloat(reward)} />
    </Grid.Column>
  )
}

export default OrderBar;