import React from 'react';
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { TextField, Grid, Button, Typography, List, ListItem, ListItemText, ListItemIcon, InputBase} from '@material-ui/core'

import { mnemonicGenerate } from '@polkadot/util-crypto'
import CryptoJS from "crypto-js";
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { ipcRenderer } from 'electron'

import SkyePassTheme from '../theme'
// const uri = mnemonicGenerate()

const uri = "second glad business heavy bargain dismiss evil cheap turtle lecture myself myself"
const API_endpoint = 'http://localhost:2619'

const generate_style = (theme) => ({
  root: {
    display: 'flex',
    backgroundColor: theme.palette.primary.main,
    height: window.innerHeight
  },
  container: {
    // "-webkit-app-region": "drag",
    padding: theme.spacing(5),
    textAlign: 'center',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 20,
    height: 600,
    marginTop: (window.innerHeight - 600) / 2
  }, title: {
    color: theme.palette.secondary.main,
    marginTop: 30
  }, button: {
    // fontSize: 

  }, paper: {
    alignItems: "center",
    backgroundColor: "#000",
    height: 600
  }, text: {
    color: theme.palette.secondary.light
  }, text_field: {
    backgroundColor: theme.palette.secondary.main
  }, listText: {
    color: theme.palette.secondary.main
  }, vaultName: {
    width: "25%",
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.secondary.light,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
})
const useStyles = makeStyles(generate_style(SkyePassTheme))

const Home = (setState) => {
  const classes = useStyles();

  return <div>
    <Typography variant="h2" className={classes.title}>SkyePass</Typography>
    <br /><br /><br /><br /><br /><br /><br /><br />
    <Button size="large" className={classes.button} color="secondary" variant="outlined" 
      onClick={() => setState({display: "CreateWallet"})}>
      Create a New Wallet
    </Button> <br /><br />
    <Button size="large" className={classes.button} color="secondary" variant="outlined" 
      onClick={() => setState({display: "SignOn"})}>
      Import an Identity
    </Button>
  </div>
}

const CreateWallet = (state, setState) => {
  const classes = useStyles();

  const handleChange = (event) => {
    setState({
      password: event.target.value,
      display: "CreateWallet"
    });
  };


  return <div>
    <Typography variant="h2" className={classes.title}>
      Your Seed Phrase
    </Typography><br /><br />
    <Typography variant="h5" className={classes.text}>{uri}</Typography>
    <br /><br /><br /><br />
    <TextField className={classes.text_field} 
      value={state.password} onChange={handleChange}
      label="Master Password" variant="filled" />
    <br /><br /><br />
    <Typography className={classes.text}>
      Please write it down. You will not be able to access it again. 
    </Typography><br /><br />
    <Button size="large" className={classes.button} color="secondary" variant="outlined"
      onClick={async () => {
        const cipher = CryptoJS.AES.encrypt(uri, state.password).toString()
        window.localStorage.setItem('wallet', cipher)
        

        const contract_address = '5H1u2yovWepdiMps1epY3NXmYNxffzojChsH4BMqZaL1WC1Y'
        const identity = ipcRenderer.sendSync('blockchain.injectIdentity', {
          mnemonic: uri,
          contract_address: contract_address
        })
        window.localStorage.setItem('identity', JSON.stringify(identity))

        const result = ipcRenderer.sendSync('blockchain.getVaults')
        setState({ display: "VaultList", vaults: JSON.parse(result)})
      }} >
      OK. Sign In
    </Button> <br /><br />
  </div>
}

const SignOn = (setState) => {
  const classes = useStyles();

  return <div>
    <Typography variant="h3" className={classes.title}>
      Type in Your Seed Phrase
    </Typography><br /><br />
    <Grid container spacing={2}>
      {[...Array(12).keys()].map(item => 
        <Grid item md={3} key={item}>
         <TextField className={classes.text_field} label={item + 1} variant="filled" />
        </Grid>
      )}
    </Grid>
    <br /><br /><br /><br /><br />
    <Button size="large" className={classes.button} color="secondary" variant="outlined"
      onClick={() => setState({display: "VaultList"})} >
      OK. Sign In
    </Button> <br /><br />
  </div>
}

const VaultList = (state, setState) => {
  const classes = useStyles();

  return <div>
    <Typography variant="h3" className={classes.title}>Vault List</Typography><br/>
    <List>
      <ListItem>
        <ListItemIcon className={classes.listText}><ChevronRightIcon/></ListItemIcon>
        <ListItemText className={classes.listText} primary={"Create a New Vault with a Name: "} />
        <InputBase value={state.vault_name} className={classes.vaultName}
          onChange={(evt) => setState({
            vault_name: evt.target.value,
            display: "VaultList",
            vaults: state.vaults
          })} />
        <Button variant="outlined" color="secondary" onClick={async () => {

          const cid_result = ipcRenderer.sendSync('metadata.buildMetadata', {
            encryptionSchema: {
              pieces: 2, quorum: 2, publicPieceCount: 1,
              owner: JSON.parse(window.localStorage.getItem('identity')).publicKey,
              members: []
            }, name: state.vault_name
          })
          console.log(cid_result)
          const createResult = ipcRenderer.sendSync('blockchain.createVault', {
            cid: cid_result
          })
          console.log(createResult)
          ipcRenderer.sendSync('blockchain.refreshCache')
          window.location.reload()
        }}>
          Create!
        </Button>
      </ListItem>
      {Object.keys(state.vaults)
        .map((item, index) => {
          return <ListItem button key={index} onClick={() => {
            window.localStorage.setItem('vault', JSON.stringify(state.vaults[item]))
            window.location.reload()
          }}>
            <ListItemIcon className={classes.listText}><ChevronRightIcon /></ListItemIcon>
            <ListItemText className={classes.listText} primary={state.vaults[item].name} 
              secondary={state.vaults[item].display} />
          </ListItem>
        })}
    </List> <br /><br />
  </div>
}

const Route = (state, setState) => {
  switch (state.display) {
    case "Home": return Home(setState); break
    case "CreateWallet": return CreateWallet(state, setState); break
    case "SignOn": return SignOn(setState); break
    case "VaultList": return VaultList(state, setState); break
    case "Main":  
      // window.location.reload(false); 
      break
    default: return Home(setState)
  }
}
export default function Login() {
  const classes = useStyles();

  const [state, setState] = React.useState({
    display: "Home", password: ""
  })

  return (
    <ThemeProvider theme={SkyePassTheme}>
      <CssBaseline />
      <Grid container className={classes.root}>
        <Grid item xs={2} />
        <Grid item xs={8} className={classes.container}>
          {Route(state, setState)}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
