import React from "react";
import { Segment, Grid, Header, Divider } from "semantic-ui-react";

import LoginForm from "../user/LoginForm";
import NewCustomer from "../user/NewCustomer";
import OrderBar from "./OrderBar";

const SigninStep = (props) => (
  <Grid.Row id="checkout">
    <Grid.Column id="checkout-controller" width="8" textAlign="left">
      <Header as="h2" className="controller-header" content="LOGIN" dividing />
      <Grid className="control-wrap" columns={2} relaxed="very" stackable>
        <Grid.Column>
          <LoginForm isLogin={props.isLogin} handleLogin={props.handleLogin} />
        </Grid.Column>
        <Grid.Column>
          <NewCustomer />
        </Grid.Column>
      </Grid>
    </Grid.Column>
    <OrderBar cart={props.cart} />
  </Grid.Row>
);

export default SigninStep;
