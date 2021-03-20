import React, { useEffect, useState } from 'react';
import { useSubstrate } from '../substrate-lib';
import { makeStyles } from '@material-ui/core/styles'
import EventUtil from '../util/event.util'
const testKeyring = require('@polkadot/keyring/testing')

const useStyles = makeStyles(theme => ({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    float: 'left',
    background: '#0F173B',
  },
  noselect: {
    "-webkit-touch-callout": "none", /* iOS Safari */
      "-webkit-user-select": "none", /* Safari */
       "-khtml-user-select": "none", /* Konqueror HTML */
         "-moz-user-select": "none", /* Old versions of Firefox */
          "-ms-user-select": "none", /* Internet Explorer/Edge */
              "user-select": "none", /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
  }
}))

const defaultKeyrings = testKeyring.createTestKeyring({ type: 'sr25519' })
const pairs = defaultKeyrings.getPairs()
const alice = pairs.find(one => one.meta.name === 'alice')

const Timer = props => {
  const [seconds, setSeconds] = useState(props.fullTime);
  const [isActive, setIsActive] = useState(true);
  const [hitNum, setHitNum] = useState(0)

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds > 0 ? seconds - 1 : 0);
        if (seconds === 0) {
          props.setGameResult(hitNum > props.score ? true : false)
          clearInterval(interval)
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const hitGame = e => {
    if (seconds > 0) {
      setHitNum(pre => pre + 1)
    }
  }

  return (
    <div className="noselect" style={{cursor: 'pointer', userSelect: 'none'}}>
      <div className="time">
        Time Left: {seconds}s
      </div>
      <div className="time">
        Aim Hit Score: {props.score}
      </div>
      <div className="time">
        Current Score: {hitNum}
      </div>
      <div style={{ width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }} onClick={hitGame}>
        Hit Area
      </div>
    </div>
  );
};

export default function Fight(props) {
  const classes = useStyles()
  const { api, keyring } = useSubstrate();
  const level = ['关卡1', '关卡2', '关卡3']

  // not-start -> game_start -> gaming -> game-end
  // 用户点击关卡会首先进入游戏准备中
  const [status, setStatus] = useState('not-start')

  // // 游戏准备中后会请求server发送start命令，server发送完成后会通知Flight组建，此时将状态设置为游戏开始
  // const [gameStatus, setGateStatus] = useState(false)
  // // 游戏开始后启动定时器，检查是否成功或者失败，然后通知server发送游戏end事件
  // const [timer, setTimer] = useState(false)
  // // 

  useEffect(() => {
    // 收到server发过来的dungeons start信息
    EventUtil.addListener(Fight, 'game_start', result => {
      console.log('------')
      console.log('game server has sent game start command')
      setStatus('gaming')
    })
  }, [])

  const getContent = () => {
    if (status === 'not-start') return (
      level.map((o, index) => {
        return (
          <div key={index} style={{
            display: 'flex', flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
            width: '100px', height: '40px', cursor: 'pointer', border: '2px solid black'
          }}>
            <div onClick={() => setLevel(index)}>{o}</div>
          </div>
        )
      })
    )
    if (status === 'start') return <div>游戏准备中。。。</div>
    if (status === 'gaming') {
      return (<Timer fullTime={10} score={30} setGameResult={setResult} />)
    }
  }

  const setResult = result => {
    console.log('---------')
    console.log(result)
  }

  // useEffect(() => {
  //   const alice = keyring.find(o => o.meta.name === 'alice');
  //   const queryAsset = [[0, alice.address], [1, alice.address], [2, alice.address], [3, alice.address]]
  //   let unsubscribeAll = null;

  //   api.query.featuredAssets.account
  //     .multi(queryAsset, ret => {
  //       let featuredAssets = ret.map(o => o = o.toJSON())
  //       console.log(featuredAssets)
  //       setRoleAttr([...featuredAssets])
  //     }).then(unsub => {
  //       unsubscribeAll = unsub;
  //     }).catch(console.error);
  //   return () => unsubscribeAll && unsubscribeAll();
  // }, [api, keyring]);

  const setLevel = async l => {
    setStatus('start')
    try {
      const subscription = api.tx.dungeons
        .buyTicket(l)
        .signAndSend(alice, ({ events = [], status }) => {
          if (status.isInBlock) {
            events.forEach(({ phase, event: { data, method, section } }) => {
              if (section === 'dungeons' && method === 'DungeonTicketBought') {
                let result = data.toJSON()
                // 用户买完票以后告诉server
                EventUtil.emit('ticket_bought', result)
              }
            });
            // subscription();
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div style={{
      minHeight: '40vh', borderTop: '1px solid gray', borderBottom: '1px solid gray',
      background: 'gray', display: 'flex', flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {
        getContent()
      }
    </div>
  );
}
