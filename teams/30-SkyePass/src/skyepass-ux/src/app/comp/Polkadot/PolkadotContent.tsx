import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import SkyePassTheme from '../../theme'

import PolkadotContentList from './PolkadotContentList'
// import AppContentMain from './AppContentMain'

const generate_style = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0
  }
})
const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function PolkadotContent(){
  const classes = useStyles();
  return (
		<main className={classes.content}>
      {PolkadotContentList()}
			{/* {AppContentMain()} */}
			{/* <div className={classes.drawerHeader} /> */}
		</main>
  );
}
