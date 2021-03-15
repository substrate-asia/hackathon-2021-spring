import React from 'react';
import {CssBaseline} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron'

import SkyePassTheme from '../theme'

import {
  AppSideMenu,

  PasswordContent,
  AppMarketplaceContent,
  PolkadotContent,
  NotesContent,
  SettingContent

} from '../comp/index'

const generate_style = (theme) => ({
  root: {
		display: 'flex',
	},
})
const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function Main(){
  const classes = useStyles();
  // ipcRenderer.sendSync('metadata.recover', {
  //   encryptionSchema: {
  //     pieces: 2, quorum: 2, publicPieceCount: 1,
  //     owner: JSON.parse(window.localStorage.getItem('identity')).publicKey,
  //     members: []
  //   }, cid: JSON.parse(window.localStorage.getItem('vault')).metadata
  // })

  const [view, setView] = React.useState('password')

  const changeView = (index) => {
    setView(index)
  }

  const renderView = (view) => {
    switch (view) {
      case 'setting': return SettingContent()
      case 'password': return PasswordContent()
      case 'app': return AppMarketplaceContent()
      case 'note': return NotesContent()
      case 'polkadot_wallet': return PolkadotContent()
      case 'eth_wallet': return PolkadotContent()
      default: return PasswordContent()
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      {AppSideMenu(changeView)}
      {/* {PasswordContent()} */}
      {/* {AppMarketplaceContent()} */}
      {/* {PolkadotContent()} */}
      {/* {NotesContent()} */}
      {renderView(view)}
    </div>
  );
}
