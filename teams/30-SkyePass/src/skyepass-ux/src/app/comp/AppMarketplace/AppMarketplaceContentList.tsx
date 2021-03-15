import React from 'react';
import { Drawer, Grid, Typography, Table, TableBody, TableCell, 
TableContainer, TableHead, TableRow, Paper}
	from '@material-ui/core'
import { ipcRenderer } from 'electron'

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import SkyePassTheme from '../../theme'
import AppMarketplaceContentMain from './AppMarketplaceContentMain'

const mainWindowWidth = 800;

const StyledTableCell = withStyles((theme) => ({
	head: {
		backgroundColor: theme.palette.primary.dark,
		color: theme.palette.common.white,
	},
	body: {
		fontSize: 14,
	},
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.action.hover,
		},
	},
}))(TableRow);

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

export default function AppMarketplaceContentList(){
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
	const passwords = ipcRenderer.sendSync('db.readItem', { appId: 'password.skye.kiwi' })

	// React.useEffect(() => {
	// 	const passwords = ipcRenderer.sendSync('db.readItem', {appId: 'password.skye.kiwi'})
	// 	setState({
	// 		open: state.open,
	// 		data: passwords
	// 	})
	// })
	function createData(name, bundleId, category, stars, link) {
		return { name, bundleId, category, stars, link };
	}
	const rows = [
		createData('Eth Wallet', 'eth.wallet.skye.kiwi', 'Cryptocurrency', '82', 'Link'),
		createData('Polkadot Wallet', 'polkadot.wallet.skye.kiwi', 'Cryptocurrency', '82', 'Link'),
		createData('Google Voice', 'google.voice.skye.kiwi', 'Shared Account', '67', 'Link'),
		createData('WeChat Public', 'wechat.public.someteam.com', 'Shared Account', '75', 'Link'),
		createData('SSH Login Tool', 'ssh.login.skye.kiwi', 'Utility', '12', 'Link'),
		createData('GPG Utilites', 'gpg.utilities.oneteam.com', 'Privacy', '43', 'Link'),
	];

  return (
		<Grid container >
			<Grid item xs={4}>
				<Grid container className={classes.header}>
					<Grid item xs={8}>
						<Typography variant="h4">Marketplace</Typography>
					</Grid>
				</Grid>
			</Grid><br /><br /><br />
			<Grid item xs={12} style={{padding: 20}}>
				<TableContainer component={Paper}>
					<Table className={classes.table}>
						<TableHead>
							<TableRow>
								<StyledTableCell></StyledTableCell>
								<StyledTableCell>Application</StyledTableCell>
								<StyledTableCell align="center">Application ID</StyledTableCell>
								<StyledTableCell align="center">Category</StyledTableCell>
								<StyledTableCell align="center">Github Stars</StyledTableCell>
								<StyledTableCell align="center">Github Link</StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row) => (
								<StyledTableRow key={row.name}>
									<StyledTableCell align="center">
										<svg width="40" height="40" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
											<circle cx="22.5" cy="22.5" r="21.5" stroke="#6E6E6D" stroke-opacity="0.5" stroke-width="2" />
											<path fill-rule="evenodd" clip-rule="evenodd" d="M9.58334 22.5C9.58334 15.37 15.37 9.58334 22.5 9.58334C29.63 9.58334 35.4167 15.37 35.4167 22.5C35.4167 29.63 29.63 35.4167 22.5 35.4167C15.37 35.4167 9.58334 29.63 9.58334 22.5ZM23.7917 23.7917H28.9583V21.2083H23.7917V16.0417H21.2083V21.2083H16.0417V23.7917H21.2083V28.9583H23.7917V23.7917Z" fill="#6E6E6D" />
										</svg>
									</StyledTableCell>
									<StyledTableCell component="th" scope="row">
										{row.name}
									</StyledTableCell>
									<StyledTableCell align="center">{row.bundleId}</StyledTableCell>
									<StyledTableCell align="center">{row.category}</StyledTableCell>
									<StyledTableCell align="center">{row.stars}</StyledTableCell>
									<StyledTableCell align="center">{row.link}</StyledTableCell>
								</StyledTableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Drawer anchor="right" open={state.open} onClose={() => setState({open: false})}>
					{AppMarketplaceContentMain()}
				</Drawer>
			</Grid>
		</Grid>
  );
}
