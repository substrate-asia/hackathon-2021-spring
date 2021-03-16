import React from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';

const SubscribeMenu = () => (
  <Grid.Column >
    <h4 className='ft-submenu-header'>
      Subscribe for newletter
    </h4>
    {/* <p className='ft-subscribe-text'>
      
    </p> */}
    <Link
      to='/#'
      className='ft-subscribe-btn'
    >
      LOGIN
    </Link>
  </Grid.Column>
)

export default SubscribeMenu;