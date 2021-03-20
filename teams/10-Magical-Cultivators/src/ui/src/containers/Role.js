import React, { useEffect, useState } from 'react';
import { useSubstrate } from '../substrate-lib';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    float: 'left',
    background: '#0F173B',
  }
}))

export default function Main(props) {
  const classes = useStyles()
  const { api, keyring } = useSubstrate();
  const [roleAttr, setRoleAttr] = useState([{ balance: 0 }, { balance: 0 }, { balance: 0 }, { balance: 0 }])

  useEffect(() => {
    const alice = keyring.find(o => o.meta.name === 'alice');
    const queryAsset = [[0, alice.address], [1, alice.address], [2, alice.address], [3, alice.address]]
    let unsubscribeAll = null;

    api.query.featuredAssets.account
      .multi(queryAsset, ret => {
        let featuredAssets = ret.map(o => o = o.toJSON())
        console.log(featuredAssets)
        setRoleAttr([...featuredAssets])
      }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);
    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring]);

  return (
    <div style={{
      minHeight: '40vh', borderTop: '1px solid gray', borderBottom: '1px solid gray',
      background: 'gray', display: 'flex', flexDirection: 'column'
    }}>
      {
        roleAttr.length > 0 &&
        roleAttr.map((o, index) => {
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'row' }}>
              <div>Asset{index}:&nbsp;&nbsp;</div>
              <div>{o.balance}</div>
            </div>
          )
        })
      }
    </div>
  );
}
