import React from 'react';
import clsx from 'clsx'
import PropTypes from 'prop-types';
import {
	CssBaseline, Divider, Drawer, Avatar, List, ListItem, Grid, Button, Paper,
	ListSubheader, ListItemIcon, ListItemText, Typography, TextField} 
	from '@material-ui/core'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FingerprintOutlinedIcon from '@material-ui/icons/FingerprintOutlined';

const md = require('markdown-it')('commonmark')

import ReactHTMLParser from 'react-html-parser'
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import SkyePassTheme from '../../theme'

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
		width: "60%"
	}, button: {
		marginLeft: theme.spacing(3)
	}, title: {
		
	}, markdown: {
		width: "100%",
		padding: theme.spacing(5)
		// border: `1px solid ${theme.palette.primary.main_border}`,
	}
})

const useStyles = makeStyles(generate_style(SkyePassTheme));

export default function NotesContentMain(props){
	const classes = useStyles();
	let [content, setContent] = React.useState(props ? props.content : "")


	if (props) {
		return (<Grid container className={classes.main_container}>
			<Grid container>
				<Grid item xs={1} />
				<Grid item xs={10} className={classes.box}>
					<Typography variant="h4" className={classes.title}>{props.name}</Typography><br/>
					<Grid item xs={12} id="markdown-preview">
						<Paper className={classes.markdown} variant="outlined" style={{
							minHeight: 500
						}} >
							{ReactHTMLParser(md.render((content === {} | typeof content == 'string') ? 
									content : props.content))}
						</Paper>
					</Grid>
					<Grid item xs={12} id="markdown-editor" style={{
						display: 'none'
					}}>
						<TextField
							label="Notes" multiline
							rows={30} value={content ? content : props.content}
							style={{ width: "100%", margin: 10 }}
							onChange={evt => {setContent(evt.target.value)}}
							defaultValue={props.content} variant="outlined" />
					</Grid>
					<br />
					<Button size="large" className={classes.button} color="primary" id='id-switch-button' variant="outlined"
						onClick={() => {
							let preview_display = document.getElementById('markdown-preview')
							let editor_display = document.getElementById('markdown-editor')
							if (preview_display?.style.display == 'none') {
								preview_display.style.display = 'block'
								editor_display.style.display = 'none'
								document.querySelector('#id-switch-button>span').innerHTML = " Edit "
							} else {
								preview_display.style.display = 'none'
								editor_display.style.display = 'block'
								document.querySelector('#id-switch-button>span').innerHTML = " Preview "
							}

						}}> Edit </Button>
					<Button size="large" className={classes.button} color="primary" variant="contained"
						onClick={() => { console.log("submit") }}>
						Save
					</Button>
				</Grid>
			</Grid>
		</Grid>);
	}
	else return <></>
}
