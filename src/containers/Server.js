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
  }
}))

const defaultKeyrings = testKeyring.createTestKeyring({ type: 'sr25519' })
const pairs = defaultKeyrings.getPairs()
const alice = pairs.find(one => one.meta.name === 'alice')
const bob = pairs.find(one => one.meta.name === 'bob')

export default function Server(props) {
  const classes = useStyles()
  const { api, keyring } = useSubstrate();
  const [ticket, setTicket] = useState('')
  const [content, setContent] = useState('')
  const [server, setServer] = useState('')

  const serverRoll = result => {
    try {
      const subscription = api.tx.dungeons
        .start(result[2])
        .signAndSend(bob, ({ events = [], status }) => {
          if (status.isInBlock) {
            events.forEach(({ phase, event: { data, method, section } }) => {
              if (section === 'dungeons' && method === 'DungeonStarted') {
                let newInfo = data.toJSON()
                EventUtil.emit('game_start', result)
                let info = [
                  '<div>Player start game:</div>',
                  `<div>Address: ${result[1]}</div>`,
                  `<div>Ticket number: ${result[2]}</div>`,
                  `<div>Server kick ball: ${newInfo[3]}</div>`
                ]
                setContent(info.join('\n'))
              }
            });
            // subscription();
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    EventUtil.addListener(Server, 'ticket_bought', result => {
      console.log('server receive ticket bought event')
      let info = [
        '<div>Player start game:</div>',
        `<div>Address: ${result[1]}</div>`,
        `<div>Ticket number: ${result[2]}</div>`
      ]
      console.log(info)
      setContent(info.join('\n'))
      console.log(content)
      serverRoll(result)
    })
  }, [Server])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
    }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
