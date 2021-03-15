import React from 'react';
import clsx from 'clsx'
import PropTypes from 'prop-types';
import {
	CssBaseline, Divider, Drawer, Avatar, List, ListItem, Grid,
	ListSubheader, ListItemIcon, ListItemText, Typography
}
	from '@material-ui/core'
import { ipcRenderer } from 'electron'

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import SkyePassTheme from '../../theme'
import PolkadotContentMain from './PolkadotContentMain'

const mainWindowWidth = 800;

const generate_style = (theme) => ({
	root: {
		display: 'flex',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
		marginLeft: 0,
	},
	col: {
		padding: theme.spacing(3),
		paddingTop: theme.spacing(0),
		height: window.innerHeight
	},
	left: {
		borderRight: `3px solid ${theme.palette.primary.main}`,
	},
	right: {

	},
	header: {
		marginBottom: 30
	},
	scrollable: {
		height: window.innerHeight,
		overflowY: "auto"
	},
	listItem: {
		borderBottom: `1px solid ${theme.palette.primary.main_border}`,
	},
})

const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function PolkadotContentList() {
	const classes = useStyles();
	const [state, setState] = React.useState({
		open: false
	});

	const toggleDrawer = (open) => (event) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return;
		}
		setState({ ...state, open: open });
	};
	// const passwords = ipcRenderer.sendSync('db.readItem', { appId: 'password.skye.kiwi' })

	const polkadot = [{
		name: "Jupiter Testnet",
		address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
		defaultNetwork: 'wss://ws.jupiter-poa.patract.cn'
	}, {
		name: "Canvas",
		address: "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
		defaultNetwork: 'wss://canvas-rpc.parity.io'
	}, {
		name: "Test Account",
		address: "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
		defaultNetwork: 'wss://127.0.0.1:9944'
	}]
	// React.useEffect(() => {
	// 	const passwords = ipcRenderer.sendSync('db.readItem', {appId: 'password.skye.kiwi'})
	// 	setState({
	// 		open: state.open,
	// 		data: passwords
	// 	})
	// })

	return (
		<Grid container>
			<Grid item xs={4}>
				<Grid container className={classes.header}>
					<Grid item xs={8}>
						<Typography variant="h4">Polkadot</Typography>
					</Grid>
					<Grid item xs={4}>
						<svg width="40" height="40" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="22.5" cy="22.5" r="21.5" stroke="#6E6E6D" stroke-opacity="0.5" stroke-width="2" />
							<path fill-rule="evenodd" clip-rule="evenodd" d="M9.58334 22.5C9.58334 15.37 15.37 9.58334 22.5 9.58334C29.63 9.58334 35.4167 15.37 35.4167 22.5C35.4167 29.63 29.63 35.4167 22.5 35.4167C15.37 35.4167 9.58334 29.63 9.58334 22.5ZM23.7917 23.7917H28.9583V21.2083H23.7917V16.0417H21.2083V21.2083H16.0417V23.7917H21.2083V28.9583H23.7917V23.7917Z" fill="#6E6E6D" />
						</svg>
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				<List classNames={classes.listContainer}>
					{polkadot.map((item, index) => {
						return <ListItem button className={classes.listItem} key={index}
							onClick={() => setState({ open: true, item: item })}>
							<ListItemIcon>
								<ChevronRightIcon />
							</ListItemIcon>
							<ListItemText primary={item.name} secondary={item.address} />
						</ListItem>
					})}
				</List>
				<Drawer anchor="right" open={state.open} onClose={() => setState({ open: false })}>
					{PolkadotContentMain(state.item)}
				</Drawer>
			</Grid>
		</Grid>
	);
}
