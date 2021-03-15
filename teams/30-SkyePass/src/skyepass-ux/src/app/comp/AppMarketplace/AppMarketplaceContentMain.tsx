import React from 'react';
import clsx from 'clsx'
import PropTypes from 'prop-types';
import {
	CssBaseline, Divider, Drawer, Avatar, List, ListItem, Grid, Button,
	ListSubheader, ListItemIcon, ListItemText, Typography, TextField} 
	from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';



import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import SkyePassTheme from '../../theme'
import AppSideMenu from '../AppSideMenu'

const mainWindowWidth = 800;

const generate_style = (theme) => ({
	main_container: {
		width: mainWindowWidth,
	}, 
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
	},icon: {
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



export default function AppMarketplaceContentMain(props){
  const classes = useStyles();
	// const isInitialMount = React.useRef(true);
	let [state, setState] = React.useState({...props})
	
	// React.useState({
	// 	name: props.name, account: props.account,
	// 	password: props.password, OTP: props.OTP
	// })

	// React.useEffect(() => {
	// 	console.log("Updated")
	// })

	if (props) {
		console.log(state)
		const username = () => {
			return <TextField label="Email/Username" defaultValue={props.account} value={state.account} onChange={evt => {
				let newState = state
				newState.account = evt.target.value
				setState(newState)
			}}
				variant="outlined" size="small" className={classes.textField} />
		}
		const password = () => {
			return <TextField label="Password" defaultValue={props.password} value={state.password} onChange={evt => {
				let newState = state
				newState.password = evt.target.value
				setState(newState)
			}}
				variant="outlined" type="password" size="small" className={classes.textField} />
		}
		const password_security = () => {
			return <div style={{ color: "green" }}>
				Strong Password&nbsp;&nbsp;&nbsp;&nbsp;
			<ThumbUpIcon color="success" style={{ marginBottom: -5 }} />
			</div>
		}
		const website = () => {
			return <Typography>{state.name}</Typography>
		}

		const items = [
			{ label: "Email/Username", render: username },
			{ label: "Password", render: password },
			{ label: "Password Security", render: password_security },
			{ label: "Website", render: website },
			// {label: "OTP", filed: <TextField label = "Email/Username" variant="outlined" size="small" className={classes.textField}/>},
		]
		return (<Grid container className={classes.main_container}>
			<Grid container>
				{/* <Grid item xs={12} className={classes.actionBar}>
					<svg className={classes.actionIcon} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M30.0735 10.75C29.761 10.75 29.436 10.875 29.1985 11.1125L26.911 13.4L31.5985 18.0875L33.886 15.8C34.3735 15.3125 34.3735 14.525 33.886 14.0375L30.961 11.1125C30.711 10.8625 30.3985 10.75 30.0735 10.75ZM25.5735 18.275L26.7235 19.425L15.3985 30.75H14.2485V29.6L25.5735 18.275ZM11.7485 28.5625L25.5735 14.7375L30.261 19.425L16.436 33.25H11.7485V28.5625Z" fill="#6E6E6D" />
						<circle cx="22.5" cy="22.5" r="21.5" stroke="#6E6E6D" stroke-opacity="0.5" stroke-width="2" />
					</svg>
					<svg className={classes.actionIcon} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M27.05 28.1125C27.7 27.525 28.55 27.15 29.5 27.15C31.5125 27.15 33.15 28.7875 33.15 30.8C33.15 32.8125 31.5125 34.45 29.5 34.45C27.4875 34.45 25.85 32.8125 25.85 30.8C25.85 30.525 25.8875 30.25 25.95 29.9875L17.05 24.7875C16.375 25.4125 15.4875 25.8 14.5 25.8C12.425 25.8 10.75 24.125 10.75 22.05C10.75 19.975 12.425 18.3 14.5 18.3C15.4875 18.3 16.375 18.6875 17.05 19.3125L25.8625 14.175C25.8 13.8875 25.75 13.6 25.75 13.3C25.75 11.225 27.425 9.55002 29.5 9.55002C31.575 9.55002 33.25 11.225 33.25 13.3C33.25 15.375 31.575 17.05 29.5 17.05C28.5125 17.05 27.625 16.6625 26.95 16.0375L18.1375 21.175C18.2 21.4625 18.25 21.75 18.25 22.05C18.25 22.35 18.2 22.6375 18.1375 22.925L27.05 28.1125ZM30.75 13.3C30.75 12.6125 30.1875 12.05 29.5 12.05C28.8125 12.05 28.25 12.6125 28.25 13.3C28.25 13.9875 28.8125 14.55 29.5 14.55C30.1875 14.55 30.75 13.9875 30.75 13.3ZM14.5 23.3C13.8125 23.3 13.25 22.7375 13.25 22.05C13.25 21.3625 13.8125 20.8 14.5 20.8C15.1875 20.8 15.75 21.3625 15.75 22.05C15.75 22.7375 15.1875 23.3 14.5 23.3ZM28.25 30.825C28.25 31.5125 28.8125 32.075 29.5 32.075C30.1875 32.075 30.75 31.5125 30.75 30.825C30.75 30.1375 30.1875 29.575 29.5 29.575C28.8125 29.575 28.25 30.1375 28.25 30.825Z" fill="#6E6E6D" />
						<circle cx="22.5" cy="22.5" r="21.5" stroke="#6E6E6D" stroke-opacity="0.5" stroke-width="2" />
					</svg>
					<svg className={classes.actionIcon} viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="22.5" cy="22.5" r="21.5" stroke="#6E6E6D" stroke-opacity="0.5" stroke-width="2" />
						<path fill-rule="evenodd" clip-rule="evenodd" d="M25.125 10.75H18.875L17.625 12H13.25V14.5H30.75V12H26.375L25.125 10.75ZM27 18.25V30.75H17V18.25H27ZM14.5 15.75H29.5V30.75C29.5 32.125 28.375 33.25 27 33.25H17C15.625 33.25 14.5 32.125 14.5 30.75V15.75Z" fill="#6E6E6D" />
					</svg>
				</Grid> */}
				<Grid item xs={1} />
				<Grid item xs={10} className={classes.box}>
					<FingerprintOutlinedIcon className={classes.icon} /><br /><br /><br />
					{/* <Typography className={classes.title}>{state.name}</Typography> */}
					<List>
						{items.map((it, index) => {
							return <ListItem className={classes.listItem} key={index} >
								<ListItemText primary={it.label} />
								{it.render()}
							</ListItem>
						})}
					</List>
					<br /><br />
					<List>
						<ListItem>
							<Grid container justify="flex-end" spacing={2}>
								<Grid item>
									<Button size="large" className={classes.button} color="primary" variant="contained"
										onClick={async () => {
											console.log("submit")
										}}>
										DELETE!
									</Button>
								</Grid>
								<Grid item>
									<Button size="large" className={classes.button} color="primary" variant="outlined"
										onClick={async () => {
											console.log("submit")
										}}>
										Save
									</Button>
								</Grid>
							</Grid>
						</ListItem>
					</List>
				</Grid>

				<Grid item xs={1} />
				<Grid item xs={1} />
				<Grid item xs={10} className={classes.box_share}>
					<List>
						<ListItem>
							<Typography>Shared With:</Typography>
						</ListItem>
						
						<ListItem>
							<Typography className={classes.share_addr}>5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY</Typography>
						</ListItem>
						<ListItem>
							<Divider />
							<Typography className={classes.share_addr}>5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY</Typography>
						</ListItem>
						<ListItem>
							<Divider />
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
				</Grid>
			</Grid>
		</Grid>);
	}
	else return <></>
}
