import React from 'react';

import { ThemeProvider } from '@material-ui/core'
import SkyePassTheme from './theme'

import Main from './views/Main'
import Login from './views/Login'

export default function App() {

  window.localStorage.setItem('identity', '{"address":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","publicKey":"3c33a4f1b705b4bc43fe9d6770ec4754a02306717a7907ba5a9963f318d086c21f668a2225b0d6641c126ec822b94c2c0e0aef1432b4163b000db3ef10c297ec"}')
  window.localStorage.setItem('vault', '{"name":"Test Vault","nonce":6,"metadata":"QmTVxMtSYURKaUy2f1d3k1vbFPPcGQj8sSq2nzseiZeDTM","display":"0x99e9d85137db46ef"}')
  window.localStorage.setItem('wallet', 'U2FsdGVkX1/10wtBWE5AjuGQjfaFvq/8eqpKKvWpcT8pQd8bhpU4gr5CObXDq+rt8JPcoQEOf1Ipa7rMZub6DLfzkjdlYoHpkHSVggZuAc+QEq88gctfp3PZl0IZp694hO9Rl2BhWi7UMrJf8Slw/g==')
  

  const wallet = window.localStorage.getItem('wallet')
  const vaultMeta = window.localStorage.getItem('vault')

  // ipcRenderer.on('ping', (event, arg) => {

  // })
  // console.log(ipcRenderer.sendSync('db.readItem', {
  //   appId: "package"
  // }))

  return (
    <ThemeProvider theme={SkyePassTheme}>
      {wallet && vaultMeta ? Main() : Login()}
    </ThemeProvider>
  );
} 
