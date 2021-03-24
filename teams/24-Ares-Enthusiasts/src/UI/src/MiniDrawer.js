import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import NetworkCellSharpIcon from '@material-ui/icons/NetworkCellSharp';
import MonetizationOnSharpIcon from '@material-ui/icons/MonetizationOnSharp';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import pink from "@material-ui/core/colors/pink";
import { Switch, Route, Link, BrowserRouter, HashRouter} from "react-router-dom";
import Developer from './Developer';
import Network from './Network';
import PriceFeed from './PriceFeed';
import Hackathon from './Hackathon';
import Home from './Home';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function MiniDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Ares dapp store
          </Typography>
        </Toolbar>
      </AppBar>

      <HashRouter>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
            <ListItem button key={'Develper'} component={Link} to={"/Develper"}>
              <ListItemIcon> <DeveloperBoardIcon /> </ListItemIcon>
              <ListItemText primary={'Develper'} />
            </ListItem>
            <ListItem button key={'Network'} component={Link} to={"/Network"}>
              <ListItemIcon> <NetworkCellSharpIcon /> </ListItemIcon>
              <ListItemText primary={'Network'} />
            </ListItem>
            <ListItem button key={'PriceFeed'} component={Link} to={"/PriceFeed"}>
              <ListItemIcon> <MonetizationOnSharpIcon /> </ListItemIcon>
              <ListItemText primary={'PriceFeed'} />
            </ListItem>
            <ListItem button key={'Hackathon'} component={Link} to={"/Hackathon"}>
              <ListItemIcon> <AccountBalanceWalletIcon style={{ color: "pink" }}/> </ListItemIcon>
              <ListItemText primary={'Hackathon'} />
            </ListItem>
        </List>
      </Drawer>

        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/Develper" component={Developer} />
            <Route path="/Network" component={Network} />
            <Route path="/PriceFeed" component={PriceFeed} />
            <Route path="/Hackathon" component={Hackathon} />
          </Switch>
        </main>
      </HashRouter>
    </div>
  );
}
