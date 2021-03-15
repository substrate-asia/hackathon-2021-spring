import React, { Component } from "react";
import { Button, Container, Header, Menu, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

import "semantic-ui-css/semantic.min.css";
import "./Landingpage.css";

export default class Landingpage extends Component {
  render() {
    return (
      <div className="App">
        <Segment inverted vertical textAlign="center">
          <Container as="nav">
            <Header inverted as="h1">
              Parallel
            </Header>
            <Menu borderless compact inverted>
              <Menu.Item active as={Link} to="/">
                Home
              </Menu.Item>
              <Menu.Item as={Link} to="/app">
                App
              </Menu.Item>
              <Menu.Item as={Link} to="/debug">
                Debug
              </Menu.Item>
            </Menu>
          </Container>
          <Container className="content">
            <Header inverted as="h1">
              Earn interests on Polkadot
            </Header>
            <p>
              Parallel is an algorithmic, autonomous interest rate protocol
              built for developers, to unlock a universe of open financial
              applications.
            </p>
            <Button size="huge" as={Link} to="/app">
              Start Now
            </Button>
          </Container>
          <Segment inverted vertical as="footer">
            Built with love on{" "}
            <a href="https://www.polkadot.network/">Polkadot </a>
            by{" "}
            <a href="https://github.com/semantic-ui-forest">
              @Parallel Finance
            </a>
            2021
          </Segment>
        </Segment>
      </div>
    );
  }
}
