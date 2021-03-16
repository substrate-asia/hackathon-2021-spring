import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  browserHistory,
} from "react-router-dom";

// Publick 公用组件
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

// Home 首页组件
import Home from "../components/home/HomeContainer";

// Classification 分类页组件
import FilterSite from "../components/main/FilterSite";

// Search 搜索页组件
import SearchSite from "../components/main/SearchSite";

// Detail 商品详情页组件
import ProductDetailSite from "../components/product/ProductDetailSite";

import CommissionDetailSite from "../components/product/CommissionDetailSite";
import OrderContainer from "../components/order/OrderContainer";

// Cart 购物车组件
import CartSite from "../components/cart/CartSite";

// Register & Login 登录注册组件
import LoginSite from "../components/user/LoginSite";
import RegisterSite from "../components/user/RegisterSite";

import Storage from "../util/storage";
import emitter from "util/events";

import { polkadotApi, PolkadotContext } from "util/polkadotContext";

const AUTH_KEY = "authentication";

class RouteApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      cart: [],
    };
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.storage = new Storage(window.sessionStorage);
  }

  componentDidMount() {
    const auth = this.storage.Get(AUTH_KEY);
    if (auth && auth.token) {
      this.setState({ isLogin: true });
    }
    const self = this;
    this.eventEmitter = emitter.addListener("logged", (logged) => {
      if (!logged) {
        self.storage.Remove(AUTH_KEY);
      }
      self.setState({ isLogin: !!logged });
    });
  }

  componentWillUnmount() {
    emitter.removeListener(this.eventEmitter);
  }

  handleAddToCart(product) {
    this.setState({ cart: [...this.state.cart, product] });
  }

  handleLogin() {
    this.setState({ isLogin: true });
  }

  render() {
    const { handleAddToCart, handleLogin } = this;

    const { cart, isLogin } = this.state;

    return (
      <Router history={browserHistory}>
        <div id="body">
          <PolkadotContext.Provider
            value={polkadotApi}
          ></PolkadotContext.Provider>
          <Route
            children={({ location }) => {
              return <Header location={location} cart={cart} />;
            }}
          />
          <Switch>
            <Redirect from="/home" to="/" />
            <Route exact path="/" component={Home} />
            <Route path="/search" component={SearchSite} />
            <Route
              path="/cart"
              children={() => {
                return (
                  <CartSite
                    isLogin={isLogin}
                    cart={cart}
                    handleLogin={handleLogin}
                  />
                );
              }}
            />
            <Route
              path="/login"
              children={() => {
                return (
                  <LoginSite isLogin={isLogin} handleLogin={handleLogin} />
                );
              }}
            />
            <Route path="/register" component={RegisterSite} />
            <Route
              path="/products"
              children={() => {
                return <ProductDetailSite handleAddToCart={handleAddToCart} />;
              }}
            />
            <Route
              path="/commissions"
              children={() => {
                return <CommissionDetailSite />;
              }}
            />
            <Route exact path="/orders" component={OrderContainer} />
            <Redirect from="*" to="/" />
          </Switch>
          <Route component={Footer} />
        </div>
      </Router>
    );
  }
}

export default RouteApp;
