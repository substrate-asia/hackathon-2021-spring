import React from 'react';
import { Route } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import CommissionInfo from './CommissionInfo';
import Scroll from '../scroll/Scroll';
import 'assets/style/product.scss';
import '../../util/mockAvisory.js';

const propTypes = {
  handleAddToCart: PT.func
}

class CommissionDetailSite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  componentDidMount() {
    Scroll(250,300);
  }
  render(){
    return(
      <Grid as='section' textAlign='center'>
        <Route children={( { location } )=>{
          return(
            <CommissionInfo
              location={location}
              handleAddToCart={this.props.handleAddToCart}
            />
          )
        }}/>
      </Grid>
    )
  }
}

CommissionDetailSite.propTypes = propTypes;

export default CommissionDetailSite;