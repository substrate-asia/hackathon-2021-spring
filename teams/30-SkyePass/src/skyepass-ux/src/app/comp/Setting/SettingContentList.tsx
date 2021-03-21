import React from 'react';
import {
	Button, Drawer, Grid, Typography, List, ListItem, ListItemText, TextField, Select, MenuItem, FormControl, InputLabel}
	from '@material-ui/core'
import { ipcRenderer } from 'electron'

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import SkyePassTheme from '../../theme'

import SettingContentMain from './SettingContentMain'

const generate_style = (theme) => ({
	box: {
		padding: theme.spacing(3),
		paddingTop: theme.spacing(16),
		alignItems: "center"
	},
	box_share: {
		padding: theme.spacing(3),
		alignItems: "center"
	},
	listItem: {
		borderBottom: `1px solid ${theme.palette.primary.main_border}`,
		height: 60,
		textAlign: "left"
	}, textItem: {
		textAlign: "right"
	}, icon: {
		fontSize: 80,
		marginLeft: "42%"
	}, textField: {
		width: 380,
	},
	actionBar: {
		textAlign: "right"
	},
	actionIcon: {
		padding: theme.spacing(1),
		height: 50
	}, share_addr: {
		borderBottom: `1px solid ${theme.palette.primary.main_border}`,
	}, share_addr_id: {
		color: theme.palette.primary.dark,
		borderBottom: `1px solid ${theme.palette.primary.main_border}`,
	}, text_field: {
		marginLeft: theme.spacing(4),
		width: "65%"
	}
})

const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function SettingContentList(){
  const classes = useStyles();
	const [state, setState] = React.useState({
    open: false,
		auto_lock_period: "1 Hour"
  });

	const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, open: open });
  };

  return (
		<Grid container >
			<Grid item xs={4}>
				<Grid container className={classes.header}>
					<Grid item xs={8}>
						<Typography variant="h4">Setting</Typography>
					</Grid>
				</Grid>
			</Grid><br /><br /><br />
			<Grid item xs={12} style={{padding: 20}}>

				<List>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Address: "} />
						<ListItemText className={classes.textItem} primary={"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"} />
					</ListItem>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Vault Name: "} />
						<ListItemText className={classes.textItem} primary={"Test Vault"} />
					</ListItem>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Vault Id: "} />
						<ListItemText className={classes.textItem} primary={"0x99e9d85137db46ef"} />
					</ListItem>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Your Role: "} />
						<ListItemText className={classes.textItem} primary={"Owner"} />
					</ListItem>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Import Passwords"} />
						<Button size="large" className={classes.button} color="primary" variant="outlined"
							onClick={() => {
								console.log("submit")
							}}>
							Go!
						</Button>
					</ListItem>
					<ListItem className={classes.listItem}>
						<ListItemText primary={"Export Passwords"} />
						<Button size="large" className={classes.button} color="primary" variant="outlined"
							onClick={() => {
								console.log("submit")
							}}>
							Go!
						</Button>
					</ListItem>
				</List>
				<List>
					<ListItem>
						<ListItemText primary={"Auto Lock Period: "} />
					<FormControl variant="outlined" style={{ width: "40%", marginRight: 30}}>
						<InputLabel>Auto Lock Period</InputLabel>
						<Select
							value={state.auto_lock_period}
							onChange={evt => {
								setState({
									open: state.open,
									auto_lock_period: evt.target.value
								})
							}}
							label="Auto Lock Period"
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							<MenuItem value={"1 Hour"}>1 Hour</MenuItem>
							<MenuItem value={"3 Hour"}>3 Hour</MenuItem>
							<MenuItem value={"Never"}>Never</MenuItem>
						</Select>
					</FormControl>
					<Button size="large" className={classes.button} color="primary" variant="outlined"
						onClick={() => {
							console.log("submit")
						}}>
							Save
						</Button><br /><br /><br /><br />
					</ListItem>
					<ListItem>
						<br /><br />
						<Typography>Shared With:</Typography>
					</ListItem>

					<ListItem>
						<Typography className={classes.share_addr}>5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY</Typography>
					</ListItem>
					<ListItem>
						<Typography className={classes.share_addr}>5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY</Typography>
					</ListItem>
					<ListItem>
						<Typography className={classes.share_addr_id}>@songzhou (5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty)</Typography>
					</ListItem>
					<ListItem>
						<Button size="large" className={classes.button} color="primary" variant="outlined"
							onClick={async () => { console.log("submit") }}>
							Share with
							</Button>
						<TextField className={classes.text_field}
							value={state.new_share} onChange={(evt) => {
								setState({
									...state,
									new_share: evt.target.value
								})
							}}
							label="Share With" variant="outlined" />
					</ListItem>
				</List>
				<Drawer anchor="right" open={state.open} onClose={() => setState({open: false})}>
					{SettingContentMain()}
				</Drawer>
			</Grid>
		</Grid>
  );
}
