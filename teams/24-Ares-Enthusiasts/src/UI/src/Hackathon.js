import React from 'react';
import ReactDOM from 'react-dom';


export default class Index extends React.Component {

  constructor() {
    super();
    this.state = {
        iFrameHeight: '0px'
    }
}
  render() {
    return (
      <div>
<iframe 
                style={{width:'100%', height:'600px', overflow:'visible'}}
                ref="iframe" 
                src="http://sdapps.aresprotocol.com" 
                width="100%" 
                height={this.state.iFrameHeight} 
                scrolling="auto" 
                frameBorder="0"
            />


      </div>
    );
  }
}
