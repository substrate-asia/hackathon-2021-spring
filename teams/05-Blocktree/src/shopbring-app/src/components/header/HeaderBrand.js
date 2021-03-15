import React from "react";
import { Link } from "react-router-dom";
import { Header } from "semantic-ui-react";
import SearchBar from "./SearchBar";

const HeaderBrand = () => (
  <Header as="hgroup" id="header-brand" icon textAlign="center">
    <Header.Content as="h1" className="brand-logo">
      <Link to="/">
        <img src={require("../../assets/img/logo.png")} alt="Shopbring" />
      </Link>
    </Header.Content>
    <Header.Content as="h3" className="brand-des">
      Shopbring - A decentralized commissioned shopping platform powered by Polkadot.
    </Header.Content>
    <Header.Content className="brand-des">
      <SearchBar />
    </Header.Content>
  </Header>
);

export default HeaderBrand;
