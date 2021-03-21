import React, {Component} from 'react';

import {ConnectProps} from "@@/plugin-dva/connect";

interface PlaygroundProps extends Partial<ConnectProps> {
  location: any;
}

class Playground extends Component<PlaygroundProps> {

  render() {
    return (
      <div>素材</div>
    );
  }
}

export default Playground;
