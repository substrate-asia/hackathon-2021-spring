import React from 'react';
import { Grid } from 'antd-mobile';


class GridExample extends React.Component {
      render(){
        let data = Array.from(new Array(9)).map((_val, i) => ({
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/nywPmnTAvTmLusPxHPSu.png',
            text: `name${i}`,
          }));
          
        let data1 = Array.from(new Array(9)).map(() => ({
            icon: 'https://gw.alipayobjects.com/zos/rmsportal/WXoqXTHrSnRcUwEaQgXJ.png',
          }));
          
          return(
            <div>
            <Grid data={this.data1}
              columnNum={2}
              renderItem={dataItem => (
                <div style={{ padding: '12.5px' }}>
                  <img src={dataItem.icon} style={{ width: '75px', height: '75px' }} alt="" />
                  <div style={{ color: '#888', fontSize: '14px', marginTop: '12px' }}>
                    <span>I am title..</span>
                  </div>
                </div>
              )}
            />      
          </div>
          )
      }
  }


  

  export default GridExample;