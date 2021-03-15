import React, { Component } from 'react';
import ReactMarkdown from "react-markdown";
import { privateProtocol, platformProtocol } from "./protocols";

class Protocol extends Component<any> {

  state = {
    protocolText: '',
  }

  async componentDidMount() {
    let protocolText = '';
    switch (this.props.match.params.type) {
      case 'private':
        protocolText = privateProtocol;
        break;
      case 'platform':
        protocolText = platformProtocol;
        break;
      default:
        break;
    }(this.setState({
      protocolText
    }))

  }

  render() {
    return (
      <div style={{ margin:'0 auto',padding: '30px 50px', backgroundColor: '#ffffff', maxWidth:'1200px' }}>
        {this.state.protocolText === '' ? '' : <ReactMarkdown source={this.state.protocolText}></ReactMarkdown>}
      </div>
    );
  }
}

export default Protocol