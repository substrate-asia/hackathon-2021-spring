import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import SkyePassTheme from '../../theme'

import SettingContentList from './SettingContentList'

const generate_style = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0
  }
})
const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function SettingContent(){
  const classes = useStyles();
  return (
		<main className={classes.content}>
      {SettingContentList()}
			{/* {AppContentMain()} */}
			{/* <div className={classes.drawerHeader} /> */}
		</main>
  );
}
