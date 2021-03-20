import React, { useState, createRef, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { makeStyles } from '@material-ui/core/styles'
import { useSubstrate } from '../substrate-lib';
import { hex2a } from '../util/string.util'

const testKeyring = require('@polkadot/keyring/testing')

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
}))

const defaultKeyrings = testKeyring.createTestKeyring({ type: 'sr25519' })
const pairs = defaultKeyrings.getPairs()
const alice = pairs.find(one => one.meta.name === 'alice')
const bob = pairs.find(one => one.meta.name === 'bob')
const queryAsset = [[0, alice.address], [1, alice.address], [2, alice.address], [3, alice.address]]

export default function Main(props) {
  const classes = useStyles()
  const { api, keyring } = useSubstrate();
  const [roleName, setRoleName] = useState('')
  const [equip, setEquip] = useState([])
  const [roleAttr, setRoleAttr] = useState([])
  const [balance, setBalance] = useState('');

  useEffect(() => {
    const alice = keyring.find(o => o.meta.name === 'alice');
    let unsubscribeAll = null;

    api.query.actor.actors(alice.address, ret => {
      let { name, equipments } = ret.value
      setRoleName(hex2a(name))
      setEquip(equipments)
    }).then(unsub => {
      unsubscribeAll = unsub;
    }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring]);

  useEffect(() => {
    const alice = keyring.find(o => o.meta.name === 'alice');
    const queryAsset = [[0, alice.address], [1, alice.address], [2, alice.address], [3, alice.address]]
    let unsubscribeAll = null;

    api.query.featuredAssets.account
      .multi(queryAsset, ret => {
        let featuredAssets = ret.map(o => o = o.toJSON())
        setRoleAttr([...featuredAssets])
      }).then(unsub => {
        unsubscribeAll = unsub;
      }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring]);

  useEffect(() => {
    const alice = keyring.find(o => o.meta.name === 'alice');
    let unsubscribeAll = null;

    api.query.system.account(alice.address, balance => {
      let free = balance.data.free.toHuman()
      setBalance(free)
    }).then(unsub => {
      unsubscribeAll = unsub;
    }).catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring, setBalance]);

  // useEffect(() => {
  //   let unsubscribeAll = null;
  //   api.queryMulti([
  //     [api.query.actor.actors, alice.address],
  //     [api.query.featuredAssets.account, queryAsset],
  //     [api.query.system.account, alice.address],
  //   ], ([ret1, ret2, ret3]) => {
  //     console.log(ret1, ret2, ret3)
  //     // let { name, equipments } = ret1.value
  //     // setRoleName(hex2a(name))
  //     // setEquip(equipments)
  //     // let featuredAssets = ret2.map(o => o = o.toJSON())
  //     // setRoleAttr([...featuredAssets])
  //     // let free = ret3.data.free.toHuman()
  //     // setBalance(free)
  //   }).then(unsub => {
  //     unsubscribeAll = unsub;
  //   }).catch(console.error);
  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [api, keyring, setBalance, setRoleName, setEquip, setRoleAttr])

  return (
    <div className={classes.root}>
      <div className={classes.client}>
        <div className={classes.role}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <div>角色名:&nbsp;&nbsp;</div>
              <div>{roleName}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <div>&nbsp;&nbsp;元宝:&nbsp;&nbsp;</div>
              <div>{balance}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <h2>&nbsp;&nbsp;装备:&nbsp;&nbsp;</h2>
              {
                equip && equip.length > 0 &&
                equip.map((o, index) => {
                  return (
                    <span key={index}>{o}&bnsp;</span>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
